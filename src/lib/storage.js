import { format, subDays, addDays } from 'date-fns'

const STORAGE_KEYS = {
  TASKS: 'lifepilot_tasks_v1',
  GOALS: 'lifepilot_goals_v1',
  FOCUS_SESSIONS: 'lifepilot_focus_sessions_v1',
  SETTINGS: 'lifepilot_settings_v1',
  INITIALIZED: 'lifepilot_initialized_v1',
  NOTIFICATIONS: 'lifepilot_notifications_v1'
}

export const DEFAULT_SETTINGS = {
  name: 'Alex Chen',
  role: 'Student & Builder',
  workingHoursStart: '09:00',
  workingHoursEnd: '18:00',
  dailyTaskTarget: 5,
  theme: 'light',
  pomodoroDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  soundEnabled: true,
}

export function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
}

export function safeJsonParse(jsonString, fallback) {
  if (!jsonString) return fallback
  try {
    return JSON.parse(jsonString)
  } catch (err) {
    console.error('Failed to parse localStorage item:', err)
    return fallback
  }
}

export function getSampleData() {
  const today = format(new Date(), 'yyyy-MM-dd')
  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd')
  const twoDaysAgo = format(subDays(new Date(), 2), 'yyyy-MM-dd')
  const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd')
  const threeDaysAhead = format(addDays(new Date(), 3), 'yyyy-MM-dd')

  const tasks = [
    {
      id: 'task_sample_1',
      title: 'Review Machine Learning lecture notes & flashcards',
      description: 'Cover gradient descent, backprop math, and loss functions for Friday quiz.',
      priority: 'High',
      category: 'Study',
      dueDate: today,
      scheduledTime: '09:30',
      estimatedMinutes: 45,
      completed: true,
      completedAt: `${today}T10:15:00.000Z`,
      tags: ['Academics', 'ML', 'Exam'],
      goalId: 'goal_sample_1',
      createdAt: `${yesterday}T08:00:00.000Z`,
    },
    {
      id: 'task_sample_2',
      title: 'Draft architecture & pitch for hackathon project',
      description: 'Detail system components, offline planning engine, and UI workflow.',
      priority: 'High',
      category: 'Work',
      dueDate: today,
      scheduledTime: '11:00',
      estimatedMinutes: 60,
      completed: false,
      completedAt: null,
      tags: ['Hackathon', 'SaaS', 'Design'],
      goalId: 'goal_sample_3',
      createdAt: `${yesterday}T14:30:00.000Z`,
    },
    {
      id: 'task_sample_3',
      title: 'Submit weekly research lab progress report',
      description: 'Send brief markdown summary of benchmark runs to supervisor.',
      priority: 'Medium',
      category: 'Study',
      dueDate: tomorrow,
      scheduledTime: '14:00',
      estimatedMinutes: 30,
      completed: false,
      completedAt: null,
      tags: ['Research', 'Lab'],
      goalId: 'goal_sample_1',
      createdAt: `${twoDaysAgo}T09:00:00.000Z`,
    },
    {
      id: 'task_sample_4',
      title: '5km outdoor recovery run in the park',
      description: 'Keep zone 2 heart rate for 30 minutes, stretch thoroughly afterwards.',
      priority: 'Medium',
      category: 'Health',
      dueDate: today,
      scheduledTime: '17:30',
      estimatedMinutes: 35,
      completed: false,
      completedAt: null,
      tags: ['Fitness', 'Cardio'],
      goalId: 'goal_sample_2',
      createdAt: `${today}T07:15:00.000Z`,
    },
    {
      id: 'task_sample_5',
      title: 'Audit monthly personal budget & subscriptions',
      description: 'Review bank statement, cancel unused SaaS free trials, rebalance savings.',
      priority: 'Low',
      category: 'Finance',
      dueDate: threeDaysAhead,
      scheduledTime: '',
      estimatedMinutes: 25,
      completed: false,
      completedAt: null,
      tags: ['Finances', 'Personal'],
      goalId: null,
      createdAt: `${twoDaysAgo}T16:00:00.000Z`,
    },
    {
      id: 'task_sample_6',
      title: 'Read chapter 4 of Deep Work (Cal Newport)',
      description: 'Take notes on the 4 deep work scheduling philosophies and rhythmic planning.',
      priority: 'Low',
      category: 'Personal',
      dueDate: today,
      scheduledTime: '08:30',
      estimatedMinutes: 30,
      completed: true,
      completedAt: `${today}T09:00:00.000Z`,
      tags: ['Reading', 'Habits'],
      goalId: 'goal_sample_4',
      createdAt: `${yesterday}T20:00:00.000Z`,
    },
    {
      id: 'task_sample_7',
      title: 'Prepare discussion points for office hours',
      description: 'Clarify questions on assignment 2 problem 4 edge cases.',
      priority: 'High',
      category: 'Study',
      dueDate: yesterday,
      scheduledTime: '',
      estimatedMinutes: 20,
      completed: false,
      completedAt: null,
      tags: ['Study', 'Overdue'],
      goalId: 'goal_sample_1',
      createdAt: `${twoDaysAgo}T11:00:00.000Z`,
    }
  ]

  const goals = [
    {
      id: 'goal_sample_1',
      title: 'Complete Machine Learning Core Modules',
      description: 'Master foundational concepts, complete all 10 problem sets with 90%+ scores.',
      category: 'Study',
      targetValue: 10,
      currentValue: 7,
      unit: 'modules',
      targetDate: format(addDays(new Date(), 21), 'yyyy-MM-dd'),
      completed: false,
      createdAt: `${subDays(new Date(), 20).toISOString()}`,
    },
    {
      id: 'goal_sample_2',
      title: 'Build Consistent 4x Weekly Cardio Habit',
      description: 'Maintain regular running and aerobic exercise schedule to reduce stress.',
      category: 'Health',
      targetValue: 16,
      currentValue: 11,
      unit: 'sessions',
      targetDate: format(addDays(new Date(), 10), 'yyyy-MM-dd'),
      completed: false,
      createdAt: `${subDays(new Date(), 18).toISOString()}`,
    },
    {
      id: 'goal_sample_3',
      title: 'Ship LifePilot AI Hackathon Submission',
      description: 'Deliver polished, reliable productivity platform with offline planning engine.',
      category: 'Work',
      targetValue: 5,
      currentValue: 4,
      unit: 'milestones',
      targetDate: format(addDays(new Date(), 4), 'yyyy-MM-dd'),
      completed: false,
      createdAt: `${subDays(new Date(), 7).toISOString()}`,
    },
    {
      id: 'goal_sample_4',
      title: 'Read 12 Non-Fiction Books This Year',
      description: 'Read 30 minutes every morning to expand mental models and focus stamina.',
      category: 'Personal',
      targetValue: 12,
      currentValue: 8,
      unit: 'books',
      targetDate: `${new Date().getFullYear()}-12-31`,
      completed: false,
      createdAt: `${new Date().getFullYear()}-01-01T00:00:00.000Z`,
    }
  ]

  const focusSessions = [
    {
      id: 'session_1',
      taskId: 'task_sample_1',
      taskTitle: 'Review Machine Learning lecture notes & flashcards',
      durationMinutes: 25,
      completedAt: `${today}T09:55:00.000Z`,
      date: today,
      type: 'focus'
    },
    {
      id: 'session_2',
      taskId: 'task_sample_6',
      taskTitle: 'Read chapter 4 of Deep Work (Cal Newport)',
      durationMinutes: 25,
      completedAt: `${today}T08:55:00.000Z`,
      date: today,
      type: 'focus'
    },
    {
      id: 'session_3',
      taskId: 'task_sample_2',
      taskTitle: 'Draft architecture & pitch for hackathon project',
      durationMinutes: 25,
      completedAt: `${yesterday}T15:25:00.000Z`,
      date: yesterday,
      type: 'focus'
    },
    {
      id: 'session_4',
      taskId: null,
      taskTitle: 'Deep Study Block',
      durationMinutes: 25,
      completedAt: `${yesterday}T16:00:00.000Z`,
      date: yesterday,
      type: 'focus'
    },
    {
      id: 'session_5',
      taskId: null,
      taskTitle: 'Problem Set Review',
      durationMinutes: 25,
      completedAt: `${twoDaysAgo}T14:30:00.000Z`,
      date: twoDaysAgo,
      type: 'focus'
    }
  ]

  const notifications = [
    {
      id: 'notif_1',
      title: 'Welcome to LifePilot AI',
      message: 'Your personal daily planning workspace is ready. Click "Plan My Day" to get started.',
      date: new Date().toISOString(),
      read: false,
      type: 'welcome'
    },
    {
      id: 'notif_2',
      title: 'Overdue Task Alert',
      message: 'You have 1 high-priority task from yesterday: "Prepare discussion points for office hours".',
      date: new Date().toISOString(),
      read: false,
      type: 'warning'
    }
  ]

  return { tasks, goals, focusSessions, settings: DEFAULT_SETTINGS, notifications }
}

export function initializeStorageIfNeeded() {
  if (typeof window === 'undefined') return
  const isInitialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED)
  if (!isInitialized) {
    const sample = getSampleData()
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(sample.tasks))
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(sample.goals))
    localStorage.setItem(STORAGE_KEYS.FOCUS_SESSIONS, JSON.stringify(sample.focusSessions))
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(sample.settings))
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(sample.notifications))
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true')
  }
}

export function loadStoredTasks() {
  initializeStorageIfNeeded()
  return safeJsonParse(localStorage.getItem(STORAGE_KEYS.TASKS), [])
}

export function saveStoredTasks(tasks) {
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks))
}

export function loadStoredGoals() {
  initializeStorageIfNeeded()
  return safeJsonParse(localStorage.getItem(STORAGE_KEYS.GOALS), [])
}

export function saveStoredGoals(goals) {
  localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals))
}

export function loadStoredFocusSessions() {
  initializeStorageIfNeeded()
  return safeJsonParse(localStorage.getItem(STORAGE_KEYS.FOCUS_SESSIONS), [])
}

export function saveStoredFocusSessions(sessions) {
  localStorage.setItem(STORAGE_KEYS.FOCUS_SESSIONS, JSON.stringify(sessions))
}

export function loadStoredSettings() {
  initializeStorageIfNeeded()
  return { ...DEFAULT_SETTINGS, ...safeJsonParse(localStorage.getItem(STORAGE_KEYS.SETTINGS), {}) }
}

export function saveStoredSettings(settings) {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings))
}

export function loadStoredNotifications() {
  initializeStorageIfNeeded()
  return safeJsonParse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS), [])
}

export function saveStoredNotifications(notifications) {
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications))
}

export function exportAllDataAsJson() {
  const data = {
    version: 1,
    exportDate: new Date().toISOString(),
    tasks: loadStoredTasks(),
    goals: loadStoredGoals(),
    focusSessions: loadStoredFocusSessions(),
    settings: loadStoredSettings(),
  }
  return JSON.stringify(data, null, 2)
}

export function importAllDataFromJson(jsonString) {
  try {
    const data = JSON.parse(jsonString)
    if (!data || typeof data !== 'object') {
      return { success: false, error: 'Invalid JSON format' }
    }

    if (!Array.isArray(data.tasks)) {
      return { success: false, error: 'Import data missing tasks array' }
    }

    if (data.tasks) localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(data.tasks))
    if (data.goals && Array.isArray(data.goals)) localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(data.goals))
    if (data.focusSessions && Array.isArray(data.focusSessions)) localStorage.setItem(STORAGE_KEYS.FOCUS_SESSIONS, JSON.stringify(data.focusSessions))
    if (data.settings && typeof data.settings === 'object') localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings))

    return {
      success: true,
      summary: {
        tasksCount: (data.tasks || []).length,
        goalsCount: (data.goals || []).length,
        sessionsCount: (data.focusSessions || []).length
      }
    }
  } catch (err) {
    return { success: false, error: err.message || 'Failed to parse JSON file' }
  }
}

export function resetToSampleWorkspace() {
  const sample = getSampleData()
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(sample.tasks))
  localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(sample.goals))
  localStorage.setItem(STORAGE_KEYS.FOCUS_SESSIONS, JSON.stringify(sample.focusSessions))
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(sample.settings))
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(sample.notifications))
  localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true')
  return sample
}

export function clearAllApplicationData() {
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify([]))
  localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify([]))
  localStorage.setItem(STORAGE_KEYS.FOCUS_SESSIONS, JSON.stringify([]))
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify([]))
  localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true')
  return {
    tasks: [],
    goals: [],
    focusSessions: [],
    settings: DEFAULT_SETTINGS,
    notifications: []
  }
}
