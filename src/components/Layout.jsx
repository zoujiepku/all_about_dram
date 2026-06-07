import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function Layout({ completed, markComplete, level = 1 }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-dram-bg">
      <Sidebar
        completed={completed}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        level={level}
      />

      {/* Mobile top bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-10 h-14 bg-dram-surface border-b border-dram-border flex items-center px-4 gap-3">
        <button
          onClick={() => setSidebarOpen(true)}
          className="text-dram-muted hover:text-dram-text"
          aria-label="Open menu"
        >
          ☰
        </button>
        <span className="font-bold text-dram-text">💾 DRAM Deep Dive</span>
      </header>

      {/* Main content */}
      <main className="lg:ml-64 min-h-screen">
        <div className="max-w-3xl mx-auto px-6 py-10 pt-20 lg:pt-10">
          <Outlet context={{ markComplete }} />
        </div>
      </main>
    </div>
  )
}
