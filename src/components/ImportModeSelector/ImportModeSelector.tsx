import React from 'react'

import type { CollectionField, ImportMode } from '../../types/import.js'

interface ImportModeSelectorProps {
  collectionFields: CollectionField[]
  compareField?: string
  onCompareFieldChange: (field: string) => void
  onModeChange: (mode: ImportMode) => void
  selectedMode: ImportMode
}

const ImportModeSelector: React.FC<ImportModeSelectorProps> = ({
  collectionFields,
  compareField,
  onCompareFieldChange,
  onModeChange,
  selectedMode,
}) => {
  const modes = [
    {
      description: 'Все записи будут добавлены как новые (дубликаты возможны)',
      icon: '➕',
      label: 'Создать новые записи',
      value: 'create' as ImportMode,
    },
    {
      description: 'Обновить только существующие записи (новые не будут созданы)',
      icon: '🔄',
      label: 'Обновить существующие',
      value: 'update' as ImportMode,
    },
    {
      description: 'Создать новые записи или обновить существующие',
      icon: '🔀',
      label: 'Создать новые и обновить существующие',
      value: 'upsert' as ImportMode,
    },
  ]

  return (
    <div style={{ marginBottom: '24px' }}>
      <h3
        style={{
          fontSize: '16px',
          fontWeight: 'bold',
          marginBottom: '16px',
        }}
      >
        Режим импорта
      </h3>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        {modes.map((mode) => (
          <div
            key={mode.value}
            style={{
              alignItems: 'flex-start',
              backgroundColor: selectedMode === mode.value ? '#f8f9ff' : '#fff',
              border: selectedMode === mode.value ? '2px solid #007bff' : '1px solid #ddd',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              padding: '16px',
            }}
          >
            <input
              checked={selectedMode === mode.value}
              name="importMode"
              onChange={(e) => onModeChange(e.target.value as ImportMode)}
              style={{ marginRight: '12px', marginTop: '2px' }}
              type="radio"
              value={mode.value}
            />
            <div style={{ flex: 1 }}>
              <div
                style={{
                  alignItems: 'center',
                  display: 'flex',
                  marginBottom: '4px',
                }}
              >
                <span
                  style={{
                    fontSize: '20px',
                    marginRight: '8px',
                  }}
                >
                  {mode.icon}
                </span>
                <strong>{mode.label}</strong>
              </div>
              <div style={{ color: '#666', fontSize: '14px' }}>{mode.description}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Поле для сравнения при update/upsert */}
      {(selectedMode === 'update' || selectedMode === 'upsert') && (
        <div
          style={{
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            marginTop: '16px',
            padding: '16px',
          }}
        >
          <label
            style={{
              display: 'block',
              fontWeight: 'bold',
              marginBottom: '8px',
            }}
          >
            Поле для сравнения записей:
          </label>
          <select
            onChange={(e) => onCompareFieldChange(e.target.value)}
            style={{
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
              padding: '8px 12px',
              width: '100%',
            }}
            value={compareField || ''}
          >
            <option value="">Выберите поле...</option>
            {collectionFields.map((field) => (
              <option key={field.name} value={field.name}>
                {field.label} ({field.name})
              </option>
            ))}
          </select>
          <div
            style={{
              color: '#666',
              fontSize: '12px',
              marginTop: '4px',
            }}
          >
            По этому полю будет определяться, существует ли запись в базе данных
          </div>
        </div>
      )}
    </div>
  )
}

export default ImportModeSelector
