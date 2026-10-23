import React, { useState, useMemo } from 'react'
import { Search, X, CheckSquare, Target, ArrowRight, Calendar, Flag } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useNavigate } from 'react-router-dom'
import { formatTaskDate } from '../../lib/dateUtils'

export default function SearchModal() {
  const {
    isSearchOpen,
    setIsSearchOpen,
    tasks,
    goals,
    openEditTask,
    openEditGoal
  } = useApp()

  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) {
      return {
        tasks: tasks.slice(0, 5),
        goals: goals.slice(0, 3)
      }
    }

    const matchedTasks = tasks.filter(t =>
      t.title.toLowerCase().includes(q) ||
      (t.description && t.description.toLowerCase().includes(q)) ||
      (t.tags && t.tags.some(tag => tag.toLowerCase().includes(q))) ||
      (t.category && t.category.toLowerCase().includes(q))
    )

    const matchedGoals = goals.filter(g =>
      g.title.toLowerCase().includes(q) ||
      (g.description && g.description.toLowerCase().includes(q)) ||
      (g.category && g.category.toLowerCase().includes(q))
    )

    return { tasks: matchedTasks, goals: matchedGoals }
  }, [query, tasks, goals])

  if (!isSearchOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-card w-full max-w-xl rounded-2xl border border-border shadow-elevated overflow-hidden flex flex-col">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-border flex items-center gap-3">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks, goals, tags, projects..."
            className="w-full text-sm bg-transparent border-none focus:outline-none text-foreground placeholder:text-muted-foreground"
            autoFocus
          />
          <button
            onClick={() => setIsSearchOpen(false)}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-4">
          {/* Tasks Section */}
          <div>
            <div className="px-3 py-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Tasks ({filtered.tasks.length})
            </div>
            {filtered.tasks.length === 0 ? (
              <p className="px-3 py-2 text-xs text-muted-foreground">No tasks match.</p>
            ) : (
              <div className="space-y-1 mt-1">
                {filtered.tasks.map(task => (
                  <div
                    key={task.id}
                    onClick={() => {
                      setIsSearchOpen(false)
                      openEditTask(task)
                    }}
                    className="p-2.5 rounded-lg hover:bg-muted/70 cursor-pointer flex items-center justify-between text-xs group transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <CheckSquare className={`w-4 h-4 shrink-0 ${task.completed ? 'text-primary' : 'text-muted-foreground'}`} />
                      <div className="truncate">
                        <span className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                          {task.title}
                        </span>
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                          <span>{task.category}</span>
                          <span>•</span>
                          <span>{formatTaskDate(task.dueDate)}</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground group-hover:bg-background">
                      {task.priority}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Goals Section */}
          <div>
            <div className="px-3 py-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Goals ({filtered.goals.length})
            </div>
            {filtered.goals.length === 0 ? (
              <p className="px-3 py-2 text-xs text-muted-foreground">No goals match.</p>
            ) : (
              <div className="space-y-1 mt-1">
                {filtered.goals.map(goal => (
                  <div
                    key={goal.id}
                    onClick={() => {
                      setIsSearchOpen(false)
                      openEditGoal(goal)
                    }}
                    className="p-2.5 rounded-lg hover:bg-muted/70 cursor-pointer flex items-center justify-between text-xs group transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Target className="w-4 h-4 text-primary shrink-0" />
                      <div className="truncate">
                        <span className="font-medium text-foreground">{goal.title}</span>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {goal.currentValue} / {goal.targetValue} {goal.unit} • {Math.round((goal.currentValue / goal.targetValue) * 100)}%
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground group-hover:bg-background">
                      {goal.category}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-border bg-muted/40 text-[11px] text-muted-foreground flex items-center justify-between px-4">
          <span>Click any item to view details or edit</span>
          <kbd className="px-1.5 py-0.5 rounded bg-background border border-border font-mono text-[10px]">ESC to close</kbd>
        </div>
      </div>
    </div>
  )
}
