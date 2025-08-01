import { Table as TableIcon } from 'lucide-react'
import React from 'react'

import { TableData } from '../../utils/file-parsers.js'

interface DataPreviewProps {
  onConfigure: () => void
  tableData: TableData
}

const DataPreview: React.FC<DataPreviewProps> = ({ onConfigure, tableData }) => {
  return (
    <div>
      <div
        style={{
          alignItems: 'center',
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '16px',
        }}
      >
        <div
          style={{
            alignItems: 'center',
            display: 'flex',
          }}
        >
          <TableIcon size={20} style={{ marginRight: '8px' }} />
          <strong>Предварительный просмотр данных</strong>
          <span
            style={{
              color: '#666',
              marginLeft: '8px',
            }}
          >
            ({tableData.rows.length} записей)
          </span>
        </div>
        <button
          onClick={onConfigure}
          style={{
            backgroundColor: '#28a745',
            border: 'none',
            borderRadius: '4px',
            color: 'white',
            cursor: 'pointer',
            padding: '8px 16px',
          }}
          type="button"
        >
          Настроить импорт
        </button>
      </div>

      <div
        style={{
          border: '1px solid #ddd',
          borderRadius: '8px',
          maxHeight: '400px',
          overflow: 'hidden',
          overflowY: 'auto',
        }}
      >
        <table
          style={{
            borderCollapse: 'collapse',
            width: '100%',
          }}
        >
          <thead>
            <tr
              style={{
                backgroundColor: '#f8f9fa',
              }}
            >
              {tableData.headers.map((header, index) => {
                // Безопасное преобразование заголовка в строку
                const headerValue =
                  header === null || header === undefined ? `Column ${index + 1}` : String(header)

                return (
                  <th
                    key={index}
                    style={{
                      backgroundColor: '#f8f9fa',
                      borderBottom: '2px solid #dee2e6',
                      fontWeight: 'bold',
                      padding: '12px',
                      position: 'sticky',
                      textAlign: 'left',
                      top: 0,
                    }}
                  >
                    {headerValue}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {tableData.rows.slice(0, 100).map((row, rowIndex) => (
              <tr
                key={rowIndex}
                style={{
                  backgroundColor: rowIndex % 2 === 0 ? '#fff' : '#f9f9f9',
                }}
              >
                {row.map((cell, cellIndex) => {
                  // Безопасное преобразование значения в строку
                  const cellValue = cell === null || cell === undefined ? '' : String(cell)

                  return (
                    <td
                      key={cellIndex}
                      style={{
                        borderBottom: '1px solid #dee2e6',
                        maxWidth: '200px',
                        overflow: 'hidden',
                        padding: '8px 12px',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {cellValue}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
        {tableData.rows.length > 100 && (
          <div
            style={{
              backgroundColor: '#f8f9fa',
              borderTop: '1px solid #dee2e6',
              color: '#666',
              padding: '12px',
              textAlign: 'center',
            }}
          >
            Показано первые 100 записей из {tableData.rows.length}
          </div>
        )}
      </div>
    </div>
  )
}

export default DataPreview
