import Link from 'next/link'
import { ArrowRight, Database, BarChart3, FileSpreadsheet, Download, Clock3 } from 'lucide-react'

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white overflow-hidden">
      {/* Glowing background effect */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-900/30 rounded-full filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-purple-700/20 rounded-full filter blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-violet-800/20 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
      </div>

      {/* Futuristic grid pattern */}
      <div className="absolute inset-0 z-0 opacity-10" 
        style={{ 
          backgroundImage: 'linear-gradient(to right, #8b5cf6 1px, transparent 1px), linear-gradient(to bottom, #8b5cf6 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 py-20 flex items-center min-h-[80vh]">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <div className="mb-4 inline-block">
              <span className="inline-block px-3 py-1 bg-purple-900/40 backdrop-blur-sm text-purple-300 rounded-full text-sm font-medium mb-4 border border-purple-800/60">
                FINANCIAL ANALYTICS PLATFORM
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-violet-400 to-purple-600">
              Transform Excel Data into Actionable Insights
            </h1>
            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
              FinSight bridges the gap between Excel-based financial data and SQL-powered analytics for SMEs.
            </p>
            <div className="space-x-6">
              <Link
                href="/auth/signup"
                className="bg-gradient-to-r from-purple-700 to-violet-900 text-white px-8 py-4 rounded-lg font-semibold hover:opacity-90 transition-all duration-300 inline-flex items-center group"
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/auth/login"
                className="bg-white/10 backdrop-blur-sm text-white border border-purple-800/40 px-8 py-4 rounded-lg font-semibold hover:bg-white/15 transition-all duration-300"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-20 bg-black/70 backdrop-blur-md">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-violet-500 inline-block">
              Powerful Features
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-purple-600 to-violet-800 mx-auto mt-4"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="group bg-gradient-to-br from-purple-900/20 to-black backdrop-blur-md p-8 rounded-2xl border border-purple-900/30 hover:border-purple-700/60 transition-all duration-300 hover:shadow-[0_0_30px_rgba(139,92,246,0.2)] hover:-translate-y-1"
              >
                <div className="mb-5 p-3 inline-block bg-purple-900/30 rounded-xl text-purple-400 group-hover:text-purple-300 group-hover:bg-purple-900/40 transition-all duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">{feature.title}</h3>
                <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">{feature.description}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-16 text-center">
            <Link
              href="/auth/signup"
              className="bg-white/10 backdrop-blur-sm border border-purple-800/40 px-8 py-4 rounded-full font-medium hover:bg-purple-900/20 transition-all duration-300 inline-flex items-center"
            >
              Explore All Features
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

const features = [
  {
    title: 'Smart Excel Import',
    description: 'Upload .xlsx or .csv files with automatic schema detection and validation.',
    icon: <Database className="h-6 w-6" />,
  },
  {
    title: 'Dynamic Dashboards',
    description: 'Generate interactive financial visualizations and KPI tracking.',
    icon: <BarChart3 className="h-6 w-6" />,
  },
  {
    title: 'Report Templates',
    description: 'Choose from industry-standard financial report templates or create custom ones.',
    icon: <FileSpreadsheet className="h-6 w-6" />,
  },
  {
    title: 'Export Options',
    description: 'Download reports in multiple formats including PDF, Excel, CSV, and JSON.',
    icon: <Download className="h-6 w-6" />,
  },
  {
    title: 'Scheduled Reports',
    description: 'Set up automated report generation and distribution.',
    icon: <Clock3 className="h-6 w-6" />,
  },
  {
    title: 'AI-Powered Analysis',
    description: 'Leverage machine learning to uncover insights and patterns in your financial data.',
    icon: <BarChart3 className="h-6 w-6" />,
  },
] 