import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom'
import { lessons } from '../data/lessons'
import { lessonsL2 } from '../data/lessonsL2'
import { lessonsZh } from '../data/lessons.zh'
import { lessonsL2Zh } from '../data/lessonsL2.zh'

export default function Sidebar({ completed, isOpen, onClose, level = 1, lang = 'en', light = false, onToggleTheme }) {
  const location = useLocation()
  const navigate = useNavigate()

  const activeList = level === 2
    ? (lang === 'zh' ? lessonsL2Zh : lessonsL2)
    : (lang === 'zh' ? lessonsZh : lessons)

  const clusters = level === 2
    ? [...new Set(activeList.map((l) => l.cluster))].map((c) => ({
        key: c,
        name: activeList.find((l) => l.cluster === c).clusterName,
        lessons: activeList.filter((l) => l.cluster === c),
      }))
    : null

  function switchLang(targetLang) {
    const path = location.pathname
    if (targetLang === 'zh') {
      if (!path.startsWith('/zh')) {
        navigate('/zh' + path)
      }
    } else {
      if (path.startsWith('/zh')) {
        navigate(path.slice(3) || '/')
      }
    }
    onClose()
  }

  const l1Link = lang === 'zh' ? '/zh/lesson/1' : '/lesson/1'
  const l2Link = lang === 'zh' ? '/zh/level2/lesson/1' : '/level2/lesson/1'

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-dram-surface border-r border-dram-border z-30
          flex flex-col transition-transform duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className="p-5 border-b border-dram-border">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">💾</span>
            <h1 className="text-lg font-bold text-dram-text">All About DRAM</h1>
          </div>
          <p className="text-xs text-dram-muted">
            {lang === 'zh' ? '交互式教程' : 'Interactive Tutorial'}
          </p>
        </div>

        {/* Language toggle — desktop only; mobile uses top bar toggle */}
        <div className="px-5 py-2.5 border-b border-dram-border hidden lg:flex gap-2">
          <button
            onClick={() => switchLang('en')}
            className={`flex-1 text-center text-xs font-semibold py-1.5 rounded-md transition-colors ${
              lang === 'en'
                ? 'bg-dram-amber/20 text-dram-amber border border-dram-amber/40'
                : 'text-dram-muted hover:text-dram-text bg-dram-bg sidebar-hover'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => switchLang('zh')}
            className={`flex-1 text-center text-xs font-semibold py-1.5 rounded-md transition-colors ${
              lang === 'zh'
                ? 'bg-dram-amber/20 text-dram-amber border border-dram-amber/40'
                : 'text-dram-muted hover:text-dram-text bg-dram-bg sidebar-hover'
            }`}
          >
            中文
          </button>
        </div>

        {/* Level toggle */}
        <div className="px-5 py-3 border-b border-dram-border flex gap-2">
          <Link
            to={l1Link}
            onClick={onClose}
            className={`flex-1 text-center text-xs font-semibold py-1.5 rounded-md transition-colors ${
              level === 1
                ? 'bg-dram-blue text-white'
                : 'text-dram-muted hover:text-dram-text bg-dram-bg sidebar-hover'
            }`}
          >
            {lang === 'zh' ? '初阶' : 'Level 1'}
          </Link>
          <Link
            to={l2Link}
            onClick={onClose}
            className={`flex-1 text-center text-xs font-semibold py-1.5 rounded-md transition-colors ${
              level === 2
                ? 'bg-dram-blue text-white'
                : 'text-dram-muted hover:text-dram-text bg-dram-bg sidebar-hover'
            }`}
          >
            {lang === 'zh' ? '进阶' : 'Level 2'}
          </Link>
        </div>

        {/* Progress */}
        <div className="px-5 py-3 border-b border-dram-border">
          <div className="flex justify-between text-xs text-dram-muted mb-1.5">
            <span>{lang === 'zh' ? '进度' : 'Progress'}</span>
            <span>{completed.size} / {activeList.length}</span>
          </div>
          <div className="h-1.5 bg-dram-bg rounded-full overflow-hidden">
            <div
              className="h-full bg-dram-blue rounded-full transition-all duration-500"
              style={{ width: `${(completed.size / activeList.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Lesson list */}
        <nav className="flex-1 overflow-y-auto py-2">
          {clusters ? (
            clusters.map((cluster) => (
              <div key={cluster.key}>
                <div className="px-4 pt-3 pb-1 text-xs font-semibold text-dram-blue uppercase tracking-widest">
                  {cluster.name}
                </div>
                {cluster.lessons.map((lesson) => (
                  <LessonLink key={lesson.id} lesson={lesson} completed={completed} onClose={onClose} />
                ))}
              </div>
            ))
          ) : (
            activeList.map((lesson) => (
              <LessonLink key={lesson.id} lesson={lesson} completed={completed} onClose={onClose} />
            ))
          )}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-dram-border flex items-center justify-between">
          <span className="text-xs text-dram-muted">
            {level === 2
              ? (lang === 'zh' ? '高级电路与系统深度' : 'Advanced circuit & system depth')
              : (lang === 'zh' ? '基于 ISCA 2002 · Micron · IEEE 2024' : 'Based on ISCA 2002 · Micron · IEEE 2024')}
          </span>
          <button
            onClick={onToggleTheme}
            className="text-dram-muted hover:text-dram-text text-lg leading-none ml-2 flex-shrink-0"
            aria-label="Toggle theme"
          >
            {light ? '☾' : '☀'}
          </button>
        </div>
      </aside>
    </>
  )
}

function LessonLink({ lesson, completed, onClose }) {
  const isDone = completed.has(lesson.id)
  return (
    <NavLink
      to={lesson.path}
      onClick={onClose}
      className={({ isActive }) => `
        flex items-start gap-3 px-4 py-3 text-sm transition-colors
        ${isActive
          ? 'bg-dram-blue/10 border-r-2 border-dram-blue text-dram-text'
          : 'text-dram-muted hover:text-dram-text sidebar-hover'}
      `}
    >
      <span className="mt-0.5 text-base leading-none">{lesson.icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-dram-muted font-mono">
            {String(lesson.id).padStart(2, '0')}
          </span>
          <span className="font-medium truncate">{lesson.title}</span>
          {isDone && (
            <span className="ml-auto text-dram-green text-xs">✓</span>
          )}
        </div>
        <p className="text-xs text-dram-muted/70 truncate mt-0.5">{lesson.subtitle}</p>
      </div>
    </NavLink>
  )
}
