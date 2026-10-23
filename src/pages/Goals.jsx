import React, { useState } from 'react'
import {
  Plus,
  Target,
  Calendar,
  CheckCircle2,
  Trash2,
  Edit2,
  TrendingUp,
  AlertCircle,
  Folder,
  Layers,
  ChevronRight
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { formatTaskDate } from '../lib/dateUtils'

const GOAL_FILTERS = ['All', 'Active', 'Completed']

export default function Goals() {
  const {
    goals,
    tasks,
    openCreateGoal,
    openEditGoal,
    deleteGoal,
    updateGoal,
    openEditTask
  } = useApp()

  const [activeFilter, setActiveFilter] = useState('Active')
  const [goalToDelete, setGoalToDelete] = useState(null)
  const [quickProgressGoal, setQuickProgressGoal] = useState(null)
  const [quickProgressValue, setQuickProgressValue] = useState('')

  const filteredGoals = goals.filter(g => {
    if (activeFilter === 'Active') return !g.completed
    if (activeFilter === 'Completed') return g.completed
    return true
  })

  const handleUpdateProgressSubmit = (e) => {
    e.preventDefault()
    if (!quickProgressGoal) return
    const val = parseFloat(quickProgressValue)
    if (!isNaN(val)) {
      updateGoal(quickProgressGoal.id, { currentValue: val })
    }
    setQuickProgressGoal(null)
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-foreground tracking-tight">
            Goals & Milestones
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Turn long-term aspirations into measurable, tracked targets.
          </p>
        </div>

        <button
          onClick={() => openCreateGoal()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium bg-primary text-primary-foreground hover:bg-primary-hover shadow-subtle transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Goal</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {GOAL_FILTERS.map(filter => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeFilter === filter
                ? 'bg-primary-soft text-primary font-semibold'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            {filter} Goals ({goals.filter(g => filter === 'All' ? true : filter === 'Active' ? !g.completed : g.completed).length})
          </button>
        ))}
      </div>

      {/* Goals List */}
      {filteredGoals.length === 0 ? (
        <div className="clean-card p-12 text-center">
          <Target className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-foreground">No goals found</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            {goals.length === 0
              ? 'You have not set any goals yet. Define clear milestones to guide your daily tasks.'
              : 'No goals match the selected filter.'}
          </p>
          <button
            onClick={() => openCreateGoal()}
            className="mt-4 px-4 py-2 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary-hover rounded-xl inline-flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create First Goal</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredGoals.map(goal => {
            const percent = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100))
            const linkedTasks = tasks.filter(t => t.goalId === goal.id)
            const completedLinked = linkedTasks.filter(t => t.completed).length

            return (
              <div
                key={goal.id}
                className={`clean-card p-5 flex flex-col justify-between space-y-4 transition-all group ${
                  goal.completed ? 'bg-muted/15 border-border opacity-80' : ''
                }`}
              >
                <div>
                  {/* Top Category Badge & Actions */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-primary-soft text-primary">
                      {goal.category}
                    </span>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEditGoal(goal)}
                        className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
                        title="Edit goal"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setGoalToDelete(goal)}
                        className="p-1 rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                        title="Delete goal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div className="mt-3">
                    <h3
                      onClick={() => openEditGoal(goal)}
                      className={`text-sm font-semibold cursor-pointer hover:text-primary transition-colors ${
                        goal.completed ? 'line-through text-muted-foreground' : 'text-foreground'
                      }`}
                    >
                      {goal.title}
                    </h3>
                    {goal.description && (
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">
                        {goal.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Progress Bar & Numerical Target */}
                <div className="space-y-2 pt-2 border-t border-border/60">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Progress</span>
                    <button
                      onClick={() => {
                        setQuickProgressGoal(goal)
                        setQuickProgressValue(String(goal.currentValue))
                      }}
                      className="font-medium text-foreground hover:text-primary underline flex items-center gap-1"
                      title="Click to update current progress number"
                    >
                      <span>
                        {goal.currentValue} / {goal.targetValue} {goal.unit}
                      </span>
                      <span className="text-muted-foreground text-[11px]">({percent}%)</span>
                    </button>
                  </div>

                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        percent >= 100 ? 'bg-emerald-500' : 'bg-primary'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  {/* Target Date and Linked Tasks */}
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-muted-foreground" />
                      Target: {formatTaskDate(goal.targetDate)}
                    </span>

                    <span className="flex items-center gap-1">
                      <Layers className="w-3 h-3" />
                      {completedLinked}/{linkedTasks.length} linked tasks
                    </span>
                  </div>

                  {/* Linked Tasks preview */}
                  {linkedTasks.length > 0 && (
                    <div className="pt-2 border-t border-border/40 space-y-1">
                      <p className="text-[10px] uppercase font-semibold text-muted-foreground">
                        Connected Tasks:
                      </p>
                      <div className="space-y-1">
                        {linkedTasks.slice(0, 2).map(t => (
                          <div
                            key={t.id}
                            onClick={() => openEditTask(t)}
                            className="text-[11px] cursor-pointer hover:text-primary truncate flex items-center gap-1.5 text-foreground/80"
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${t.completed ? 'bg-emerald-500' : 'bg-muted-foreground'}`} />
                            <span className={t.completed ? 'line-through opacity-70' : ''}>{t.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Quick Progress Modal */}
      {quickProgressGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-card w-full max-w-sm rounded-2xl border border-border shadow-elevated p-5 space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Update Goal Progress</h3>
            <p className="text-xs text-muted-foreground">
              Enter current value for "{quickProgressGoal.title}" ({quickProgressGoal.unit}):
            </p>
            <form onSubmit={handleUpdateProgressSubmit} className="space-y-3">
              <input
                type="number"
                step="any"
                min="0"
                value={quickProgressValue}
                onChange={(e) => setQuickProgressValue(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                autoFocus
              />
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setQuickProgressGoal(null)}
                  className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary-hover rounded-lg shadow-subtle"
                >
                  Save Progress
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {goalToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-card w-full max-w-sm rounded-2xl border border-border shadow-elevated p-5 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Confirm Goal Deletion</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to delete "{goalToDelete.title}"? Connected tasks will remain in your tasks list but become unlinked.
            </p>
            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => setGoalToDelete(null)}
                className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteGoal(goalToDelete.id)
                  setGoalToDelete(null)
                }}
                className="px-3.5 py-1.5 text-xs font-medium bg-red-600 text-white hover:bg-red-700 rounded-lg shadow-subtle"
              >
                Delete Goal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
