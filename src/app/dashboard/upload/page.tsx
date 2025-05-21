'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import * as XLSX from 'xlsx'

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setFile(file)
      setError(null)

      // Preview the file
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = e.target?.result
          const workbook = XLSX.read(data, { type: 'binary' })
          const sheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[sheetName]
          const jsonData = XLSX.utils.sheet_to_json(worksheet)
          setPreview(jsonData)
        } catch (err) {
          setError('Error reading file. Please make sure it is a valid Excel or CSV file.')
          setPreview(null)
        }
      }
      reader.readAsBinaryString(file)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv'],
    },
    maxFiles: 1,
  })

  const handleUpload = async () => {
    if (!file) return

    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Upload failed')
      }

      // Reset form
      setFile(null)
      setPreview(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload file. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Upload Data
          </h2>
        </div>
      </div>

      <div className="space-y-6">
        {/* Upload Area */}
        <div
          {...getRootProps()}
          className={`mt-1 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10 ${
            isDragActive ? 'border-primary bg-blue-50' : ''
          }`}
        >
          <div className="text-center">
            <input {...getInputProps()} />
            <div className="mt-4 flex text-sm leading-6 text-gray-600">
              <span className="relative cursor-pointer rounded-md bg-white font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 hover:text-blue-500">
                Upload a file
              </span>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs leading-5 text-gray-600">
              Excel (.xlsx, .xls) or CSV files up to 10MB
            </p>
          </div>
        </div>

        {file && (
          <div className="rounded-md bg-white p-4 shadow">
            <div className="flex items-center">
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {file.name}
                </p>
                <p className="text-sm text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <button
                onClick={handleUpload}
                disabled={loading}
                className="ml-4 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                {loading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        )}

        {/* Preview */}
        {preview && preview.length > 0 && (
          <div className="rounded-lg bg-white shadow">
            <div className="p-4">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Preview
              </h3>
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead>
                    <tr>
                      {Object.keys(preview[0]).map((header, index) => (
                        <th
                          key={index}
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {preview.slice(0, 5).map((row: any, rowIndex: number) => (
                      <tr key={rowIndex}>
                        {Object.values(row).map((cell: any, cellIndex: number) => (
                          <td
                            key={cellIndex}
                            className="whitespace-nowrap px-3 py-4 text-sm text-gray-500"
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {preview.length > 5 && (
                  <p className="mt-2 text-sm text-gray-500">
                    Showing first 5 rows of {preview.length} total rows
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 