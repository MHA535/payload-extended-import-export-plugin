import React, { useState } from 'react'

import type {
  CollectionField,
  FieldMapping,
  ImportMode,
  ImportSettings,
} from '../../types/import.js'
import type { TableData } from '../../utils/file-parsers.js'

import FieldMappingComponent from '../FieldMapping/FieldMapping.js'
import ImportModeSelector from '../ImportModeSelector/ImportModeSelector.js'
import LocaleSelector from '../LocaleSelector/LocaleSelector.js'

interface ImportConfigurationProps {
  collectionFields: CollectionField[]
  onBack: () => void
  onImport: (settings: ImportSettings, data: Record<string, any>[]) => void
  tableData: TableData
}

const ImportConfiguration: React.FC<ImportConfigurationProps> = ({
  collectionFields,
  onBack,
  onImport,
  tableData,
}) => {
  const [importMode, setImportMode] = useState<ImportMode>('create')
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([])
  const [compareField, setCompareField] = useState<string>('')
  const [selectedLocale, setSelectedLocale] = useState<string>('en')

  const canProceed = () => {
    // Для режима update обязательные поля не требуются
    if (importMode === 'update') {
      // Для update требуется только поле сравнения и минимум одно сопоставление
      const isUsingIdForComparison = compareField === 'id'
      const hasIdMapping = fieldMappings.some((m) => m.collectionField === 'id')

      return fieldMappings.length > 0 && compareField && (!isUsingIdForComparison || hasIdMapping)
    }

    // Для create и upsert проверяем обязательные поля
    const requiredFields = collectionFields.filter((f) => f.required)
    const mappedFieldNames = fieldMappings.map((m) => m.collectionField)
    const unmappedRequired = requiredFields.filter((f) => !mappedFieldNames.includes(f.name))

    // Для режима upsert требуется поле сравнения
    const needsCompareField = importMode === 'upsert'

    // Дополнительная проверка: если выбран режим обновления и поле сравнения - ID,
    // то ID должно быть в маппинге
    const isUsingIdForComparison = compareField === 'id'
    const hasIdMapping = mappedFieldNames.includes('id')

    return (
      unmappedRequired.length === 0 &&
      fieldMappings.length > 0 &&
      (!needsCompareField || compareField) &&
      (!isUsingIdForComparison || hasIdMapping)
    )
  }

  const handleImport = () => {
    if (!canProceed()) {
      return
    }

    const settings: ImportSettings = {
      compareField: compareField || undefined,
      fieldMappings,
      locale: selectedLocale,
      mode: importMode,
    }

    // Передаем и настройки, и данные
    onImport(settings, tableData.rows)
  }

  return (
    <div>
      {/* Заголовок */}
      <div
        style={{
          alignItems: 'center',
          borderBottom: '1px solid #eee',
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '24px',
          paddingBottom: '16px',
        }}
      >
        <div>
          <h2
            style={{
              fontSize: '20px',
              fontWeight: 'bold',
              margin: 0,
            }}
          >
            Настройка импорта
          </h2>
          <p
            style={{
              color: '#666',
              fontSize: '14px',
              margin: '4px 0 0 0',
            }}
          >
            Готовится к импорту {tableData.rows.length} записей
          </p>
        </div>
        <button
          onClick={onBack}
          style={{
            backgroundColor: '#6c757d',
            border: 'none',
            borderRadius: '4px',
            color: 'white',
            cursor: 'pointer',
            padding: '8px 16px',
          }}
          type="button"
        >
          ← Назад к файлу
        </button>
      </div>

      {/* Режим импорта */}
      <ImportModeSelector
        collectionFields={collectionFields}
        compareField={compareField}
        onCompareFieldChange={setCompareField}
        onModeChange={setImportMode}
        selectedMode={importMode}
      />

      {/* Выбор локали */}
      <LocaleSelector onChange={setSelectedLocale} value={selectedLocale} />

      {/* Сопоставление полей */}
      <FieldMappingComponent
        collectionFields={collectionFields}
        csvHeaders={tableData.headers}
        fieldMappings={fieldMappings}
        importMode={importMode}
        onMappingChange={setFieldMappings}
      />

      {/* Итоговая информация и кнопка импорта */}
      <div
        style={{
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          marginTop: '24px',
          padding: '20px',
        }}
      >
        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ fontSize: '16px', margin: '0 0 12px 0' }}>Итоговая информация:</h4>
          <div style={{ color: '#555', fontSize: '14px' }}>
            <div>
              • Записей для импорта: <strong>{tableData.rows.length}</strong>
            </div>
            <div>
              • Сопоставленных полей: <strong>{fieldMappings.length}</strong>
            </div>
            <div>
              • Режим импорта:{' '}
              <strong>
                {importMode === 'create' && 'Создать новые записи'}
                {importMode === 'update' && 'Обновить существующие'}
                {importMode === 'upsert' && 'Создать новые и обновить существующие'}
              </strong>
            </div>
            {compareField && (
              <div>
                • Поле для сравнения: <strong>{compareField}</strong>
              </div>
            )}
          </div>
        </div>

        <div
          style={{
            alignItems: 'center',
            display: 'flex',
            gap: '12px',
          }}
        >
          <button
            disabled={!canProceed()}
            onClick={handleImport}
            style={{
              backgroundColor: canProceed() ? '#28a745' : '#6c757d',
              border: 'none',
              borderRadius: '4px',
              color: 'white',
              cursor: canProceed() ? 'pointer' : 'not-allowed',
              fontSize: '16px',
              fontWeight: 'bold',
              padding: '12px 24px',
            }}
            type="button"
          >
            <span aria-label="rocket" role="img">
              🚀
            </span>{' '}
            Начать импорт
          </button>

          {!canProceed() && (
            <div style={{ color: '#dc3545', fontSize: '14px' }}>
              {(() => {
                const requiredFields = collectionFields.filter((f) => f.required)
                const mappedFieldNames = fieldMappings.map((m) => m.collectionField)
                const unmappedRequired = requiredFields.filter(
                  (f) => !mappedFieldNames.includes(f.name),
                )
                const needsCompareField = importMode === 'update' || importMode === 'upsert'
                const isUsingIdForComparison = compareField === 'id'
                const hasIdMapping = mappedFieldNames.includes('id')

                if (fieldMappings.length === 0) {
                  return 'Сопоставьте хотя бы одно поле'
                }

                // Для режима update не проверяем обязательные поля
                if (importMode !== 'update' && unmappedRequired.length > 0) {
                  return `Сопоставьте обязательные поля: ${unmappedRequired.map((f) => f.label).join(', ')}`
                }

                if (needsCompareField && !compareField) {
                  return 'Выберите поле для сравнения записей'
                }
                if (isUsingIdForComparison && !hasIdMapping) {
                  return 'Для сравнения по ID необходимо сопоставить поле ID с колонкой из файла'
                }
                return ''
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ImportConfiguration
