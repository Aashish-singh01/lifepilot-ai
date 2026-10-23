import React, { createContext, useContext, useState, useEffect } from 'react'
import {
  loadStoredTasks,
  saveStoredTasks,
  loadStoredGoals,
  saveStoredGoals,
  loadStoredFocusSessions,
  saveStoredFocusSessions,
  loadStoredSettings,
  saveStoredSettings,
  loadStoredNotifications,
  saveStoredNotifications,
  generateId,
  resetToSampleWorkspace,
  clearAllApplicationData,
  exportAllDataAsJson,
  importAllDataFromJson,
} from '../lib/storage'
import { playCheckSound, playChime } from '../lib/sound'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [tasks, setTasks] = useState(() => loadStoredTasks())
  const [goals, setGoals] = useState(() => loadStoredGoals())
  const [focusSessions, setFocusSessions] = useState(() => loadStoredFocusSessions())
  const [settings, setSettings] = useState(() => loadStoredSettings())
  const [notifications, setNotifications] = useState(() => loadStoredNotifications())

  // Modal dialog states
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState(null)
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  // Apply theme to document
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [settings.theme])

  // Sync state changes to localStorage
  useEffect(() => {
    saveStoredTasks(tasks)
  }, [tasks])

  useEffect(() => {
    saveStoredGoals(goals)
  }, [goals])

  useEffect(() => {
    saveStoredFocusSessions(focusSessions)
  }, [focusSessions])

  useEffect(() => {
    saveStoredSettings(settings)
  }, [settings])

  useEffect(() => {
    saveStoredNotifications(notifications)
  }, [notifications])

  // Global keyboard shortcuts (Ctrl+K or Cmd+K for search, N for new task)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsSearchOpen(prev => !prev)
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false)
        setIsTaskModalOpen(false)
        setIsGoalModalOpen(false)
        setIsPlanModalOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // --- Task Operations ---
  const addTask = (taskInput) => {
    const newTask = {
      id: generateId('task'),
      title: taskInput.title.trim(),
      description: taskInput.description?.trim() || '',
      priority: taskInput.priority || 'Medium',
      category: taskInput.category || 'General',
      dueDate: taskInput.dueDate || '',
      scheduledTime: taskInput.scheduledTime || '',
      estimatedMinutes: parseInt(taskInput.estimatedMinutes, 10) || 30,
      completed: false,
      completedAt: null,
      tags: Array.isArray(taskInput.tags) ? taskInput.tags : [],
      goalId: taskInput.goalId || null,
      createdAt: new Date().toISOString(),
    }

    setTasks(prev => [newTask, ...prev])
    toast.success('Task created successfully')
    return newTask
  }

  const updateTask = (taskId, updates) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        return { ...task, ...updates, updatedAt: new Date().toISOString() }
      }
      return task
    }))
    toast.success('Task updated')
  }

  const deleteTask = (taskId) => {
    setTasks(prev => prev.filter(t => t.id !== taskId))
    toast.info('Task deleted')
  }

  const toggleTaskComplete = (taskId) => {
    let nowCompleted = false
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        nowCompleted = !task.completed
        return {
          ...task,
          completed: nowCompleted,
          completedAt: nowCompleted ? new Date().toISOString() : null,
        }
      }
      return task
    }))

    if (nowCompleted) {
      playCheckSound(settings.soundEnabled)
      try {
        confetti({
          particleCount: 30,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#245C45', '#348464', '#EBF3EE', '#D97706'],
        })
      } catch {}
      toast.success('Task marked complete!')
    }
  }

  // --- Goal Operations ---
  const addGoal = (goalInput) => {
    const newGoal = {
      id: generateId('goal'),
      title: goalInput.title.trim(),
      description: goalInput.description?.trim() || '',
      category: goalInput.category || 'Personal',
      targetValue: parseFloat(goalInput.targetValue) || 10,
      currentValue: parseFloat(goalInput.currentValue) || 0,
      unit: goalInput.unit || 'units',
      targetDate: goalInput.targetDate || '',
      completed: false,
      createdAt: new Date().toISOString(),
    }
    setGoals(prev => [newGoal, ...prev])
    toast.success('Goal created')
    return newGoal
  }

  const updateGoal = (goalId, updates) => {
    setGoals(prev => prev.map(g => {
      if (g.id === goalId) {
        const updated = { ...g, ...updates }
        if (updated.currentValue >= updated.targetValue && !g.completed) {
          updated.completed = true
          confetti({ particleCount: 50, spread: 80 })
          playChime(settings.soundEnabled)
          toast.success(`Goal achieved: ${updated.title}!`)
        }
        return updated
      }
      return g
    }))
    toast.success('Goal updated')
  }

  const deleteGoal = (goalId) => {
    setGoals(prev => prev.filter(g => g.id !== goalId))
    // Also unlink from tasks
    setTasks(prev => prev.map(t => t.goalId === goalId ? { ...t, goalId: null } : t))
    toast.info('Goal deleted')
  }

  // --- Focus Session Operations ---
  const addFocusSession = (sessionData) => {
    const newSession = {
      id: generateId('focus'),
      taskId: sessionData.taskId || null,
      taskTitle: sessionData.taskTitle || 'Focus Session',
      durationMinutes: sessionData.durationMinutes || settings.pomodoroDuration || 25,
      completedAt: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0],
      type: sessionData.type || 'focus',
    }

    setFocusSessions(prev => [newSession, ...prev])
    playChime(settings.soundEnabled)
    try {
      confetti({ particleCount: 25, spread: 50, origin: { y: 0.7 } })
    } catch {}
    toast.success(`Completed ${newSession.durationMinutes}-minute focus session!`)

    // Add local notification
    const newNotif = {
      id: generateId('notif'),
      title: 'Focus session completed',
      message: `Great focus on "${newSession.taskTitle}"! Take a well-deserved break.`,
      date: new Date().toISOString(),
      read: false,
      type: 'focus'
    }
    setNotifications(prev => [newNotif, ...prev])
  }

  // --- Planner Schedule Application ---
  const applySmartPlan = (plannedItems) => {
    if (!plannedItems || plannedItems.length === 0) return

    setTasks(prev => prev.map(task => {
      const match = plannedItems.find(p => p.task.id === task.id)
      if (match) {
        return {
          ...task,
          scheduledTime: match.startTime,
          dueDate: task.dueDate || new Date().toISOString().split('T')[0]
        }
      }
      return task
    }))

    toast.success(`Applied ${plannedItems.length} optimized task schedule slots to today!`)
    setIsPlanModalOpen(false)
  }

  // --- Settings & Data Reset ---
  const updateSettings = (newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }))
    toast.success('Settings saved')
  }

  const resetToSampleData = () => {
    const sample = resetToSampleWorkspace()
    setTasks(sample.tasks)
    setGoals(sample.goals)
    setFocusSessions(sample.focusSessions)
    setSettings(sample.settings)
    setNotifications(sample.notifications)
    toast.success('Workspace reset to sample data')
  }

  const clearAllData = () => {
    clearAllApplicationData()
    setTasks([])
    setGoals([])
    setFocusSessions([])
    setNotifications([])
    toast.info('Workspace cleared')
  }

  const handleImportJson = (jsonString) => {
    const result = importAllDataFromJson(jsonString)
    if (result.success) {
      setTasks(loadStoredTasks())
      setGoals(loadStoredGoals())
      setFocusSessions(loadStoredFocusSessions())
      setSettings(loadStoredSettings())
      toast.success(`Successfully imported ${result.summary.tasksCount} tasks & ${result.summary.goalsCount} goals`)
      return true
    } else {
      toast.error(`Import failed: ${result.error}`)
      return false
    }
  }

  const openCreateTask = (initialData = null) => {
    setEditingTask(initialData)
    setIsTaskModalOpen(true)
  }

  const openEditTask = (task) => {
    setEditingTask(task)
    setIsTaskModalOpen(true)
  }

  const openCreateGoal = (initialData = null) => {
    setEditingGoal(initialData)
    setIsGoalModalOpen(true)
  }

  const openEditGoal = (goal) => {
    setEditingGoal(goal)
    setIsGoalModalOpen(true)
  }

  const markNotificationAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const clearAllNotifications = () => {
    setNotifications([])
    toast.info('Notifications cleared')
  }

  return (
    <AppContext.Provider
      value={{
        tasks,
        goals,
        focusSessions,
        settings,
        notifications,
        // Modal states
        isTaskModalOpen,
        setIsTaskModalOpen,
        editingTask,
        openCreateTask,
        openEditTask,
        isGoalModalOpen,
        setIsGoalModalOpen,
        editingGoal,
        openCreateGoal,
        openEditGoal,
        isPlanModalOpen,
        setIsPlanModalOpen,
        isSearchOpen,
        setIsSearchOpen,
        // Actions
        addTask,
        updateTask,
        deleteTask,
        toggleTaskComplete,
        addGoal,
        updateGoal,
        deleteGoal,
        addFocusSession,
        applySmartPlan,
        updateSettings,
        resetToSampleData,
        clearAllData,
        handleImportJson,
        exportData: exportAllDataAsJson,
        markNotificationAsRead,
        clearAllNotifications,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
