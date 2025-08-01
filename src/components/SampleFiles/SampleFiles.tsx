import { Check, Copy, Download, FileText } from 'lucide-react'
import React, { useState } from 'react'

import { CollectionField } from '../../types/import.js'
import { generateSampleCSV, generateSampleJSON } from '../../utils/sample-generators.js'

interface SampleFilesProps {
  collectionFields: CollectionField[]
  collectionName: string
}

const SampleFiles: React.FC<SampleFilesProps> = ({ collectionFields, collectionName }) => {
  const [copiedFormat, setCopiedFormat] = useState<null | string>(null)

  const sampleCSV = generateSampleCSV(collectionFields)
  const sampleJSON = generateSampleJSON(collectionFields)

  const copyToClipboard = async (text: string, format: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedFormat(format)
      setTimeout(() => setCopiedFormat(null), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{ marginTop: '24px' }}>
      <h4
        style={{
          fontSize: '16px',
          fontWeight: 'bold',
          margin: '0 0 16px 0',
        }}
      >
        <span aria-label="file" role="img">
          span 📄
        </span>{' '}
        Примеры файлов для импорта в "{collectionName}"
      </h4>

      <div
        style={{
          display: 'grid',
          gap: '16px',
          gridTemplateColumns: '1fr 1fr',
        }}
      >
        {/* CSV пример */}
        <div
          style={{
            backgroundColor: '#fff',
            border: '1px solid #ddd',
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              alignItems: 'center',
              backgroundColor: '#f8f9fa',
              borderBottom: '1px solid #ddd',
              display: 'flex',
              justifyContent: 'space-between',
              padding: '12px 16px',
            }}
          >
            <div style={{ alignItems: 'center', display: 'flex' }}>
              <FileText size={16} style={{ marginRight: '8px' }} />
              <strong>CSV формат</strong>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => copyToClipboard(sampleCSV, 'csv')}
                style={{
                  alignItems: 'center',
                  backgroundColor: '#fff',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  fontSize: '12px',
                  padding: '4px 8px',
                }}
                title="Копировать в буфер обмена"
                type="button"
              >
                {copiedFormat === 'csv' ? <Check color="#28a745" size={14} /> : <Copy size={14} />}
              </button>
              <button
                onClick={() => downloadFile(sampleCSV, `${collectionName}-sample.csv`, 'text/csv')}
                style={{
                  alignItems: 'center',
                  backgroundColor: '#fff',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  fontSize: '12px',
                  padding: '4px 8px',
                }}
                title="Скачать CSV файл"
                type="button"
              >
                <Download size={14} />
              </button>
            </div>
          </div>
          <div
            style={{
              backgroundColor: '#f8f8f8',
              fontFamily: 'monospace',
              fontSize: '12px',
              maxHeight: '200px',
              overflow: 'auto',
              padding: '12px',
              whiteSpace: 'pre-wrap',
            }}
          >
            {sampleCSV}
          </div>
        </div>

        {/* JSON пример */}
        <div
          style={{
            backgroundColor: '#fff',
            border: '1px solid #ddd',
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              alignItems: 'center',
              backgroundColor: '#f8f9fa',
              borderBottom: '1px solid #ddd',
              display: 'flex',
              justifyContent: 'space-between',
              padding: '12px 16px',
            }}
          >
            <div style={{ alignItems: 'center', display: 'flex' }}>
              <FileText size={16} style={{ marginRight: '8px' }} />
              <strong>JSON формат</strong>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => copyToClipboard(sampleJSON, 'json')}
                style={{
                  alignItems: 'center',
                  backgroundColor: '#fff',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  fontSize: '12px',
                  padding: '4px 8px',
                }}
                title="Копировать в буфер обмена"
                type="button"
              >
                {copiedFormat === 'json' ? <Check color="#28a745" size={14} /> : <Copy size={14} />}
              </button>
              <button
                onClick={() =>
                  downloadFile(sampleJSON, `${collectionName}-sample.json`, 'application/json')
                }
                style={{
                  alignItems: 'center',
                  backgroundColor: '#fff',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  fontSize: '12px',
                  padding: '4px 8px',
                }}
                title="Скачать JSON файл"
                type="button"
              >
                <Download size={14} />
              </button>
            </div>
          </div>
          <div
            style={{
              backgroundColor: '#f8f8f8',
              fontFamily: 'monospace',
              fontSize: '12px',
              maxHeight: '200px',
              overflow: 'auto',
              padding: '12px',
              whiteSpace: 'pre-wrap',
            }}
          >
            {sampleJSON}
          </div>
        </div>
      </div>

      {/* Информация о полях */}
      <div
        style={{
          backgroundColor: '#e3f2fd',
          border: '1px solid #bbdefb',
          borderRadius: '8px',
          fontSize: '14px',
          marginTop: '16px',
          padding: '12px',
        }}
      >
        <strong>
          <span aria-label="light bulb" role="img">
            💡
          </span>{' '}
          Подсказка:
        </strong>{' '}
        Примеры выше сгенерированы автоматически на основе полей коллекции "{collectionName}". Вы
        можете использовать эти файлы как шаблон для подготовки своих данных.
        <div
          style={{
            color: '#666',
            fontSize: '12px',
            marginTop: '8px',
          }}
        >
          • Поля помеченные звездочкой (*) являются обязательными для заполнения
          <br />
          • Поля с [auto] имеют значения по умолчанию и могут быть пропущены
          <br />• Пустые поля в CSV будут заполнены значениями по умолчанию автоматически
        </div>
      </div>
    </div>
  )
}

export default SampleFiles
