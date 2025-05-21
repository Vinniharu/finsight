'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Upload, FileText } from 'lucide-react'
import { toast } from 'sonner'

export default function UploadComponent() {
  const router = useRouter()
  const [uploading, setUploading] = useState(false)

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
      toast.error('Please upload an Excel or CSV file')
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      // First, upload the file
      console.log('Uploading file...')
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json()
        throw new Error(errorData.error || 'Failed to upload file')
      }

      const { reportId } = await uploadResponse.json()
      console.log('File uploaded successfully, reportId:', reportId)

      // Then, analyze the file
      console.log('Analyzing file...')
      const analyzeResponse = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      })

      if (!analyzeResponse.ok) {
        const errorData = await analyzeResponse.json()
        throw new Error(errorData.error || 'Failed to analyze file')
      }

      const analysis = await analyzeResponse.json()
      console.log('Analysis completed successfully')

      toast.success('File uploaded and analyzed successfully')
      router.push('/reports')
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to upload file')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Upload Financial Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center w-full">
            <label
              htmlFor="file-upload"
              className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {uploading ? (
                  <Loader2 className="w-10 h-10 mb-3 text-gray-400 animate-spin" />
                ) : (
                  <FileText className="w-10 h-10 mb-3 text-gray-400" />
                )}
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">Excel or CSV files only</p>
              </div>
              <Input
                id="file-upload"
                type="file"
                className="hidden"
                accept=".xlsx,.xls,.csv"
                onChange={handleUpload}
                disabled={uploading}
              />
            </label>
            <p className="mt-4 text-sm text-gray-500 text-center">
              Supported formats: .xlsx, .xls, .csv
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 