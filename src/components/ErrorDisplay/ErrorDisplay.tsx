import React from 'react'

interface ErrorDisplayProps {
  error: null | string
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error }) => {
  if (!error) return null

  return (
    <div
      style={{
        backgroundColor: '#f8d7da',
        borderRadius: '8px',
        color: '#721c24',
        marginBottom: '20px',
        padding: '16px',
      }}
    >
      <strong>Ошибка:</strong> {error}
    </div>
  )
}

export default ErrorDisplay
