import type { Endpoint, PayloadRequest } from 'payload'

// Функция для конвертации строки в формат Lexical richText
function convertStringToLexicalFormat(text: string) {
  if (!text || typeof text !== 'string') {
    return null
  }

  // Разбиваем текст на параграфы по переносам строк
  const paragraphs = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  // Если нет параграфов, возвращаем пустую структуру
  if (paragraphs.length === 0) {
    return {
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [],
            direction: null,
            format: '',
            indent: 0,
            version: 1,
          },
        ],
        direction: null,
        format: '',
        indent: 0,
        version: 1,
      },
    }
  }

  // Создаем структуру Lexical для каждого параграфа
  const children = paragraphs.map((paragraph) => ({
    type: 'paragraph',
    children: [
      {
        type: 'text',
        detail: 0,
        format: 0,
        mode: 'normal',
        style: '',
        text: paragraph,
        version: 1,
      },
    ],
    direction: null,
    format: '',
    indent: 0,
    version: 1,
  }))

  return {
    root: {
      type: 'root',
      children,
      direction: null,
      format: '',
      indent: 0,
      version: 1,
    },
  }
}

export interface ImportRequest {
  collection: string
  data: Record<string, any>[]
  settings: {
    compareField?: string
    fieldMappings: { collectionField: string; csvField: string }[]
    locale?: string
    mode: 'create' | 'update' | 'upsert'
  }
}

export interface ImportResponse {
  created: number
  details?: any[]
  errors: string[]
  message: string
  success: boolean
  updated: number
}

export const importEndpoint: Endpoint = {
  handler: async (req: PayloadRequest) => {
    try {
      // Читаем body как ReadableStream
      let requestData: ImportRequest

      if (req.body) {
        const reader = req.body.getReader()
        const decoder = new TextDecoder()
        let bodyText = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          bodyText += decoder.decode(value, { stream: true })
        }

        requestData = JSON.parse(bodyText) as ImportRequest
      } else {
        throw new Error('Не удается получить данные из запроса')
      }

      const { collection, data, settings } = requestData
      const { compareField, fieldMappings, locale, mode } = settings

      // Валидация входных данных
      if (!collection || !data || !Array.isArray(data)) {
        return Response.json(
          {
            created: 0,
            errors: ['Отсутствуют обязательные поля: collection, data'],
            message: 'Некорректные данные для импорта',
            success: false,
            updated: 0,
          },
          { status: 400 },
        )
      }

      let created = 0
      let updated = 0
      const errors: string[] = []
      const details: any[] = []

      // Маппинг данных согласно настройкам полей
      const mappedData = data
        .map((row, index) => {
          try {
            const mapped: Record<string, any> = {}

            // Получаем конфигурацию коллекции для определения типов полей
            const collectionConfig = req.payload.config.collections?.find(
              (col) => col.slug === collection,
            )

            // Создаем карту типов полей для быстрого доступа
            const fieldTypeMap = new Map<string, string>()
            if (collectionConfig) {
              const mapFieldTypes = (fields: any[], prefix = '') => {
                fields.forEach((field) => {
                  if (!field.name) return
                  const fieldName = prefix ? `${prefix}.${field.name}` : field.name
                  fieldTypeMap.set(fieldName, field.type)

                  // Обрабатываем вложенные поля
                  if (field.fields && Array.isArray(field.fields)) {
                    mapFieldTypes(field.fields, fieldName)
                  }
                })
              }
              mapFieldTypes(collectionConfig.fields)
            }

            fieldMappings.forEach(({ collectionField, csvField }) => {
              if (row[csvField] !== undefined && row[csvField] !== '') {
                // Обработка специальных типов полей
                let value = row[csvField]

                // Получаем тип поля
                const fieldType = fieldTypeMap.get(collectionField)

                // Обработка richText полей
                if (fieldType === 'richText') {
                  value = convertStringToLexicalFormat(value)
                }
                // Для relationship полей, если передается строка, оставляем как есть
                // Payload сам попытается найти связанную запись
                else if (collectionField === 'categories' && typeof value === 'string') {
                  // Для categories можем попробовать найти по slug или создать
                  value = value.split(',').map((cat: string) => cat.trim())
                }

                mapped[collectionField] = value
              }
            })

            // Добавляем значения по умолчанию для обязательных полей
            if (collectionConfig) {
              // Обрабатываем все поля коллекции
              const processFields = (fields: any[], prefix = '') => {
                fields.forEach((field) => {
                  if (!field.name) return

                  const fieldName = prefix ? `${prefix}.${field.name}` : field.name

                  // Проверяем, нужно ли заполнить поле
                  const isRequired = field.required === true
                  const hasDefaultValue = field.defaultValue !== undefined
                  const isNotMapped = mapped[fieldName] === undefined

                  if (isRequired && hasDefaultValue && isNotMapped) {
                    // Если defaultValue это функция
                    if (typeof field.defaultValue === 'function') {
                      try {
                        mapped[fieldName] = field.defaultValue({
                          user: req.user,
                        })
                      } catch (error) {
                        console.warn(`Ошибка при вычислении defaultValue для ${fieldName}:`, error)
                      }
                    } else {
                      // Если defaultValue это значение
                      mapped[fieldName] = field.defaultValue
                    }
                  }

                  // Обрабатываем вложенные поля для group, tabs, etc.
                  if (field.fields && Array.isArray(field.fields)) {
                    processFields(field.fields, fieldName)
                  }
                })
              }

              processFields(collectionConfig.fields)
            }

            return { index, mapped, original: row }
          } catch (error) {
            errors.push(`Ошибка маппинга строки ${index + 1}: ${error}`)
            return null
          }
        })
        .filter(Boolean)

      // Обработка данных согласно выбранному режиму
      for (const item of mappedData) {
        if (!item) continue

        try {
          if (mode === 'create') {
            // Только создание новых записей
            const result = await req.payload.create({
              collection: collection as any,
              data: item.mapped,
              locale: (locale || req.locale || 'en') as 'bg' | 'en' | 'ru' | 'uk',
            })
            created++
            details.push({
              id: result.id,
              action: 'created',
              data: item.mapped,
            })
          } else if (mode === 'update') {
            // Только обновление существующих записей
            if (!compareField || !item.mapped[compareField]) {
              errors.push(
                `Строка ${item.index + 1}: отсутствует поле для сравнения "${compareField}"`,
              )
              continue
            }

            const existing = await req.payload.find({
              collection: collection as any,
              limit: 1,
              locale: (locale || req.locale || 'en') as 'bg' | 'en' | 'ru' | 'uk',
              where: {
                [compareField]: {
                  equals: item.mapped[compareField],
                },
              },
            })

            if (existing.docs.length > 0) {
              const result = await req.payload.update({
                id: existing.docs[0].id,
                collection: collection as any,
                data: item.mapped,
                locale: (locale || req.locale || 'en') as 'bg' | 'en' | 'ru' | 'uk',
              })
              updated++
              details.push({
                id: existing.docs[0].id,
                action: 'updated',
                data: item.mapped,
              })
            } else {
              errors.push(
                `Строка ${item.index + 1}: запись с ${compareField}="${item.mapped[compareField]}" не найдена`,
              )
            }
          } else if (mode === 'upsert') {
            // Создание или обновление
            if (compareField && item.mapped[compareField]) {
              const existing = await req.payload.find({
                collection: collection as any,
                limit: 1,
                locale: (locale || req.locale || 'en') as 'bg' | 'en' | 'ru' | 'uk',
                where: {
                  [compareField]: {
                    equals: item.mapped[compareField],
                  },
                },
              })

              if (existing.docs.length > 0) {
                const result = await req.payload.update({
                  id: existing.docs[0].id,
                  collection: collection as any,
                  data: item.mapped,
                  locale: (locale || req.locale || 'en') as 'bg' | 'en' | 'ru' | 'uk',
                })
                updated++
                details.push({
                  id: existing.docs[0].id,
                  action: 'updated',
                  data: item.mapped,
                })
              } else {
                const result = await req.payload.create({
                  collection: collection as any,
                  data: item.mapped,
                  locale: (locale || req.locale || 'en') as 'bg' | 'en' | 'ru' | 'uk',
                })
                created++
                details.push({
                  id: result.id,
                  action: 'created',
                  data: item.mapped,
                })
              }
            } else {
              // Если нет поля для сравнения, просто создаем
              const result = await req.payload.create({
                collection: collection as any,
                data: item.mapped,
                locale: (locale || req.locale || 'en') as 'bg' | 'en' | 'ru' | 'uk',
              })
              created++
              details.push({
                id: result.id,
                action: 'created',
                data: item.mapped,
              })
            }
          }
        } catch (error: any) {
          errors.push(`Строка ${item.index + 1}: ${error.message || error}`)
        }
      }

      const response: ImportResponse = {
        created,
        details: process.env.NODE_ENV === 'development' ? details : undefined,
        errors,
        message: `Импорт завершен: создано ${created}, обновлено ${updated} записей`,
        success: true,
        updated,
      }

      return Response.json(response)
    } catch (error: any) {
      console.error('Ошибка импорта:', error)
      const response: ImportResponse = {
        created: 0,
        errors: [error.message || 'Неизвестная ошибка'],
        message: 'Внутренняя ошибка сервера',
        success: false,
        updated: 0,
      }
      return Response.json(response, { status: 500 })
    }
  },
  path: '/import',

  method: 'post',
}
