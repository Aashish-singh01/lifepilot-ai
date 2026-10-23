import {
  format,
  isToday,
  isTomorrow,
  isYesterday,
  isPast,
  isFuture,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  parseISO,
  isValid,
  addDays,
  subDays,
} from 'date-fns'

export function getTodayISO() {
  return format(new Date(), 'yyyy-MM-dd')
}

export function parseSafeDate(dateInput) {
  if (!dateInput) return null
  if (dateInput instanceof Date) return isValid(dateInput) ? dateInput : null
  try {
    const parsed = parseISO(dateInput)
    if (isValid(parsed)) return parsed
    const fallback = new Date(dateInput)
    return isValid(fallback) ? fallback : null
  } catch {
    return null
  }
}

export function formatTaskDate(dateStr) {
  if (!dateStr) return 'No due date'
  const date = parseSafeDate(dateStr)
  if (!date) return dateStr

  if (isToday(date)) return 'Today'
  if (isTomorrow(date)) return 'Tomorrow'
  if (isYesterday(date)) return 'Yesterday'

  return format(date, 'MMM d, yyyy')
}

export function isTaskOverdue(dueDateStr, isCompleted) {
  if (!dueDateStr || isCompleted) return false
  const date = parseSafeDate(dueDateStr)
  if (!date) return false
  if (isToday(date)) return false
  return isPast(date)
}

export function formatMinutes(minutes) {
  if (!minutes || minutes <= 0) return '0m'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

export function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export {
  format,
  isToday,
  isTomorrow,
  isYesterday,
  isPast,
  isFuture,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  addDays,
  subDays,
}
