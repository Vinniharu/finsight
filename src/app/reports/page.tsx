'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Download, FileText, Upload, BarChart4, PieChart, LineChart, Webhook } from 'lucide-react'
import { toast } from 'sonner'
import { Line, Bar, Pie, Scatter } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import * as XLSX from 'xlsx'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface Report {
  id: string
  fileName: string
  createdAt: string
  analysis: {
    summary: string
    keyMetrics: {
      name: string
      value: number
      change?: number
      trend?: 'up' | 'down' | 'stable'
    }[]
    insights: string[]
    recommendations: string[]
    charts: {
      type: 'bar' | 'line' | 'pie' | 'scatter'
      title: string
      data: {
        labels: string[]
        datasets: {
          label: string
          data: number[]
          backgroundColor?: string[]
          borderColor?: string
          fill?: boolean
        }[]
      }
      options?: {
        [key: string]: any
      }
    }[]
    rawData: {
      categories: string[]
      values: number[]
    }[]
  }
}

export default function ReportsPage() {
  const { data: session } = useSession()
  const [file, setFile] = useState<File | null>(null)
  const [fileData, setFileData] = useState<any[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [report, setReport] = useState<Report | null>(null)
  const chartsContainerRef = useRef<HTMLDivElement>(null)
  
  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (!selectedFile) return
    
    // Check file type
    if (!selectedFile.name.match(/\.(xlsx|xls|csv)$/i)) {
      toast.error('Please upload an Excel or CSV file')
      return
    }
    
    setFile(selectedFile)
    parseExcelFile(selectedFile)
  }
  
  // Parse Excel file
  const parseExcelFile = async (file: File) => {
    setLoading(true)
    try {
      const arrayBuffer = await file.arrayBuffer()
      const workbook = XLSX.read(arrayBuffer)
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const data = XLSX.utils.sheet_to_json(worksheet)
      
      setFileData(data)
      toast.success('File parsed successfully')
    } catch (error) {
      console.error('Error parsing file:', error)
      toast.error('Failed to parse file')
    } finally {
      setLoading(false)
    }
  }
  
  // Analyze data with AI
  const analyzeData = async () => {
    if (!fileData) return
    
    setAnalyzing(true)
    try {
      // Send data to analyze endpoint
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: fileData }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to analyze data')
      }
      
      const analysis = await response.json()
      
      // Create report object
      const newReport: Report = {
        id: Date.now().toString(),
        fileName: file?.name || 'data-analysis',
        createdAt: new Date().toISOString(),
        analysis: analysis
      }
      
      setReport(newReport)
      toast.success('Analysis completed')
    } catch (error) {
      console.error('Analysis error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to analyze data')
    } finally {
      setAnalyzing(false)
    }
  }
  
  // Export to PDF
  const exportToPDF = async () => {
    if (!report || !chartsContainerRef.current) return
    
    setExporting(true)
    try {
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()
      const margin = 20
      let yOffset = 20
      
      // Add title
      doc.setFontSize(20)
      doc.text('Financial Analysis Report', margin, yOffset)
      yOffset += 20
      
      // Add summary
      doc.setFontSize(14)
      doc.text('Summary', margin, yOffset)
      yOffset += 10
      doc.setFontSize(12)
      const summaryLines = doc.splitTextToSize(report.analysis.summary, pageWidth - 2 * margin)
      doc.text(summaryLines, margin, yOffset)
      yOffset += summaryLines.length * 7 + 10
      
      // Add key metrics
      doc.setFontSize(14)
      doc.text('Key Metrics', margin, yOffset)
      yOffset += 10
      doc.setFontSize(12)
      for (const metric of report.analysis.keyMetrics) {
        const trendIcon = metric.trend === 'up' ? '↑' : metric.trend === 'down' ? '↓' : '→'
        doc.text(`${metric.name}: ${metric.value} ${trendIcon}`, margin, yOffset)
        yOffset += 7
      }
      yOffset += 10
      
      // Add insights
      doc.setFontSize(14)
      doc.text('Insights', margin, yOffset)
      yOffset += 10
      doc.setFontSize(12)
      for (const insight of report.analysis.insights) {
        const insightLines = doc.splitTextToSize(`• ${insight}`, pageWidth - 2 * margin)
        doc.text(insightLines, margin, yOffset)
        yOffset += insightLines.length * 7
      }
      yOffset += 10
      
      // Add recommendations
      doc.setFontSize(14)
      doc.text('Recommendations', margin, yOffset)
      yOffset += 10
      doc.setFontSize(12)
      for (const recommendation of report.analysis.recommendations) {
        const recLines = doc.splitTextToSize(`• ${recommendation}`, pageWidth - 2 * margin)
        doc.text(recLines, margin, yOffset)
        yOffset += recLines.length * 7
      }
      
      // Add charts
      const chartsContainer = chartsContainerRef.current
      const canvas = await html2canvas(chartsContainer)
      
      // Start new page for charts
      doc.addPage()
      yOffset = 20
      
      // Add title for charts
      doc.setFontSize(16)
      doc.text('Data Visualizations', margin, yOffset)
      yOffset += 20
      
      // Add charts image
      const imgData = canvas.toDataURL('image/png')
      doc.addImage(imgData, 'PNG', margin, yOffset, pageWidth - 2 * margin, 160)
      
      // Save PDF
      doc.save(`${report.fileName}-analysis.pdf`)
      toast.success('Report exported successfully')
    } catch (error) {
      console.error('Error exporting PDF:', error)
      toast.error('Failed to export report')
    } finally {
      setExporting(false)
    }
  }
  
  // Render chart
  const renderChart = (chart: Report['analysis']['charts'][0]) => {
    const commonOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top' as const,
        },
      },
    }
    
    switch (chart.type) {
      case 'line':
        return (
          <Line
            data={chart.data}
            options={{
              ...commonOptions,
              scales: {
                y: {
                  beginAtZero: true,
                },
              },
            }}
          />
        )
      case 'bar':
        return (
          <Bar
            data={chart.data}
            options={{
              ...commonOptions,
              scales: {
                y: {
                  beginAtZero: true,
                },
              },
            }}
          />
        )
      case 'pie':
        return <Pie data={chart.data} options={commonOptions} />
      case 'scatter':
        return (
          <Scatter
            data={chart.data}
            options={{
              ...commonOptions,
              scales: {
                y: {
                  beginAtZero: true,
                },
              },
            }}
          />
        )
      default:
        return null
    }
  }
  
  // Render file upload view
  if (!fileData) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Financial Data Analysis</CardTitle>
            <CardDescription>Upload an Excel or CSV file to begin analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center w-full">
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {loading ? (
                    <Loader2 className="w-10 h-10 mb-3 text-gray-400 animate-spin" />
                  ) : (
                    <FileText className="w-10 h-10 mb-3 text-gray-400" />
                  )}
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">Excel or CSV files only</p>
                </div>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileUpload}
                  disabled={loading}
                />
              </label>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  // Render data preview and analysis view
  if (fileData && !report) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Data Preview</h1>
          <Button
            onClick={() => {
              setFile(null)
              setFileData(null)
            }}
            variant="outline"
          >
            Upload Different File
          </Button>
        </div>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">{file?.name || 'Data Preview'}</CardTitle>
            <CardDescription>
              {fileData.length} records found in the file
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    {Object.keys(fileData[0]).map((key) => (
                      <th key={key} className="p-2 text-left text-sm border">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {fileData.slice(0, 5).map((row, i) => (
                    <tr key={i} className="border-b">
                      {Object.values(row).map((value: any, j) => (
                        <td key={j} className="p-2 text-sm border">
                          {value.toString()}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {fileData.length > 5 && (
                <p className="text-xs text-gray-500 mt-2">
                  Showing 5 of {fileData.length} records
                </p>
              )}
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-center mt-8">
          <Button
            onClick={analyzeData}
            disabled={analyzing}
            className="flex items-center gap-2"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing Data...
              </>
            ) : (
              <>
                <BarChart4 className="w-4 h-4" />
                Analyze with AI
              </>
            )}
          </Button>
        </div>
      </div>
    )
  }
  
  // Render analysis results
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Financial Analysis</h1>
        <div className="flex gap-4">
          <Button
            onClick={() => {
              setFile(null)
              setFileData(null)
              setReport(null)
            }}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            New Analysis
          </Button>
          <Button
            onClick={exportToPDF}
            disabled={exporting}
            className="flex items-center gap-2"
          >
            {exporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            Export PDF
          </Button>
        </div>
      </div>
      
      {report && (
        <div className="space-y-8">
          {/* Summary Section */}
          <Card>
            <CardHeader>
              <CardTitle>Executive Summary</CardTitle>
              <p className="text-sm text-gray-500">
                Analyzed on {new Date(report.createdAt).toLocaleDateString()}
              </p>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed">{report.analysis.summary}</p>
            </CardContent>
          </Card>
          
          {/* Key Metrics Section */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Key Performance Indicators</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {report.analysis.keyMetrics.map((metric) => (
                <Card key={metric.name} className="shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">{metric.name}</span>
                      {metric.trend === 'up' ? (
                        <div className="text-green-500">↑</div>
                      ) : metric.trend === 'down' ? (
                        <div className="text-red-500">↓</div>
                      ) : (
                        <div className="text-gray-500">→</div>
                      )}
                    </div>
                    <p className="text-2xl font-bold mt-2">{metric.value}</p>
                    {metric.change !== undefined && (
                      <p
                        className={`text-sm ${
                          metric.change > 0 ? 'text-green-500' : 'text-red-500'
                        }`}
                      >
                        {metric.change > 0 ? '+' : ''}
                        {metric.change}%
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          
          {/* Charts Section */}
          <div ref={chartsContainerRef}>
            <h2 className="text-2xl font-semibold mb-4">Data Visualizations</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {report.analysis.charts.map((chart) => (
                <Card key={chart.title}>
                  <CardHeader>
                    <CardTitle className="text-lg">{chart.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px]">
                      {renderChart(chart)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          
          {/* Insights and Recommendations Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Key Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {report.analysis.insights.map((insight, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span className="text-gray-600">{insight}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {report.analysis.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span className="text-gray-600">{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
} 