import { parseSafeDate, getTodayISO } from './dateUtils'
import { isToday, isPast, isTomorrow, differenceInDays } from 'date-fns'

/**
 * LifePilot Local Planning Engine
 * 
 * A deterministic, rule-based scheduler running entirely in your browser.
 * It scores tasks based on deadline urgency, priority tiers, estimated duration,
 * and fits them into your configured working hours without external API calls.
 */

const PRIORITY_SCORES = {
  High: 40,
  Medium: 20,
  Low: 8,
}

export function scoreTask(task, todayStr = getTodayISO()) {
  let score = 0
  let urgencyReason = ''

  // 1. Due date factor
  if (task.dueDate) {
    const dueDate = parseSafeDate(task.dueDate)
    if (dueDate) {
      if (isToday(dueDate)) {
        score += 65
        urgencyReason = 'Due today'
      } else if (isPast(dueDate)) {
        score += 110
        urgencyReason = 'Overdue — requires immediate attention'
      } else if (isTomorrow(dueDate)) {
        score += 35
        urgencyReason = 'Due tomorrow'
      } else {
        const diff = differenceInDays(dueDate, new Date())
        if (diff <= 3) {
          score += 20
          urgencyReason = `Due in ${diff} days`
        } else {
          score += 5
          urgencyReason = 'Upcoming deadline'
        }
      }
    }
  } else {
    score += 5
    urgencyReason = 'No due date set'
  }

  // 2. Priority factor
  const priorityScore = PRIORITY_SCORES[task.priority] || 15
  score += priorityScore

  // 3. Goal connection bonus
  if (task.goalId) {
    score += 15
  }

  // 4. Quick win or deep work factor
  const est = task.estimatedMinutes || 30
  if (est <= 30) {
    score += 10 // Quick wins to build momentum
  }

  return {
    score,
    urgencyReason,
  }
}

function parseTimeToMinutes(timeStr, defaultMinutes = 540) {
  if (!timeStr || !timeStr.includes(':')) return defaultMinutes
  const [h, m] = timeStr.split(':').map(Number)
  if (isNaN(h) || isNaN(m)) return defaultMinutes
  return h * 60 + m
}

function formatMinutesToTime(totalMinutes) {
  const normalized = Math.max(0, Math.min(23 * 60 + 59, totalMinutes))
  const h = Math.floor(normalized / 60)
  const m = normalized % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/**
 * Builds a recommended daily schedule for incomplete tasks
 */
export function generateSmartDailyPlan(tasks, settings = {}) {
  const todayStr = getTodayISO()
  const incompleteTasks = (tasks || []).filter(t => !t.completed)

  const workStartMinutes = parseTimeToMinutes(settings.workingHoursStart || '09:00', 540) // 9:00 AM
  const workEndMinutes = parseTimeToMinutes(settings.workingHoursEnd || '18:00', 1080)   // 6:00 PM
  const availableWorkdayMinutes = Math.max(60, workEndMinutes - workStartMinutes)

  // Score each task
  const scoredTasks = incompleteTasks.map(task => {
    const { score, urgencyReason } = scoreTask(task, todayStr)
    return {
      ...task,
      planScore: score,
      urgencyReason,
    }
  })

  // Sort descending by score
  scoredTasks.sort((a, b) => b.planScore - a.planScore)

  // Pack into time slots
  let currentClockMinutes = workStartMinutes
  const scheduledItems = []
  const overflowItems = []
  let totalEstimatedMinutes = 0

  scoredTasks.forEach((task, index) => {
    const duration = Math.max(15, Math.min(180, task.estimatedMinutes || 30))
    totalEstimatedMinutes += duration

    const taskEndMinutes = currentClockMinutes + duration
    const fitsInWorkday = taskEndMinutes <= workEndMinutes

    // Energy phase classification
    let phase = 'Morning Deep Work'
    if (currentClockMinutes >= 780) { // 13:00+
      phase = 'Afternoon Focus'
    } else if (currentClockMinutes >= 960) { // 16:00+
      phase = 'End-of-day Wrap-up'
    }

    // Contextual reason
    let reasoning = task.urgencyReason
    if (task.priority === 'High' && index === 0) {
      reasoning = 'Highest priority item: tackle first while cognitive energy is peak.'
    } else if (task.goalId) {
      reasoning = `${task.urgencyReason} • Directly advances an active goal.`
    }

    const proposedStartTime = formatMinutesToTime(currentClockMinutes)
    const proposedEndTime = formatMinutesToTime(taskEndMinutes)

    const planItem = {
      task,
      startTime: proposedStartTime,
      endTime: proposedEndTime,
      slotLabel: `${proposedStartTime} – ${proposedEndTime}`,
      durationMinutes: duration,
      energyPhase: phase,
      reasoning,
      fitsInWorkday,
    }

    if (fitsInWorkday) {
      scheduledItems.push(planItem)
      // Add a 10-15 minute rest buffer between tasks
      currentClockMinutes = taskEndMinutes + (duration >= 45 ? 15 : 10)
    } else {
      overflowItems.push(planItem)
    }
  })

  const isOverloaded = totalEstimatedMinutes > availableWorkdayMinutes
  const overloadMinutes = isOverloaded ? totalEstimatedMinutes - availableWorkdayMinutes : 0

  return {
    engineName: 'LifePilot Deterministic Planning Engine',
    engineNotice: 'Schedule generated locally using deadline urgency, priority weights, and your working hours preference.',
    generatedAt: new Date().toISOString(),
    totalTasksAnalyzed: incompleteTasks.length,
    scheduledTasks: scheduledItems,
    overflowTasks: overflowItems,
    totalEstimatedMinutes,
    availableWorkdayMinutes,
    isOverloaded,
    overloadMinutes,
  }
}
