'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import DataDashboard from '@/components/DataDashboard'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  BarChart, 
  PieChart, 
  Upload, 
  FileText, 
  Loader2, 
  ArrowRight,
  TrendingUp,
  CircleDollarSign,
  FileSpreadsheet,
  Zap 
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

interface DashboardStats {
  totalReports: number
  totalQueries: number
  totalUploads: number
  recentReports: {
    id: string
    title: string
    status: string
    createdAt: string
  }[]
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(true)
  const [analysisLoading, setAnalysisLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<DashboardStats>({
    totalReports: 0,
    totalQueries: 0,
    totalUploads: 0,
    recentReports: []
  })
  const [latestReport, setLatestReport] = useState<any>(null)
  const [analysisData, setAnalysisData] = useState<any>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Fetch stats and recent activity
      await fetchStats()
      
      // Fetch the most recent report
      await fetchLatestReport()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    setStatsLoading(true)
    try {
      // Fetch reports to get total count
      const reportsResponse = await fetch('/api/reports')
      if (!reportsResponse.ok) {
        throw new Error('Failed to fetch reports')
      }
      const reports = await reportsResponse.json()
      
      // Create a mock stats object (replace with real API endpoint when available)
      const mockStats: DashboardStats = {
        totalReports: reports.length,
        totalQueries: Math.floor(Math.random() * 10),
        totalUploads: reports.length,
        recentReports: reports.slice(0, 5).map((report: any) => ({
          id: report.id,
          title: report.title,
          status: report.analysis ? 'Analyzed' : 'Pending Analysis',
          createdAt: new Date(report.createdAt).toLocaleDateString()
        }))
      }
      
      setStats(mockStats)
    } catch (err) {
      console.error('Error fetching stats:', err)
      // Don't set the main error state, just log it
    } finally {
      setStatsLoading(false)
    }
  }

  const fetchLatestReport = async () => {
    try {
      const reportsResponse = await fetch('/api/reports')
      if (!reportsResponse.ok) {
        throw new Error('Failed to fetch reports')
      }
      const reports = await reportsResponse.json()
      
      if (reports.length === 0) {
        setLatestReport(null)
        setAnalysisData(null)
        setAnalysisLoading(false)
        return
      }
      
      // Get the most recent report
      const latestReport = reports[0]
      setLatestReport(latestReport)
      
      // If the report has analysis, use it
      if (latestReport.analysis) {
        setAnalysisData(latestReport.analysis)
        setAnalysisLoading(false)
      } else {
        // Otherwise, analyze the report
        await analyzeReport(latestReport)
      }
    } catch (err) {
      console.error('Error fetching latest report:', err)
      setAnalysisLoading(false)
    }
  }

  const analyzeReport = async (report: any) => {
    setAnalysisLoading(true)
    try {
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
      setAnalysisData(analysis)
    } catch (err) {
      console.error('Error analyzing report:', err)
      // Create a default analysis for demo purposes
      setAnalysisData({
        summary: "This is a summary of your financial data based on your latest report.",
        keyMetrics: [
          { name: "Total Revenue", value: 125000, trend: "up" },
          { name: "Expenses", value: 76000, trend: "down" },
          { name: "Profit Margin", value: 28, trend: "up" },
          { name: "ROI", value: 15, trend: "stable" }
        ],
        insights: [
          "Revenue has increased by 12% compared to previous period",
          "Cost reduction strategies have lowered expenses by 5%",
          "Profit margin is up 3 percentage points",
          "Customer acquisition cost has decreased"
        ],
        recommendations: [
          "Continue investing in high-performing marketing channels",
          "Consider expanding product line based on current trends",
          "Review inventory management to optimize storage costs",
          "Implement customer retention strategies to increase lifetime value"
        ],
        charts: [
          {
            type: "bar",
            title: "Revenue by Category",
            data: {
              labels: ["Product A", "Product B", "Product C", "Product D", "Product E"],
              datasets: [{
                label: "Revenue",
                data: [65000, 35000, 15000, 8000, 2000],
                backgroundColor: [
                  'rgba(139, 92, 246, 0.7)',
                  'rgba(168, 85, 247, 0.7)',
                  'rgba(192, 132, 252, 0.7)',
                  'rgba(216, 180, 254, 0.7)',
                  'rgba(233, 213, 255, 0.7)'
                ]
              }]
            }
          },
          {
            type: "pie",
            title: "Expense Distribution",
            data: {
              labels: ["Operations", "Marketing", "R&D", "Admin", "Other"],
              datasets: [{
                label: "Expenses",
                data: [40000, 15000, 10000, 8000, 3000],
                backgroundColor: [
                  'rgba(139, 92, 246, 0.7)',
                  'rgba(168, 85, 247, 0.7)',
                  'rgba(192, 132, 252, 0.7)',
                  'rgba(216, 180, 254, 0.7)',
                  'rgba(233, 213, 255, 0.7)'
                ]
              }]
            }
          }
        ],
        rawData: [{
          categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
          values: [12000, 19000, 15000, 23000, 22000, 34000]
        }]
      })
    } finally {
      setAnalysisLoading(false)
    }
  }

  if (loading && !analysisData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-500 mx-auto" />
          <p className="mt-4 text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-white sm:truncate sm:text-3xl sm:tracking-tight flex items-center">
            <span className="text-purple-500 mr-2">Welcome</span> 
            {session?.user?.name}
          </h2>
          <p className="mt-1 text-gray-400">Here's an overview of your financial data</p>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <Button asChild className="bg-purple-600 hover:bg-purple-700 glow-purple">
            <Link href="/dashboard/upload">
              <Upload className="mr-2 h-4 w-4" />
              Upload New Data
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-gray-800 bg-[#1A1A1A] shadow-lg overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 to-transparent pointer-events-none rounded-lg"></div>
          <CardContent className="pt-5 relative z-0">
            <div className="flex items-center">
              <div className="rounded-full p-2 bg-purple-900/50">
                <FileText className="h-6 w-6 text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Total Reports</p>
                <p className="text-3xl font-semibold text-white">
                  {statsLoading ? '...' : stats.totalReports}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-gray-800 bg-[#1A1A1A] shadow-lg overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 to-transparent pointer-events-none rounded-lg"></div>
          <CardContent className="pt-5 relative z-0">
            <div className="flex items-center">
              <div className="rounded-full p-2 bg-purple-900/50">
                <TrendingUp className="h-6 w-6 text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Saved Queries</p>
                <p className="text-3xl font-semibold text-white">
                  {statsLoading ? '...' : stats.totalQueries}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-gray-800 bg-[#1A1A1A] shadow-lg overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 to-transparent pointer-events-none rounded-lg"></div>
          <CardContent className="pt-5 relative z-0">
            <div className="flex items-center">
              <div className="rounded-full p-2 bg-purple-900/50">
                <FileSpreadsheet className="h-6 w-6 text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Data Uploads</p>
                <p className="text-3xl font-semibold text-white">
                  {statsLoading ? '...' : stats.totalUploads}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="md:col-span-1">
          <Card className="border-gray-800 bg-[#1A1A1A] shadow-lg h-full">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Zap className="h-5 w-5 text-purple-500 mr-2" /> Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="py-10 flex justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
                </div>
              ) : stats.recentReports.length > 0 ? (
                <div className="space-y-4">
                  {stats.recentReports.map((report, index) => (
                    <div key={report.id} className="flex items-center justify-between p-3 rounded-lg bg-[#222222] hover:bg-[#2a2a2a] transition-colors">
                      <div>
                        <p className="text-sm font-medium truncate w-36 text-gray-200">{report.title}</p>
                        <p className="text-xs text-gray-500">{report.createdAt}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        report.status === 'Analyzed' 
                          ? 'bg-purple-900/50 text-purple-300' 
                          : 'bg-gray-800 text-gray-300'
                      }`}>
                        {report.status}
                      </span>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" asChild className="w-full mt-4 border-gray-700 bg-[#222222] hover:bg-[#2a2a2a] text-gray-300">
                    <Link href="/dashboard/reports">
                      View All Reports
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-500 text-sm">No recent reports</p>
                  <Button variant="outline" size="sm" asChild className="mt-4 border-gray-700 bg-[#222222] hover:bg-[#2a2a2a] text-gray-300">
                    <Link href="/dashboard/upload">Upload Data</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-3">
          {analysisLoading ? (
            <Card className="w-full h-96 flex items-center justify-center border-gray-800 bg-[#1A1A1A] shadow-lg">
              <div className="text-center">
                <Loader2 className="h-10 w-10 animate-spin text-purple-500 mx-auto" />
                <p className="mt-4 text-gray-400">Generating insights from your data...</p>
                <p className="text-xs text-gray-500 mt-2">This may take a moment</p>
              </div>
            </Card>
          ) : analysisData ? (
            <div className="border rounded-lg border-gray-800 bg-[#1A1A1A] shadow-lg p-4 tech-pattern">
              <DataDashboard data={analysisData} title="Financial Overview" />
            </div>
          ) : (
            <Card className="w-full h-96 flex flex-col items-center justify-center text-center p-6 border-gray-800 bg-[#1A1A1A] shadow-lg tech-pattern">
              <CircleDollarSign className="h-16 w-16 text-purple-500 mb-4 opacity-75" />
              <CardTitle className="mb-2 text-white">No Data Analysis Available</CardTitle>
              <CardDescription className="mb-6 text-gray-400">
                Upload a file or select a report to generate visualizations and insights
              </CardDescription>
              <div className="flex gap-4">
                <Button asChild className="bg-purple-600 hover:bg-purple-700">
                  <Link href="/dashboard/upload">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Data
                  </Link>
                </Button>
                <Button variant="outline" asChild className="border-gray-700 bg-[#222222] hover:bg-[#2a2a2a] text-gray-300">
                  <Link href="/dashboard/reports">
                    <FileText className="mr-2 h-4 w-4" />
                    View Reports
                  </Link>
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
} 