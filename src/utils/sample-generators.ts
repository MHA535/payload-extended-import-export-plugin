import { CollectionField } from '../types/import.js'

/**
 * Создает пример файла CSV на основе полей коллекции
 */
export const generateSampleCSV = (fields: CollectionField[]): string => {
  // Заголовки
  const headers = fields.map((field) => field.name)

  // Примеры данных
  const sampleRows = [
    fields.map((field) => field.example || ''),
    fields.map((field) => generateSampleValue(field)),
    fields.map((field) => generateSampleValue(field)),
  ]

  // Формируем CSV
  const csvLines = [
    headers.join(','),
    ...sampleRows.map((row) => row.map((value) => `"${value}"`).join(',')),
  ]

  return csvLines.join('\n')
}

/**
 * Создает пример файла JSON на основе полей коллекции
 */
export const generateSampleJSON = (fields: CollectionField[]): string => {
  const sampleObjects = [
    createSampleObject(fields, 1),
    createSampleObject(fields, 2),
    createSampleObject(fields, 3),
  ]

  return JSON.stringify(sampleObjects, null, 2)
}

/**
 * Создает один объект-пример
 */
const createSampleObject = (fields: CollectionField[], index: number) => {
  const obj: Record<string, any> = {}

  fields.forEach((field) => {
    obj[field.name] = generateSampleValue(field, index)
  })

  return obj
}

/**
 * Генерирует пример значения для поля
 */
const generateSampleValue = (field: CollectionField, index = 1): string => {
  const date = new Date()
  const selectOptions = ['published', 'draft', 'archived']
  switch (field.type) {
    case 'checkbox':
      return index % 2 === 0 ? 'true' : 'false'

    case 'date':
      date.setDate(date.getDate() + index)
      return date.toISOString().split('T')[0]
    case 'number':
      if (field.name.includes('price') || field.name.includes('cost')) {
        return String(1000 * index)
      }
      if (field.name.includes('quantity') || field.name.includes('stock')) {
        return String(10 + index * 5)
      }
      return String(index)

    case 'select':
      return selectOptions[index % selectOptions.length]

    case 'text':
      if (field.name.includes('title') || field.name.includes('name')) {
        return `Товар ${index}`
      }
      if (field.name.includes('slug')) {
        return `tovar-${index}`
      }
      if (field.name.includes('sku')) {
        return `SKU-${String(index).padStart(3, '0')}`
      }
      return field.example || `Значение ${index}`

    default:
      return field.example || `Значение ${index}`
  }
}

/**
 * Получает рекомендации по полям для сопоставления
 */
export const getFieldMappingRecommendations = (
  csvHeaders: string[],
  collectionFields: CollectionField[],
): Array<{
  confidence: number
  csvField: string
  recommendedField: string
}> => {
  const recommendations: Array<{
    confidence: number
    csvField: string
    recommendedField: string
  }> = []

  // Фильтруем только валидные заголовки
  const validHeaders = csvHeaders.filter(
    (header) => header && typeof header === 'string' && header.trim() !== '',
  )

  validHeaders.forEach((csvHeader) => {
    let bestMatch: { confidence: number; field: string } = {
      confidence: 0,
      field: '',
    }

    collectionFields.forEach((collectionField) => {
      const confidence = calculateFieldSimilarity(csvHeader, collectionField)
      if (confidence > bestMatch.confidence) {
        bestMatch = { confidence, field: collectionField.name }
      }
    })

    if (bestMatch.confidence > 0.3) {
      // Порог уверенности
      recommendations.push({
        confidence: bestMatch.confidence,
        csvField: csvHeader,
        recommendedField: bestMatch.field,
      })
    }
  })

  return recommendations.sort((a, b) => b.confidence - a.confidence)
}

/**
 * Вычисляет схожесть между именем поля CSV и полем коллекции
 */
const calculateFieldSimilarity = (csvField: string, collectionField: CollectionField): number => {
  // Проверяем входные данные
  if (!csvField || !collectionField.name) {
    return 0
  }

  const csvLower = csvField.toLowerCase()
  const fieldLower = collectionField.name.toLowerCase()
  const labelLower = (collectionField.label || collectionField.name).toLowerCase()

  // Точное совпадение
  if (csvLower === fieldLower || csvLower === labelLower) {
    return 1.0
  }

  // Частичное совпадение в названии
  if (fieldLower.includes(csvLower) || csvLower.includes(fieldLower)) {
    return 0.8
  }

  // Частичное совпадение в label
  if (labelLower.includes(csvLower) || csvLower.includes(labelLower)) {
    return 0.7
  }

  // Синонимы
  const synonyms: Record<string, string[]> = {
    category: ['cat', 'категория'],
    description: ['desc', 'описание', 'content'],
    price: ['cost', 'цена', 'стоимость'],
    quantity: ['qty', 'количество', 'stock'],
    status: ['state', 'статус', 'состояние'],
    title: ['name', 'название', 'наименование'],
  }

  for (const [key, values] of Object.entries(synonyms)) {
    if (fieldLower.includes(key) && values.some((v) => csvLower.includes(v))) {
      return 0.6
    }
    if (csvLower.includes(key) && values.some((v) => fieldLower.includes(v))) {
      return 0.6
    }
  }

  return 0
}
