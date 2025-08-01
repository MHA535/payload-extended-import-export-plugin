import { ArrowRight, Info, Lightbulb } from 'lucide-react'
import React, { useEffect } from 'react'

import { CollectionField, FieldMapping } from '../../types/import.js'
import { getFieldMappingRecommendations } from '../../utils/sample-generators.js'

interface FieldMappingComponentProps {
  collectionFields: CollectionField[]
  csvHeaders: string[]
  fieldMappings: FieldMapping[]
  onMappingChange: (mappings: FieldMapping[]) => void
}

const FieldMappingComponent: React.FC<FieldMappingComponentProps> = ({
  collectionFields,
  csvHeaders,
  fieldMappings,
  onMappingChange,
}) => {
  // Автоматическое применение рекомендаций при первой загрузке
  useEffect(() => {
    if (fieldMappings.length === 0 && csvHeaders.length > 0) {
      const recommendations = getFieldMappingRecommendations(csvHeaders, collectionFields)
      const mappings: FieldMapping[] = recommendations.map((rec) => ({
        collectionField: rec.recommendedField,
        csvField: rec.csvField,
      }))
      onMappingChange(mappings)
    }
  }, [csvHeaders, collectionFields, fieldMappings.length, onMappingChange])

  const updateMapping = (csvField: string, collectionField: string) => {
    const newMappings = fieldMappings.filter((m) => m.csvField !== csvField)
    if (collectionField) {
      newMappings.push({ collectionField, csvField })
    }
    onMappingChange(newMappings)
  }

  const applyRecommendations = () => {
    const recommendations = getFieldMappingRecommendations(csvHeaders, collectionFields)
    const mappings: FieldMapping[] = recommendations.map((rec) => ({
      collectionField: rec.recommendedField,
      csvField: rec.csvField,
    }))
    onMappingChange(mappings)
  }

  const getMappingForCsvField = (csvField: string) => {
    return fieldMappings.find((m) => m.csvField === csvField)?.collectionField || ''
  }

  const getCollectionField = (fieldName: string) => {
    return collectionFields.find((f) => f.name === fieldName)
  }

  const autoMapFields = () => {
    const autoMappings: FieldMapping[] = []

    // Фильтруем пустые заголовки
    const validHeaders = csvHeaders.filter(
      (header) => header && typeof header === 'string' && header.trim() !== '',
    )

    validHeaders.forEach((csvHeader) => {
      // Попытка найти точное совпадение по имени
      let match = collectionFields.find(
        (field) => field.name && field.name.toLowerCase() === csvHeader.toLowerCase(),
      )

      // Если точного совпадения нет, ищем по частичному совпадению
      if (!match) {
        match = collectionFields.find(
          (field) =>
            field.name &&
            (field.name.toLowerCase().includes(csvHeader.toLowerCase()) ||
              csvHeader.toLowerCase().includes(field.name.toLowerCase())),
        )
      }

      if (match) {
        autoMappings.push({
          collectionField: match.name,
          csvField: csvHeader,
        })
      }
    })

    onMappingChange(autoMappings)
  }

  return (
    <div style={{ marginBottom: '24px' }}>
      <div
        style={{
          alignItems: 'center',
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '16px',
        }}
      >
        <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0 }}>Сопоставление полей</h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={applyRecommendations}
            style={{
              alignItems: 'center',
              backgroundColor: '#f59e0b',
              border: 'none',
              borderRadius: '4px',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              fontSize: '12px',
              gap: '4px',
              padding: '6px 12px',
            }}
            title="Применить умные рекомендации"
            type="button"
          >
            <Lightbulb size={14} />
            Рекомендации
          </button>
          <button
            onClick={autoMapFields}
            style={{
              backgroundColor: '#6c757d',
              border: 'none',
              borderRadius: '4px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '12px',
              padding: '6px 12px',
            }}
            type="button"
          >
            Автосопоставление
          </button>
        </div>
      </div>

      <div
        style={{
          backgroundColor: '#fff',
          border: '1px solid #ddd',
          borderRadius: '8px',
          overflow: 'hidden',
        }}
      >
        {/* Заголовок таблицы */}
        <div
          style={{
            backgroundColor: '#f8f9fa',
            borderBottom: '1px solid #ddd',
            display: 'grid',
            fontSize: '14px',
            fontWeight: 'bold',
            gridTemplateColumns: '1fr auto 1fr auto',
            padding: '12px',
          }}
        >
          <div>Поле из файла</div>
          <div style={{ textAlign: 'center', width: '40px' }}></div>
          <div>Поле коллекции</div>
          <div style={{ width: '24px' }}></div>
        </div>

        {/* Строки сопоставления */}
        {csvHeaders.map((csvHeader, index) => {
          const mappedField = getMappingForCsvField(csvHeader)
          const collectionField = mappedField ? getCollectionField(mappedField) : null

          return (
            <div
              key={csvHeader}
              style={{
                alignItems: 'center',
                borderBottom: index < csvHeaders.length - 1 ? '1px solid #eee' : 'none',
                display: 'grid',
                gridTemplateColumns: '1fr auto 1fr auto',
                padding: '12px',
              }}
            >
              {/* CSV поле */}
              <div>
                <div
                  style={{
                    fontWeight: '500',
                    marginBottom: '2px',
                  }}
                >
                  {csvHeader}
                </div>
                <div style={{ color: '#666', fontSize: '12px' }}>Колонка из файла</div>
              </div>

              {/* Стрелка */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  width: '40px',
                }}
              >
                <ArrowRight color="#666" size={16} />
              </div>

              {/* Выбор поля коллекции */}
              <div>
                <select
                  onChange={(e) => updateMapping(csvHeader, e.target.value)}
                  style={{
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    marginBottom: '4px',
                    padding: '6px 8px',
                    width: '100%',
                  }}
                  value={mappedField}
                >
                  <option value="">Не сопоставлять</option>
                  {collectionFields.map((field) => (
                    <option key={field.name} value={field.name}>
                      {field.label || field.name} ({field.type}){field.required ? ' *' : ''}
                      {field.hasDefaultValue ? ' [auto]' : ''}
                    </option>
                  ))}
                </select>

                {/* Информация о поле */}
                {collectionField && (
                  <div
                    style={{
                      color: '#666',
                      fontSize: '12px',
                    }}
                  >
                    {collectionField.required && (
                      <span
                        style={{
                          color: '#dc3545',
                          marginRight: '4px',
                        }}
                      >
                        Обязательное
                      </span>
                    )}
                    {collectionField.hasDefaultValue && (
                      <span
                        style={{
                          color: '#28a745',
                          marginRight: '4px',
                        }}
                      >
                        (авто-значение)
                      </span>
                    )}
                    Тип: {collectionField.type}
                    {collectionField.example && (
                      <div style={{ marginTop: '2px' }}>Пример: {collectionField.example}</div>
                    )}
                  </div>
                )}
              </div>

              {/* Информация */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  width: '24px',
                }}
              >
                {collectionField?.required && !mappedField && (
                  <div title="Это поле обязательно для заполнения">
                    <Info color="#dc3545" size={16} />
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Предупреждения */}
      <div style={{ marginTop: '12px' }}>
        {/* Несопоставленные обязательные поля */}
        {(() => {
          const requiredFields = collectionFields.filter((f) => f.required)
          const mappedFieldNames = fieldMappings.map((m) => m.collectionField)
          const unmappedRequired = requiredFields.filter((f) => !mappedFieldNames.includes(f.name))

          if (unmappedRequired.length > 0) {
            return (
              <div
                style={{
                  backgroundColor: '#fff3cd',
                  border: '1px solid #ffeaa7',
                  borderRadius: '4px',
                  fontSize: '14px',
                  padding: '12px',
                }}
              >
                <strong>
                  <span aria-label="alert" role="img">
                    ⚠️
                  </span>{' '}
                  Внимание:
                </strong>{' '}
                Следующие обязательные поля не сопоставлены:{' '}
                {unmappedRequired.map((f) => f.label || f.name).join(', ')}
                <br />
                <small
                  style={{
                    color: '#666',
                    display: 'block',
                    marginTop: '4px',
                  }}
                >
                  <span aria-label="lamp" role="img">
                    💡
                  </span>{' '}
                  Поля со значениями по умолчанию не требуют обязательного заполнения
                </small>
              </div>
            )
          }
          return null
        })()}

        {/* Несопоставленные поля из CSV */}
        {(() => {
          const unmappedCsvFields = csvHeaders.filter((h) => !getMappingForCsvField(h))

          if (unmappedCsvFields.length > 0) {
            return (
              <div
                style={{
                  backgroundColor: '#d1ecf1',
                  border: '1px solid #bee5eb',
                  borderRadius: '4px',
                  fontSize: '14px',
                  marginTop: '8px',
                  padding: '12px',
                }}
              >
                <strong>
                  <span aria-label="info" role="img">
                    ℹ️
                  </span>{' '}
                  Информация:
                </strong>{' '}
                Следующие поля из файла не будут импортированы: {unmappedCsvFields.join(', ')}
              </div>
            )
          }
          return null
        })()}
      </div>
    </div>
  )
}

export default FieldMappingComponent
