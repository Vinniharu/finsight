'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { 
  LayoutDashboard, 
  Upload, 
  FileText, 
  Settings, 
  LogOut,
  Menu,
  X
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={18} /> },
  { name: 'Upload Data', href: '/dashboard/upload', icon: <Upload size={18} /> },
  { name: 'Reports', href: '/dashboard/reports', icon: <FileText size={18} /> },
  { name: 'Settings', href: '/dashboard/settings', icon: <Settings size={18} /> },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-[#121212]">
      {/* Mobile sidebar toggle */}
      <div className="fixed top-0 left-0 right-0 z-20 flex items-center justify-between p-4 bg-[#121212] md:hidden">
        <Link href="/dashboard" className="text-xl font-bold text-white flex items-center">
          <span className="text-purple-500">Fin</span>Sight
        </Link>
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-white hover:text-purple-500"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      
      {/* Mobile sidebar and overlay - only rendered when sidebar is open */}
      {sidebarOpen && (
        <>
          <div className="fixed inset-0 z-30 md:hidden">
            <div 
              className="absolute inset-0 bg-black/50" 
              onClick={() => setSidebarOpen(false)}
            ></div>
            <div className="relative flex h-full w-72 flex-col bg-[#1a1a1a] pt-16 shadow-lg">
              <div className="flex-1 overflow-y-auto px-4">
                <nav className="mt-5 space-y-2">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                          isActive
                            ? 'bg-purple-900/30 text-purple-400'
                            : 'text-gray-300 hover:bg-purple-900/20 hover:text-purple-300'
                        }`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <span className={`mr-3 ${isActive ? 'text-purple-400' : 'text-gray-400'}`}>
                          {item.icon}
                        </span>
                        {item.name}
                      </Link>
                    )
                  })}
                </nav>
              </div>
              <div className="p-4 border-t border-gray-800">
                <button
                  onClick={() => signOut()}
                  className="flex w-full items-center rounded-lg px-3 py-3 text-sm font-medium text-gray-300 hover:bg-purple-900/20 hover:text-purple-300"
                >
                  <LogOut size={18} className="mr-3 text-gray-400" />
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-72 md:flex-col">
        <div className="flex min-h-0 flex-1 flex-col bg-[#1a1a1a] shadow-xl">
          <div className="flex h-16 items-center justify-center border-b border-gray-800">
            <Link href="/dashboard" className="text-xl font-bold text-white flex items-center">
              <span className="text-purple-500">Fin</span>Sight
            </Link>
          </div>
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <nav className="mt-2 flex-1 space-y-2 px-4">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-purple-900/30 text-purple-400'
                        : 'text-gray-300 hover:bg-purple-900/20 hover:text-purple-300'
                    }`}
                  >
                    <span className={`mr-3 ${isActive ? 'text-purple-400' : 'text-gray-400'}`}>
                      {item.icon}
                    </span>
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
          <div className="flex flex-shrink-0 border-t border-gray-800 p-4">
            <button
              onClick={() => signOut()}
              className="flex w-full items-center rounded-lg px-3 py-3 text-sm font-medium text-gray-300 hover:bg-purple-900/20 hover:text-purple-300"
            >
              <LogOut size={18} className="mr-3 text-gray-400" />
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col md:pl-72">
        <main className="flex-1">
          <div className="py-6 pt-16 md:pt-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 