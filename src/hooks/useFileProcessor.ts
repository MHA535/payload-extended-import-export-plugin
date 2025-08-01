import { useEffect, useState } from 'react'

import { readFile, TableData } from '../utils/file-parsers.js'

export const useFileProcessor = () => {
  const [file, setFile] = useState<File | null>(null)
  const [tableData, setTableData] = useState<null | TableData>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<null | string>(null)

  const processFile = async (file: File): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      const parsedData = await readFile(file)
      setTableData(parsedData)
    } catch (err) {
      console.error('Error reading file:', err)
      setError(err instanceof Error ? err.message : 'Ошибка при чтении файла')
      setTableData(null)
    } finally {
      setIsLoading(false)
    }
  }

  const onFileChange = (files: FileList) => {
    if (files && files.length > 0) {
      setFile(files[0])
      setError(null)
    }
  }

  const clearFile = () => {
    setFile(null)
    setTableData(null)
    setError(null)
  }

  useEffect(() => {
    if (file) {
      processFile(file)
        .then(() => {})
        .catch(() => {})
    } else {
      setTableData(null)
      setError(null)
    }
  }, [file])

  return {
    clearFile,
    error,
    file,
    isLoading,
    onFileChange,
    tableData,
  }
}
