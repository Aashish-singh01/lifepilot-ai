import React, { useState, useEffect } from 'react'
import { X, Target, Calendar, Folder, Hash } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { addDays, format } from 'date-fns'

const GOAL_CATEGORIES = ['Study', 'Work', 'Health', 'Personal', 'Finance']

export default function GoalModal() {
  const {
    isGoalModalOpen,
    setIsGoalModalOpen,
    editingGoal,
    addGoal,
    updateGoal
  } = useApp()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('Study')
  const [targetValue, setTargetValue] = useState(10)
  const [currentValue, setCurrentValue] = useState(0)
  const [unit, setUnit] = useState('units')
  const [targetDate, setTargetDate] = useState('')
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (editingGoal) {
      setTitle(editingGoal.title || '')
      setDescription(editingGoal.description || '')
      setCategory(editingGoal.category || 'Study')
      setTargetValue(editingGoal.targetValue || 10)
      setCurrentValue(editingGoal.currentValue || 0)
      setUnit(editingGoal.unit || 'units')
      setTargetDate(editingGoal.targetDate || '')
    } else {
      setTitle('')
      setDescription('')
      setCategory('Study')
      setTargetValue(10)
      setCurrentValue(0)
      setUnit('milestones')
      setTargetDate(format(addDays(new Date(), 30), 'yyyy-MM-dd'))
    }
    setErrors({})
  }, [editingGoal, isGoalModalOpen])

  if (!isGoalModalOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    const newErrors = {}
    if (!title.trim()) newErrors.title = 'Goal title is required'
    if (!targetValue || Number(targetValue) <= 0) newErrors.targetValue = 'Target must be greater than 0'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const goalData = {
      title,
      description,
      category,
      targetValue: Number(targetValue),
      currentValue: Number(currentValue) || 0,
      unit,
      targetDate,
    }

    if (editingGoal && editingGoal.id) {
      updateGoal(editingGoal.id, goalData)
    } else {
      addGoal(goalData)
    }

    setIsGoalModalOpen(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-card w-full max-w-lg rounded-2xl border border-border shadow-elevated overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 px-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            <h2 className="text-base font-semibold text-foreground">
              {editingGoal ? 'Edit Goal' : 'New Measurable Goal'}
            </h2>
          </div>
          <button
            onClick={() => setIsGoalModalOpen(false)}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Goal Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Master Machine Learning, Complete 16 Workouts"
              className={`w-full px-3 py-2 text-sm bg-background border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary ${
                errors.title ? 'border-red-500' : 'border-border'
              }`}
              autoFocus
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Why this goal matters (Description)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Context, motivation, or key success criteria..."
              className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <Folder className="w-3.5 h-3.5 text-primary" />
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {GOAL_CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                Target Date
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-primary" />
                Target Value
              </label>
              <input
                type="number"
                min="1"
                step="any"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Current Progress
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Unit
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="e.g. chapters, hrs"
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsGoalModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary-hover rounded-lg shadow-subtle transition-colors"
            >
              {editingGoal ? 'Save Goal' : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
