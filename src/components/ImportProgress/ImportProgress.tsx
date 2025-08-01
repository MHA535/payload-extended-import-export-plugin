import React from 'react'
import { ImportProgress } from 'src/hooks/useImportManager.js'

interface ImportProgressComponentProps {
  onReset: () => void
  progress: ImportProgress
}

const ImportProgressComponent: React.FC<ImportProgressComponentProps> = ({ onReset, progress }) => {
  const isComplete = progress.processed >= progress.total
  const progressPercentage = progress.total > 0 ? (progress.processed / progress.total) * 100 : 0

  if (isComplete) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        {/* Результат импорта */}
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>
          {progress.success > 0 ? '✅' : '❌'}
        </div>

        <h2
          style={{
            color: progress.success > 0 ? '#28a745' : '#dc3545',
            fontSize: '24px',
            margin: '0 0 16px 0',
          }}
        >
          Импорт завершен!
        </h2>

        {/* Статистика */}
        <div
          style={{
            display: 'grid',
            gap: '16px',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            margin: '24px 0',
            marginLeft: 'auto',
            marginRight: 'auto',
            maxWidth: '500px',
          }}
        >
          <div
            style={{
              backgroundColor: '#d4edda',
              border: '1px solid #c3e6cb',
              borderRadius: '8px',
              padding: '16px',
            }}
          >
            <div
              style={{
                color: '#155724',
                fontSize: '24px',
                fontWeight: 'bold',
              }}
            >
              {progress.success}
            </div>
            <div style={{ color: '#155724', fontSize: '14px' }}>Успешно</div>
          </div>

          {progress.failed > 0 && (
            <div
              style={{
                backgroundColor: '#f8d7da',
                border: '1px solid #f5c6cb',
                borderRadius: '8px',
                padding: '16px',
              }}
            >
              <div
                style={{
                  color: '#721c24',
                  fontSize: '24px',
                  fontWeight: 'bold',
                }}
              >
                {progress.failed}
              </div>
              <div style={{ color: '#721c24', fontSize: '14px' }}>Ошибки</div>
            </div>
          )}

          <div
            style={{
              backgroundColor: '#d1ecf1',
              border: '1px solid #bee5eb',
              borderRadius: '8px',
              padding: '16px',
            }}
          >
            <div
              style={{
                color: '#0c5460',
                fontSize: '24px',
                fontWeight: 'bold',
              }}
            >
              {progress.total}
            </div>
            <div style={{ color: '#0c5460', fontSize: '14px' }}>Всего</div>
          </div>
        </div>

        {/* Ошибки */}
        {progress.errors.length > 0 && (
          <div
            style={{
              marginLeft: 'auto',
              marginRight: 'auto',
              marginTop: '24px',
              maxWidth: '600px',
              textAlign: 'left',
            }}
          >
            <h4 style={{ color: '#721c24', margin: '0 0 12px 0' }}>Обнаруженные ошибки:</h4>
            <div
              style={{
                backgroundColor: '#f8d7da',
                border: '1px solid #f5c6cb',
                borderRadius: '8px',
                padding: '16px',
              }}
            >
              {progress.errors.map((error, index) => (
                <div
                  key={index}
                  style={{
                    borderBottom: index < progress.errors.length - 1 ? '1px solid #f5c6cb' : 'none',
                    color: '#721c24',
                    fontSize: '14px',
                    padding: '8px 0',
                  }}
                >
                  • {error}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Кнопка сброса */}
        <div style={{ marginTop: '32px' }}>
          <button
            onClick={onReset}
            style={{
              backgroundColor: '#007bff',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              padding: '12px 24px',
            }}
            type="button"
          >
            Импортировать еще файлы
          </button>
        </div>
      </div>
    )
  }

  // Процесс импорта
  return (
    <div style={{ padding: '40px 20px', textAlign: 'center' }}>
      <span aria-label="hourglass" role="img" style={{ fontSize: '48px', marginBottom: '20px' }}>
        ⏳
      </span>

      <h2 style={{ fontSize: '24px', margin: '0 0 16px 0' }}>Импорт данных...</h2>

      <p style={{ color: '#666', margin: '0 0 32px 0' }}>
        Пожалуйста, не закрывайте страницу во время импорта
      </p>

      {/* Прогресс бар */}
      <div
        style={{
          margin: '0 auto 20px auto',
          maxWidth: '400px',
        }}
      >
        <div
          style={{
            backgroundColor: '#e9ecef',
            borderRadius: '10px',
            height: '20px',
            overflow: 'hidden',
            position: 'relative',
            width: '100%',
          }}
        >
          <div
            style={{
              backgroundColor: '#007bff',
              borderRadius: '10px',
              height: '100%',
              transition: 'width 0.3s ease',
              width: `${progressPercentage}%`,
            }}
          />
        </div>

        <div
          style={{
            color: '#666',
            display: 'flex',
            fontSize: '14px',
            justifyContent: 'space-between',
            marginTop: '8px',
          }}
        >
          <span>
            Обработано: {progress.processed} из {progress.total}
          </span>
          <span>{Math.round(progressPercentage)}%</span>
        </div>
      </div>

      {/* Детали процесса */}
      <div
        style={{
          color: '#666',
          fontSize: '14px',
          lineHeight: '1.5',
        }}
      >
        <div>Проверка данных и создание записей...</div>
        <div style={{ marginTop: '4px' }}>
          Это может занять некоторое время в зависимости от размера файла
        </div>
      </div>
    </div>
  )
}

export default ImportProgressComponent
