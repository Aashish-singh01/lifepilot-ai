import React, { useState, useEffect } from 'react'
import { X, Calendar, Clock, Tag, Flag, Folder, Target } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { getTodayISO } from '../../lib/dateUtils'

const CATEGORIES = ['Study', 'Work', 'Health', 'Personal', 'Finance', 'General']
const PRIORITIES = ['Low', 'Medium', 'High']

export default function TaskModal() {
  const {
    isTaskModalOpen,
    setIsTaskModalOpen,
    editingTask,
    addTask,
    updateTask,
    goals
  } = useApp()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('Medium')
  const [category, setCategory] = useState('Study')
  const [dueDate, setDueDate] = useState('')
  const [scheduledTime, setScheduledTime] = useState('')
  const [estimatedMinutes, setEstimatedMinutes] = useState(30)
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState([])
  const [goalId, setGoalId] = useState('')
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title || '')
      setDescription(editingTask.description || '')
      setPriority(editingTask.priority || 'Medium')
      setCategory(editingTask.category || 'Study')
      setDueDate(editingTask.dueDate || '')
      setScheduledTime(editingTask.scheduledTime || '')
      setEstimatedMinutes(editingTask.estimatedMinutes || 30)
      setTags(editingTask.tags || [])
      setGoalId(editingTask.goalId || '')
    } else {
      // Default new task
      setTitle('')
      setDescription('')
      setPriority('Medium')
      setCategory('Study')
      setDueDate(getTodayISO())
      setScheduledTime('')
      setEstimatedMinutes(30)
      setTags([])
      setGoalId('')
    }
    setErrors({})
    setTagInput('')
  }, [editingTask, isTaskModalOpen])

  if (!isTaskModalOpen) return null

  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const clean = tagInput.trim().replace(/^#/, '')
      if (clean && !tags.includes(clean)) {
        setTags([...tags, clean])
        setTagInput('')
      }
    }
  }

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(t => t !== tagToRemove))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const newErrors = {}
    if (!title.trim()) {
      newErrors.title = 'Task title is required'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const taskData = {
      title,
      description,
      priority,
      category,
      dueDate,
      scheduledTime,
      estimatedMinutes: Number(estimatedMinutes) || 30,
      tags,
      goalId: goalId || null,
    }

    if (editingTask && editingTask.id) {
      updateTask(editingTask.id, taskData)
    } else {
      addTask(taskData)
    }

    setIsTaskModalOpen(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-card w-full max-w-lg rounded-2xl border border-border shadow-elevated overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 px-6 border-b border-border flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">
            {editingTask ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button
            onClick={() => setIsTaskModalOpen(false)}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Task Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                if (errors.title) setErrors({})
              }}
              placeholder="e.g., Review CS Midterm Notes, Write lab report"
              className={`w-full px-3 py-2 text-sm bg-background border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary ${
                errors.title ? 'border-red-500 ring-1 ring-red-500' : 'border-border'
              }`}
              autoFocus
            />
            {errors.title && (
              <p className="text-red-500 text-xs mt-1">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Description / Notes
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add key context, links, or checklist items..."
              className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
          </div>

          {/* Priority & Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <Flag className="w-3.5 h-3.5 text-primary" />
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {PRIORITIES.map(p => (
                  <option key={p} value={p}>{p} Priority</option>
                ))}
              </select>
            </div>

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
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Due Date & Scheduled Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-primary" />
                Scheduled Time (Optional)
              </label>
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Estimated Duration & Linked Goal */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-primary" />
                Est. Duration (minutes)
              </label>
              <input
                type="number"
                min="5"
                max="360"
                step="5"
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-primary" />
                Link to Goal
              </label>
              <select
                value={goalId}
                onChange={(e) => setGoalId(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">No goal linked</option>
                {goals.map(g => (
                  <option key={g.id} value={g.id}>{g.title}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-primary" />
              Tags
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-muted text-foreground rounded-md border border-border"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-muted-foreground hover:text-red-500"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="Type a tag and press Enter..."
              className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsTaskModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary-hover rounded-lg shadow-subtle transition-colors"
            >
              {editingTask ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
