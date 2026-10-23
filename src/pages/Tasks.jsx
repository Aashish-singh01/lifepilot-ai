import React, { useState, useMemo } from 'react'
import {
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Calendar,
  Tag,
  Trash2,
  Edit2,
  LayoutList,
  LayoutGrid,
  ChevronDown,
  AlertCircle,
  Flag,
  Folder
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { formatTaskDate, isTaskOverdue } from '../lib/dateUtils'

const CATEGORIES = ['All', 'Study', 'Work', 'Health', 'Personal', 'Finance', 'General']
const PRIORITIES = ['All', 'High', 'Medium', 'Low']
const STATUSES = ['All', 'Active', 'Completed']

export default function Tasks() {
  const {
    tasks,
    openCreateTask,
    openEditTask,
    toggleTaskComplete,
    deleteTask,
    goals
  } = useApp()

  const [search, setSearch] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [selectedPriority, setSelectedPriority] = useState('All')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [sortBy, setSortBy] = useState('dueDate') // 'dueDate' | 'priority' | 'createdAt'
  const [viewMode, setViewMode] = useState('list') // 'list' | 'grid'
  const [taskToDelete, setTaskToDelete] = useState(null)

  // Filtered & Sorted Tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Search
      if (search) {
        const q = search.toLowerCase()
        const matchesTitle = task.title.toLowerCase().includes(q)
        const matchesDesc = task.description && task.description.toLowerCase().includes(q)
        const matchesTag = task.tags && task.tags.some(t => t.toLowerCase().includes(q))
        if (!matchesTitle && !matchesDesc && !matchesTag) return false
      }

      // Status
      if (selectedStatus === 'Active' && task.completed) return false
      if (selectedStatus === 'Completed' && !task.completed) return false

      // Priority
      if (selectedPriority !== 'All' && task.priority !== selectedPriority) return false

      // Category
      if (selectedCategory !== 'All' && task.category !== selectedCategory) return false

      return true
    }).sort((a, b) => {
      if (sortBy === 'dueDate') {
        if (!a.dueDate) return 1
        if (!b.dueDate) return -1
        return a.dueDate.localeCompare(b.dueDate)
      }
      if (sortBy === 'priority') {
        const weights = { High: 3, Medium: 2, Low: 1 }
        return (weights[b.priority] || 0) - (weights[a.priority] || 0)
      }
      if (sortBy === 'createdAt') {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      }
      return 0
    })
  }, [tasks, search, selectedStatus, selectedPriority, selectedCategory, sortBy])

  const confirmDelete = () => {
    if (taskToDelete) {
      deleteTask(taskToDelete.id)
      setTaskToDelete(null)
    }
  }

  const getGoalTitle = (goalId) => {
    if (!goalId) return null
    const g = goals.find(goal => goal.id === goalId)
    return g ? g.title : null
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header & Main Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-foreground tracking-tight">
            My Tasks
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage your schedule, deadlines, and priorities with complete clarity.
          </p>
        </div>

        <button
          onClick={() => openCreateTask()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium bg-primary text-primary-foreground hover:bg-primary-hover shadow-subtle transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Task</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="clean-card p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter tasks by name, description, or #tag..."
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* View Mode Toggle & Sort */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center bg-muted/70 p-0.5 rounded-lg border border-border">
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md text-xs transition-colors ${viewMode === 'list' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'}`}
                title="List view"
              >
                <LayoutList className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md text-xs transition-colors ${viewMode === 'grid' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'}`}
                title="Grid view"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="dueDate">Sort: Due Date</option>
              <option value="priority">Sort: Priority</option>
              <option value="createdAt">Sort: Created Date</option>
            </select>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/60 text-xs">
          <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filters:
          </span>

          {/* Status Pills */}
          <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-lg">
            {STATUSES.map(st => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  selectedStatus === st
                    ? 'bg-primary-soft text-primary font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Priority Select */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-2 py-1 text-xs bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {PRIORITIES.map(p => (
              <option key={p} value={p}>{p === 'All' ? 'All Priorities' : `${p} Priority`}</option>
            ))}
          </select>

          {/* Category Select */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2 py-1 text-xs bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>
            ))}
          </select>

          {(search || selectedStatus !== 'All' || selectedPriority !== 'All' || selectedCategory !== 'All') && (
            <button
              onClick={() => {
                setSearch('')
                setSelectedStatus('All')
                setSelectedPriority('All')
                setSelectedCategory('All')
              }}
              className="text-[11px] text-muted-foreground hover:text-primary underline ml-auto"
            >
              Reset filters
            </button>
          )}
        </div>
      </div>

      {/* Task Content: List or Grid */}
      {filteredTasks.length === 0 ? (
        <div className="clean-card p-12 text-center">
          <CheckCircle2 className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-foreground">No tasks found</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            {tasks.length === 0
              ? 'Your workspace is empty. Create your first task to begin organizing your day.'
              : 'Try relaxing your filter criteria or search query to view tasks.'}
          </p>
          <button
            onClick={() => openCreateTask()}
            className="mt-4 px-4 py-2 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary-hover rounded-xl inline-flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Task</span>
          </button>
        </div>
      ) : viewMode === 'list' ? (
        <div className="clean-card divide-y divide-border overflow-hidden">
          {filteredTasks.map(task => {
            const overdue = isTaskOverdue(task.dueDate, task.completed)
            const linkedGoal = getGoalTitle(task.goalId)

            return (
              <div
                key={task.id}
                className={`p-4 transition-colors flex items-start justify-between gap-4 group hover:bg-muted/30 ${
                  task.completed ? 'bg-muted/10 opacity-70' : ''
                }`}
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  {/* Checkbox button */}
                  <button
                    onClick={() => toggleTaskComplete(task.id)}
                    className={`w-5 h-5 mt-0.5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                      task.completed
                        ? 'bg-primary border-primary text-primary-foreground'
                        : 'border-muted-foreground/40 hover:border-primary'
                    }`}
                    title={task.completed ? 'Mark incomplete' : 'Mark complete'}
                  >
                    {task.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        onClick={() => openEditTask(task)}
                        className={`text-sm font-medium cursor-pointer hover:text-primary transition-colors ${
                          task.completed ? 'line-through text-muted-foreground' : 'text-foreground'
                        }`}
                      >
                        {task.title}
                      </span>

                      {/* Priority Badge */}
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                        task.priority === 'High'
                          ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                          : task.priority === 'Medium'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {task.priority}
                      </span>

                      {/* Category Badge */}
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-muted text-muted-foreground">
                        {task.category}
                      </span>

                      {overdue && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-500/10 text-red-600 dark:text-red-400 font-semibold flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> Overdue
                        </span>
                      )}
                    </div>

                    {task.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1 leading-relaxed">
                        {task.description}
                      </p>
                    )}

                    {/* Metadata line: due date, duration, scheduled time, tags */}
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-2 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatTaskDate(task.dueDate)}
                      </span>

                      {task.scheduledTime && (
                        <span className="flex items-center gap-1 text-primary font-mono font-medium">
                          <Clock className="w-3 h-3" />
                          {task.scheduledTime}
                        </span>
                      )}

                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {task.estimatedMinutes}m
                      </span>

                      {linkedGoal && (
                        <span className="text-primary font-medium truncate max-w-[150px]">
                          🎯 {linkedGoal}
                        </span>
                      )}

                      {task.tags && task.tags.map(tag => (
                        <span key={tag} className="text-muted-foreground/80">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions (Edit / Delete) */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEditTask(task)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                    title="Edit task"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setTaskToDelete(task)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                    title="Delete task"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map(task => {
            const overdue = isTaskOverdue(task.dueDate, task.completed)
            const linkedGoal = getGoalTitle(task.goalId)

            return (
              <div
                key={task.id}
                className={`clean-card p-4 flex flex-col justify-between transition-all group ${
                  task.completed ? 'bg-muted/15 opacity-75' : ''
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                      task.priority === 'High'
                        ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                        : task.priority === 'Medium'
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {task.priority}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditTask(task)}
                        className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setTaskToDelete(task)}
                        className="p-1 rounded text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <button
                      onClick={() => toggleTaskComplete(task.id)}
                      className={`w-4 h-4 mt-0.5 rounded border shrink-0 flex items-center justify-center ${
                        task.completed
                          ? 'bg-primary border-primary text-primary-foreground'
                          : 'border-muted-foreground/40 hover:border-primary'
                      }`}
                    >
                      {task.completed && <CheckCircle2 className="w-3 h-3" />}
                    </button>
                    <h3
                      onClick={() => openEditTask(task)}
                      className={`text-xs font-semibold cursor-pointer hover:text-primary leading-snug ${
                        task.completed ? 'line-through text-muted-foreground' : 'text-foreground'
                      }`}
                    >
                      {task.title}
                    </h3>
                  </div>

                  {task.description && (
                    <p className="text-[11px] text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                      {task.description}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-border mt-3 space-y-1.5 text-[11px] text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatTaskDate(task.dueDate)}
                    </span>
                    <span>{task.estimatedMinutes}m</span>
                  </div>
                  {linkedGoal && (
                    <div className="text-primary truncate font-medium">🎯 {linkedGoal}</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {taskToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-card w-full max-w-sm rounded-2xl border border-border shadow-elevated p-5 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Confirm Task Deletion</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to permanently delete "{taskToDelete.title}"? This action cannot be undone.
            </p>
            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => setTaskToDelete(null)}
                className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-3.5 py-1.5 text-xs font-medium bg-red-600 text-white hover:bg-red-700 rounded-lg shadow-subtle"
              >
                Delete Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
