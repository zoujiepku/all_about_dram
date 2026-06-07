import { Link } from 'react-router-dom'
import { lessons as defaultLessons } from '../data/lessons'

export default function LessonNav({ lessonId, onComplete, lessons = defaultLessons }) {
  const idx = lessons.findIndex((l) => l.id === lessonId)
  const prev = idx > 0 ? lessons[idx - 1] : null
  const next = idx < lessons.length - 1 ? lessons[idx + 1] : null

  return (
    <div className="mt-12 pt-6 border-t border-dram-border flex items-center justify-between gap-4">
      {prev ? (
        <Link
          to={prev.path}
          onClick={() => window.scrollTo(0, 0)}
          className="flex items-center gap-2 text-sm text-dram-muted hover:text-dram-text transition-colors group"
        >
          <span className="text-lg group-hover:-translate-x-0.5 transition-transform">←</span>
          <div>
            <div className="text-xs text-dram-muted/60">Previous</div>
            <div className="font-medium">{prev.title}</div>
          </div>
        </Link>
      ) : (
        <div />
      )}

      <button
        onClick={onComplete}
        className="px-4 py-2 rounded-lg bg-dram-green/10 text-dram-green text-sm font-medium
                   hover:bg-dram-green/20 transition-colors border border-dram-green/30"
      >
        Mark Complete ✓
      </button>

      {next ? (
        <Link
          to={next.path}
          onClick={() => window.scrollTo(0, 0)}
          className="flex items-center gap-2 text-sm text-dram-muted hover:text-dram-text transition-colors group text-right"
        >
          <div>
            <div className="text-xs text-dram-muted/60">Next</div>
            <div className="font-medium">{next.title}</div>
          </div>
          <span className="text-lg group-hover:translate-x-0.5 transition-transform">→</span>
        </Link>
      ) : (
        <div />
      )}
    </div>
  )
}
