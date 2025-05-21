'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Save, BarChart, PieChart, Gauge } from 'lucide-react'
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Colors
} from 'chart.js'
import { Bar, Pie, Doughnut } from 'react-chartjs-2'
import html2canvas from 'html2canvas'
import { toast } from 'sonner'

// Register ChartJS components
ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Colors
)

export interface AnalysisData {
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
  }[]
  rawData: {
    categories: string[]
    values: number[]
  }[]
}

interface DataDashboardProps {
  data: AnalysisData
  title?: string
}

export default function DataDashboard({ data, title = 'Financial Data Dashboard' }: DataDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const dashboardRef = useRef<HTMLDivElement>(null)
  const exportRef = useRef<HTMLDivElement>(null)
  const [downloading, setDownloading] = useState(false)
  const [showExportPreview, setShowExportPreview] = useState(false)

  // Create bar chart data from raw data if available
  const rawBarData = {
    labels: data.rawData[0]?.categories || [],
    datasets: [
      {
        label: 'Values',
        data: data.rawData[0]?.values || [],
        backgroundColor: [
          'rgba(139, 92, 246, 0.7)',
          'rgba(168, 85, 247, 0.7)',
          'rgba(192, 132, 252, 0.7)',
          'rgba(216, 180, 254, 0.7)',
          'rgba(233, 213, 255, 0.7)',
        ],
        borderWidth: 1,
      },
    ],
  }

  // Create pie chart data from first provided chart or key metrics
  const pieData = {
    labels: data.charts[0]?.data.labels || data.keyMetrics.map(m => m.name),
    datasets: [
      {
        label: data.charts[0]?.data.datasets[0]?.label || 'Key Metrics',
        data: data.charts[0]?.data.datasets[0]?.data || data.keyMetrics.map(m => m.value),
        backgroundColor: [
          'rgba(139, 92, 246, 0.7)',
          'rgba(168, 85, 247, 0.7)',
          'rgba(192, 132, 252, 0.7)',
          'rgba(216, 180, 254, 0.7)',
          'rgba(233, 213, 255, 0.7)',
          'rgba(245, 208, 254, 0.7)',
        ],
        borderWidth: 1,
      },
    ],
  }

  const downloadAsImage = async () => {
    setDownloading(true)
    try {
      // Show the export preview with all data
      setShowExportPreview(true)
      
      // Wait for the export preview to render
      await new Promise(resolve => setTimeout(resolve, 500))
      
      if (!exportRef.current) {
        throw new Error('Export preview not found')
      }
      
      // Force chart rendering
      window.dispatchEvent(new Event('resize'))
      
      // Wait a bit more for charts to render
      await new Promise(resolve => setTimeout(resolve, 800))

      // Capture the export preview
      const canvas = await html2canvas(exportRef.current, { 
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#121212'
      })
      
      // Create download link
      const link = document.createElement('a')
      link.download = `${title.replace(/\s+/g, '-').toLowerCase()}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
      
      toast.success('Image downloaded successfully!')
    } catch (error) {
      console.error('Error downloading dashboard image:', error)
      toast.error('Failed to download image. Please try again.')
    } finally {
      setDownloading(false)
      setShowExportPreview(false)
    }
  }

  // Close export preview when ESC key is pressed
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showExportPreview) {
        setShowExportPreview(false)
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showExportPreview])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        <div className="flex gap-2">
          <Button 
            onClick={downloadAsImage} 
            disabled={downloading}
            variant="outline"
            className="border-gray-700 bg-[#222222] hover:bg-[#2a2a2a] text-gray-300"
          >
            <Save className="mr-2 h-4 w-4 text-purple-400" />
            {downloading ? 'Processing...' : 'Download Image'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto mb-4 bg-[#222222] p-1">
          <TabsTrigger value="overview" className="data-[state=active]:bg-purple-900 data-[state=active]:text-white">
            <BarChart className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="charts" className="data-[state=active]:bg-purple-900 data-[state=active]:text-white">
            <PieChart className="h-4 w-4 mr-2" />
            Charts
          </TabsTrigger>
          <TabsTrigger value="insights" className="data-[state=active]:bg-purple-900 data-[state=active]:text-white">
            <Gauge className="h-4 w-4 mr-2" />
            Insights
          </TabsTrigger>
        </TabsList>

        <div ref={dashboardRef} id="dashboard-content" className="bg-[#121212] rounded-lg border border-gray-800 p-4">
          {activeTab === 'overview' && (
            <TabsContent value="overview" className="mt-0">
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="border-gray-800 bg-[#1A1A1A] shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-white">Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-400">{data.summary}</p>
                  </CardContent>
                </Card>

                <Card className="border-gray-800 bg-[#1A1A1A] shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-white">Key Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {data.keyMetrics.map((metric, index) => (
                        <li key={index} className="flex justify-between p-2 rounded bg-[#222222]">
                          <span className="font-medium text-gray-300">{metric.name}:</span>
                          <span className="flex items-center text-white">
                            {metric.value}
                            {metric.trend === 'up' && <span className="text-green-500 ml-1">↑</span>}
                            {metric.trend === 'down' && <span className="text-red-500 ml-1">↓</span>}
                            {metric.trend === 'stable' && <span className="text-gray-500 ml-1">→</span>}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="md:col-span-2 border-gray-800 bg-[#1A1A1A] shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-white">Overview Chart</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <Bar 
                        data={rawBarData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'top',
                              labels: {
                                color: 'rgb(156, 163, 175)'
                              }
                            },
                            title: {
                              display: true,
                              text: 'Data Overview',
                              color: 'rgb(156, 163, 175)'
                            },
                          },
                          scales: {
                            y: {
                              ticks: { color: 'rgb(156, 163, 175)' },
                              grid: { color: 'rgba(75, 85, 99, 0.2)' }
                            },
                            x: {
                              ticks: { color: 'rgb(156, 163, 175)' },
                              grid: { color: 'rgba(75, 85, 99, 0.2)' }
                            }
                          }
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )}

          {activeTab === 'charts' && (
            <TabsContent value="charts" className="mt-0">
              <div className="grid gap-6 md:grid-cols-2">
                {data.charts.map((chart, index) => (
                  <Card key={index} className="border-gray-800 bg-[#1A1A1A] shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-white">{chart.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        {chart.type === 'bar' && (
                          <Bar 
                            data={chart.data}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              plugins: {
                                legend: {
                                  labels: {
                                    color: 'rgb(156, 163, 175)'
                                  }
                                }
                              },
                              scales: {
                                y: {
                                  ticks: { color: 'rgb(156, 163, 175)' },
                                  grid: { color: 'rgba(75, 85, 99, 0.2)' }
                                },
                                x: {
                                  ticks: { color: 'rgb(156, 163, 175)' },
                                  grid: { color: 'rgba(75, 85, 99, 0.2)' }
                                }
                              }
                            }}
                          />
                        )}
                        {chart.type === 'pie' && (
                          <Pie 
                            data={chart.data}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              plugins: {
                                legend: {
                                  position: 'right',
                                  labels: {
                                    color: 'rgb(156, 163, 175)'
                                  }
                                }
                              }
                            }}
                          />
                        )}
                        {chart.type === 'scatter' && (
                          <div className="flex items-center justify-center h-full">
                            <p className="text-center text-gray-500">Scatter plot not available</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <Card className="border-gray-800 bg-[#1A1A1A] shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-white">Key Metrics Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <Doughnut 
                        data={{
                          labels: data.keyMetrics.map(m => m.name),
                          datasets: [{
                            data: data.keyMetrics.map(m => m.value),
                            backgroundColor: [
                              'rgba(139, 92, 246, 0.8)',
                              'rgba(168, 85, 247, 0.8)',
                              'rgba(192, 132, 252, 0.8)',
                              'rgba(216, 180, 254, 0.8)',
                              'rgba(233, 213, 255, 0.8)',
                            ],
                            borderWidth: 1,
                          }],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'right',
                              labels: {
                                color: 'rgb(156, 163, 175)'
                              }
                            },
                          },
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-gray-800 bg-[#1A1A1A] shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-white">Data Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <Pie 
                        data={pieData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'right',
                              labels: {
                                color: 'rgb(156, 163, 175)'
                              }
                            },
                          },
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )}

          {activeTab === 'insights' && (
            <TabsContent value="insights" className="mt-0">
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="border-gray-800 bg-[#1A1A1A] shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-white">Key Insights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 list-disc pl-5">
                      {data.insights.map((insight, index) => (
                        <li key={index} className="text-sm text-gray-300">{insight}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-gray-800 bg-[#1A1A1A] shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-white">Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 list-disc pl-5">
                      {data.recommendations.map((recommendation, index) => (
                        <li key={index} className="text-sm text-gray-300">{recommendation}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )}
        </div>
      </Tabs>
      
      {/* Hidden export layout that shows all data on one page for image export */}
      {showExportPreview && (
        <div 
          ref={exportRef} 
          className="fixed inset-0 bg-[#121212] p-8 overflow-auto z-50"
          style={{ width: 1200, height: 1600 }} // Fixed size for consistent export
        >
          <div className="space-y-8">
            <h1 className="text-3xl font-bold text-white text-center border-b border-gray-800 pb-4">{title}</h1>
            
            {/* Summary Section */}
            <div className="space-y-4">
              <h2 className="text-2xl text-white font-bold">Overview</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="border-gray-800 bg-[#1A1A1A] shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-white">Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-400">{data.summary}</p>
                  </CardContent>
                </Card>

                <Card className="border-gray-800 bg-[#1A1A1A] shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-white">Key Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {data.keyMetrics.map((metric, index) => (
                        <li key={index} className="flex justify-between p-2 rounded bg-[#222222]">
                          <span className="font-medium text-gray-300">{metric.name}:</span>
                          <span className="flex items-center text-white">
                            {metric.value}
                            {metric.trend === 'up' && <span className="text-green-500 ml-1">↑</span>}
                            {metric.trend === 'down' && <span className="text-red-500 ml-1">↓</span>}
                            {metric.trend === 'stable' && <span className="text-gray-500 ml-1">→</span>}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
              
              {/* Main Chart */}
              <Card className="border-gray-800 bg-[#1A1A1A] shadow-lg">
                <CardHeader>
                  <CardTitle className="text-white">Overview Chart</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <Bar 
                      data={rawBarData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'top',
                            labels: {
                              color: 'rgb(156, 163, 175)'
                            }
                          },
                          title: {
                            display: true,
                            text: 'Data Overview',
                            color: 'rgb(156, 163, 175)'
                          },
                        },
                        scales: {
                          y: {
                            ticks: { color: 'rgb(156, 163, 175)' },
                            grid: { color: 'rgba(75, 85, 99, 0.2)' }
                          },
                          x: {
                            ticks: { color: 'rgb(156, 163, 175)' },
                            grid: { color: 'rgba(75, 85, 99, 0.2)' }
                          }
                        }
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Charts Section */}
            <div className="space-y-4">
              <h2 className="text-2xl text-white font-bold">Charts</h2>
              <div className="grid gap-6 md:grid-cols-2">
                {data.charts.map((chart, index) => (
                  <Card key={index} className="border-gray-800 bg-[#1A1A1A] shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-white">{chart.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[250px]">
                        {chart.type === 'bar' && (
                          <Bar 
                            data={chart.data}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              plugins: {
                                legend: {
                                  labels: {
                                    color: 'rgb(156, 163, 175)'
                                  }
                                }
                              },
                              scales: {
                                y: {
                                  ticks: { color: 'rgb(156, 163, 175)' },
                                  grid: { color: 'rgba(75, 85, 99, 0.2)' }
                                },
                                x: {
                                  ticks: { color: 'rgb(156, 163, 175)' },
                                  grid: { color: 'rgba(75, 85, 99, 0.2)' }
                                }
                              }
                            }}
                          />
                        )}
                        {chart.type === 'pie' && (
                          <Pie 
                            data={chart.data}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              plugins: {
                                legend: {
                                  position: 'right',
                                  labels: {
                                    color: 'rgb(156, 163, 175)'
                                  }
                                }
                              }
                            }}
                          />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {/* Additional charts */}
                <Card className="border-gray-800 bg-[#1A1A1A] shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-white">Key Metrics Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[250px]">
                      <Doughnut 
                        data={{
                          labels: data.keyMetrics.map(m => m.name),
                          datasets: [{
                            data: data.keyMetrics.map(m => m.value),
                            backgroundColor: [
                              'rgba(139, 92, 246, 0.8)',
                              'rgba(168, 85, 247, 0.8)',
                              'rgba(192, 132, 252, 0.8)',
                              'rgba(216, 180, 254, 0.8)',
                              'rgba(233, 213, 255, 0.8)',
                            ],
                            borderWidth: 1,
                          }],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'right',
                              labels: {
                                color: 'rgb(156, 163, 175)'
                              }
                            },
                          },
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            {/* Insights Section */}
            <div className="space-y-4">
              <h2 className="text-2xl text-white font-bold">Insights & Recommendations</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="border-gray-800 bg-[#1A1A1A] shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-white">Key Insights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 list-disc pl-5">
                      {data.insights.map((insight, index) => (
                        <li key={index} className="text-sm text-gray-300">{insight}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-gray-800 bg-[#1A1A1A] shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-white">Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 list-disc pl-5">
                      {data.recommendations.map((recommendation, index) => (
                        <li key={index} className="text-sm text-gray-300">{recommendation}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 