import { useState, useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function Layout({ completed, markComplete, level = 1, lang = 'en' }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [light, setLight] = useState(() => localStorage.getItem('theme') !== 'dark')
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    document.documentElement.classList.toggle('light', light)
    localStorage.setItem('theme', light ? 'light' : 'dark')
  }, [light])

  function switchLang(targetLang) {
    const path = location.pathname
    if (targetLang === 'zh' && !path.startsWith('/zh')) {
      navigate('/zh' + path)
    } else if (targetLang === 'en' && path.startsWith('/zh')) {
      navigate(path.slice(3) || '/')
    }
  }

  return (
    <div className="min-h-screen bg-dram-bg">
      <Sidebar
        completed={completed}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        level={level}
        lang={lang}
        light={light}
        onToggleTheme={() => setLight((l) => !l)}
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
        <span className="font-bold text-dram-text flex-1">💾 All About DRAM</span>
        <button
          onClick={() => switchLang(lang === 'zh' ? 'en' : 'zh')}
          className="text-xs font-semibold px-2 py-1 rounded-md border border-dram-border text-dram-muted hover:text-dram-text hover:border-dram-amber transition-colors"
          aria-label="Switch language"
        >
          {lang === 'zh' ? 'EN' : '中文'}
        </button>
        <button
          onClick={() => setLight((l) => !l)}
          className="text-dram-muted hover:text-dram-text text-lg leading-none"
          aria-label="Toggle theme"
        >
          {light ? '☾' : '☀'}
        </button>
      </header>

      {/* Main content */}
      <main className="lg:ml-64 min-h-screen">
        <div className="max-w-3xl mx-auto px-6 py-10 pt-20 lg:pt-10">
          <Outlet context={{ markComplete, lang }} />
        </div>
      </main>
    </div>
  )
}
