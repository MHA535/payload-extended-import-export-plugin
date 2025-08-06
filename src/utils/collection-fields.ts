import type { Collection, Field } from 'payload'

import type { CollectionField } from '../types/import.js'

/**
 * Извлекает поля из конфигурации коллекции Payload
 */
export const extractCollectionFields = (
  collectionConfig: Collection['config'],
): CollectionField[] => {
  const fields: CollectionField[] = []

  const processField = (field: Field, prefix = ''): void => {
    // Пропускаем служебные поля
    if (field.type === 'tabs' || field.type === 'collapsible' || field.type === 'row') {
      // Для составных полей обрабатываем их дочерние поля
      if ('fields' in field && Array.isArray(field.fields)) {
        field.fields.forEach((subField) => processField(subField, prefix))
      }
      return
    }

    // Пропускаем поля без имени
    if (!('name' in field) || !field.name) {
      return
    }

    const fieldName = prefix ? `${prefix}.${field.name}` : field.name

    // Определяем label
    let label = field.name
    if ('label' in field && field.label) {
      if (typeof field.label === 'string') {
        label = field.label
      } else if (typeof field.label === 'object' && field.label.en) {
        label = field.label.en
      }
    }
    // Гарантируем, что label не пустой
    if (!label || label.trim() === '') {
      label = field.name
    }

    // Определяем тип поля
    let typeDescription: string = field.type
    let relationTo: string | undefined
    let hasMany: boolean | undefined

    if (field.type === 'relationship' && 'relationTo' in field) {
      relationTo = Array.isArray(field.relationTo) ? field.relationTo.join(' | ') : field.relationTo
      typeDescription = `relationship (${relationTo})`
      hasMany = 'hasMany' in field ? Boolean(field.hasMany) : false
    } else if (field.type === 'select' && 'options' in field) {
      typeDescription = `select`
    } else if (field.type === 'upload' && 'relationTo' in field) {
      relationTo = field.relationTo
      typeDescription = `upload (${relationTo})`
      hasMany = 'hasMany' in field ? Boolean(field.hasMany) : false
    }

    // Определяем обязательность
    // Поле считается обязательным только если:
    // 1. Явно помечено как required: true
    // 2. И при этом НЕ имеет defaultValue
    const hasRequired = 'required' in field ? Boolean(field.required) : false
    const hasDefaultValue = 'defaultValue' in field && field.defaultValue !== undefined
    const required = hasRequired && !hasDefaultValue

    // Генерируем пример значения
    const example = generateFieldExample(field)

    const fieldData: CollectionField = {
      name: fieldName,
      type: typeDescription,
      example,
      hasDefaultValue,
      label,
      required,
    }

    // Добавляем дополнительную информацию для upload и relationship полей
    if (relationTo) {
      fieldData.relationTo = relationTo
    }
    if (hasMany !== undefined) {
      fieldData.hasMany = hasMany
    }

    fields.push(fieldData)

    // Обрабатываем вложенные поля для group и blocks
    if (field.type === 'group' && 'fields' in field) {
      field.fields.forEach((subField) => processField(subField, fieldName))
    }
  }

  // Добавляем поле id, которое автоматически создается Payload
  fields.unshift({
    name: 'id',
    type: 'text',
    example: 'Уникальный идентификатор записи',
    hasDefaultValue: true, // ID создается автоматически
    label: 'ID',
    required: false, // Не требуется при создании, но может использоваться для обновления
  })

  // Обрабатываем все поля коллекции
  collectionConfig.fields.forEach((field) => processField(field))

  return fields
}

/**
 * Генерирует пример значения для поля
 */
const generateFieldExample = (field: Field): string => {
  // Если есть значение по умолчанию, показываем его
  if ('defaultValue' in field && field.defaultValue !== undefined) {
    if (
      typeof field.defaultValue === 'string' ||
      typeof field.defaultValue === 'number' ||
      typeof field.defaultValue === 'boolean'
    ) {
      return String(field.defaultValue)
    }
    return '[auto]' // Для сложных значений по умолчанию
  }

  switch (field.type) {
    case 'checkbox':
      return 'true'
    case 'code':
      return '{ "key": "value" }'
    case 'date':
      return '2024-01-01'

    case 'email':
      return 'user@example.com'

    case 'json':
      return '{ "data": {} }'
    case 'number':
      if ('name' in field) {
        if (field.name === 'price' || field.name === 'cost') {
          return '1000'
        }
        if (field.name === 'quantity' || field.name === 'stock') {
          return '50'
        }
      }
      return '123'
    case 'radio':
      if ('options' in field && Array.isArray(field.options) && field.options.length > 0) {
        const firstOption = field.options[0]
        return typeof firstOption === 'string' ? firstOption : firstOption.value
      }
      return 'option1'
    case 'relationship':
      if ('relationTo' in field) {
        const relationTo = Array.isArray(field.relationTo)
          ? field.relationTo.join(' | ')
          : field.relationTo
        return `ID записи из ${relationTo}`
      }
      return 'relationship-id'
    case 'richText':
      return 'Форматированный текст'

    case 'select':
      if ('options' in field && Array.isArray(field.options) && field.options.length > 0) {
        const firstOption = field.options[0]
        return typeof firstOption === 'string' ? firstOption : firstOption.value
      }
      return 'option1'
    case 'text':
      if ('name' in field) {
        if (field.name === 'title' || field.name === 'name') {
          return 'Название товара'
        }
        if (field.name === 'slug') {
          return 'nazvanie-tovara'
        }
        if (field.name === 'sku') {
          return 'SKU-001'
        }
        if (field.name === 'email') {
          return 'user@example.com'
        }
      }
      return 'Текстовое значение'

    case 'textarea':
      return 'Длинное текстовое описание...'

    case 'upload':
      if ('relationTo' in field) {
        if ('hasMany' in field && field.hasMany) {
          return 'https://example.com/image1.jpg,https://example.com/image2.jpg'
        }
        return 'https://example.com/image.jpg'
      }
      return 'image.jpg'

    default:
      return 'Значение'
  }
}
