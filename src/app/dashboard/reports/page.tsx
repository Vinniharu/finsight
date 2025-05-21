'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import DataDashboard from '@/components/DataDashboard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, FileText, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function VisualizationsPage() {
  const { data: session } = useSession()
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeReport, setActiveReport] = useState<any | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/reports')
      if (!response.ok) {
        throw new Error('Failed to fetch reports')
      }
      const data = await response.json()
      setReports(data)
      
      // If we have reports with analysis, select the first one
      const reportWithAnalysis = data.find((report: any) => report.analysis)
      if (reportWithAnalysis) {
        setActiveReport(reportWithAnalysis)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reports')
      toast.error('Failed to load reports')
    } finally {
      setLoading(false)
    }
  }

  const analyzeReport = async (report: any) => {
    try {
      setError(null)
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: report.content }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to analyze report')
      }

      const analysis = await response.json()
      
      // Update the report with the new analysis
      const updatedReport = { ...report, analysis }
      setReports(prev => prev.map(r => r.id === report.id ? updatedReport : r))
      setActiveReport(updatedReport)
      toast.success('Analysis completed successfully')
      
      return analysis
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze report')
      toast.error(err instanceof Error ? err.message : 'Failed to analyze report')
      return null
    }
  }

  const handleReportSelect = async (report: any) => {
    if (report.analysis) {
      setActiveReport(report)
    } else {
      // If no analysis yet, run it first
      setActiveReport({ ...report, analysisLoading: true })
      await analyzeReport(report)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <h3 className="text-sm font-medium text-red-800">Error</h3>
        <div className="mt-2 text-sm text-red-700">{error}</div>
        <Button onClick={fetchReports} className="mt-4 bg-red-100 text-red-700 hover:bg-red-200">
          Try Again
        </Button>
      </div>
    )
  }

  if (reports.length === 0) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-600">No reports yet</h2>
          <p className="text-gray-500 mt-2">Upload a file to generate your first report</p>
          <Button 
            className="mt-6"
            onClick={() => window.location.href = '/dashboard/upload'} 
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload Data
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <div className="sticky top-20">
            <Card>
              <CardHeader>
                <CardTitle>Your Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {reports.map((report) => (
                    <Button
                      key={report.id}
                      variant={activeReport?.id === report.id ? "default" : "outline"}
                      className="w-full justify-start"
                      onClick={() => handleReportSelect(report)}
                    >
                      <span className="truncate">{report.title}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="md:col-span-3">
          {activeReport ? (
            activeReport.analysisLoading ? (
              <div className="flex flex-col items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin mb-4" />
                <p className="text-gray-500">Analyzing report data...</p>
              </div>
            ) : activeReport.analysis ? (
              <DataDashboard 
                data={activeReport.analysis} 
                title={activeReport.title}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-96 bg-gray-50 border border-gray-200 rounded-md">
                <FileText className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">No Analysis Available</h3>
                <p className="text-gray-500 mb-6">Run analysis to generate visualizations</p>
                <Button onClick={() => analyzeReport(activeReport)}>
                  Analyze Report
                </Button>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center h-96 bg-gray-50 border border-gray-200 rounded-md">
              <FileText className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-600">Select a Report</h3>
              <p className="text-gray-500">Choose a report from the sidebar to visualize</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 