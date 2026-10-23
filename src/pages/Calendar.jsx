import React, { useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  Flag,
  X
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import {
  format,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO
} from 'date-fns'

export default function Calendar() {
  const {
    tasks,
    openCreateTask,
    openEditTask,
    toggleTaskComplete
  } = useApp()

  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewType, setViewType] = useState('month') // 'month' | 'week'
  const [selectedDate, setSelectedDate] = useState(new Date())

  // Navigation handlers
  const handlePrev = () => {
    if (viewType === 'month') setCurrentDate(subMonths(currentDate, 1))
    else setCurrentDate(subWeeks(currentDate, 1))
  }

  const handleNext = () => {
    if (viewType === 'month') setCurrentDate(addMonths(currentDate, 1))
    else setCurrentDate(addWeeks(currentDate, 1))
  }

  const handleToday = () => {
    const now = new Date()
    setCurrentDate(now)
    setSelectedDate(now)
  }

  // Days calculations
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(monthStart)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const monthDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  // Week view days
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 })
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })

  const getTasksForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return tasks.filter(t => t.dueDate === dateStr)
  }

  const selectedDateTasks = getTasksForDate(selectedDate)

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-foreground tracking-tight">
            Calendar
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Visualize deadlines and plan your weekly workload across time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Type Switcher */}
          <div className="flex items-center bg-muted/60 p-0.5 rounded-xl border border-border">
            <button
              onClick={() => setViewType('month')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                viewType === 'month' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setViewType('week')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                viewType === 'week' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Week
            </button>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-1 bg-card border border-border rounded-xl p-0.5">
            <button
              onClick={handlePrev}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
              title="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className="px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted rounded-lg"
            >
              Today
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
              title="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => openCreateTask({ dueDate: format(selectedDate, 'yyyy-MM-dd') })}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium bg-primary text-primary-foreground hover:bg-primary-hover shadow-subtle"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Task</span>
          </button>
        </div>
      </div>

      {/* Month Title */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-foreground">
          {format(currentDate, viewType === 'month' ? 'MMMM yyyy' : "'Week of' MMM d, yyyy")}
        </h2>
        <span className="text-xs text-muted-foreground">
          Click any date to inspect scheduled tasks
        </span>
      </div>

      {/* Main Calendar Grid Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar Grid (3 Cols on Desktop) */}
        <div className="lg:col-span-3 clean-card overflow-hidden">
          {viewType === 'month' ? (
            <div>
              {/* Day names header */}
              <div className="grid grid-cols-7 border-b border-border bg-muted/30 text-center text-xs font-medium text-muted-foreground py-2.5">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>

              {/* Month Day Cells */}
              <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-border">
                {monthDays.map((day) => {
                  const dayTasks = getTasksForDate(day)
                  const isCurrentMonth = isSameMonth(day, monthStart)
                  const isSelected = isSameDay(day, selectedDate)
                  const isCurrentDay = isToday(day)

                  return (
                    <div
                      key={day.toISOString()}
                      onClick={() => setSelectedDate(day)}
                      className={`min-h-[90px] p-2 transition-colors cursor-pointer flex flex-col justify-between ${
                        !isCurrentMonth ? 'bg-muted/20 opacity-40' : 'bg-card hover:bg-muted/30'
                      } ${isSelected ? 'ring-2 ring-primary ring-inset' : ''}`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full ${
                            isCurrentDay
                              ? 'bg-primary text-primary-foreground font-semibold'
                              : 'text-foreground'
                          }`}
                        >
                          {format(day, 'd')}
                        </span>

                        {dayTasks.length > 0 && (
                          <span className="text-[10px] font-mono text-muted-foreground">
                            {dayTasks.length}
                          </span>
                        )}
                      </div>

                      {/* Task badges */}
                      <div className="space-y-1 mt-1 overflow-hidden">
                        {dayTasks.slice(0, 2).map((t) => (
                          <div
                            key={t.id}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-medium truncate flex items-center gap-1 ${
                              t.completed
                                ? 'bg-muted text-muted-foreground line-through opacity-70'
                                : t.priority === 'High'
                                ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                                : 'bg-primary-soft text-primary'
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
                            <span className="truncate">{t.title}</span>
                          </div>
                        ))}
                        {dayTasks.length > 2 && (
                          <span className="text-[10px] text-muted-foreground font-medium pl-1">
                            +{dayTasks.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            /* Weekly View */
            <div className="divide-y divide-border">
              <div className="grid grid-cols-7 border-b border-border bg-muted/30 text-center py-2.5">
                {weekDays.map(day => (
                  <div key={day.toISOString()} className="text-xs">
                    <p className="font-medium text-muted-foreground">{format(day, 'EEE')}</p>
                    <p className={`text-sm font-semibold mt-0.5 inline-block px-2 py-0.5 rounded-full ${isToday(day) ? 'bg-primary text-primary-foreground' : 'text-foreground'}`}>
                      {format(day, 'd')}
                    </p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 divide-x divide-border min-h-[420px]">
                {weekDays.map(day => {
                  const dayTasks = getTasksForDate(day)
                  const isSelected = isSameDay(day, selectedDate)

                  return (
                    <div
                      key={day.toISOString()}
                      onClick={() => setSelectedDate(day)}
                      className={`p-2 space-y-2 cursor-pointer transition-colors ${
                        isSelected ? 'bg-primary-soft/10 ring-1 ring-primary' : 'hover:bg-muted/20'
                      }`}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          openCreateTask({ dueDate: format(day, 'yyyy-MM-dd') })
                        }}
                        className="w-full py-1 text-[11px] text-muted-foreground hover:text-primary hover:bg-muted rounded-md flex items-center justify-center gap-1 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>

                      {dayTasks.map(task => (
                        <div
                          key={task.id}
                          onClick={(e) => {
                            e.stopPropagation()
                            openEditTask(task)
                          }}
                          className={`p-2 rounded-lg border text-xs shadow-xs space-y-1 transition-all ${
                            task.completed
                              ? 'bg-muted/40 border-border opacity-70 line-through'
                              : 'bg-card border-border hover:border-primary/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className={`text-[9px] px-1 rounded font-medium ${
                              task.priority === 'High' ? 'bg-red-500/10 text-red-600' : 'bg-muted text-muted-foreground'
                            }`}>
                              {task.priority}
                            </span>
                            {task.scheduledTime && (
                              <span className="text-[10px] font-mono text-primary font-medium">{task.scheduledTime}</span>
                            )}
                          </div>
                          <p className="font-medium text-foreground line-clamp-2 leading-snug">{task.title}</p>
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Selected Date Details Panel (1 Col on Desktop) */}
        <div className="clean-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">Selected Date</span>
              <h3 className="text-sm font-semibold text-foreground mt-0.5">
                {format(selectedDate, 'EEEE, MMM d, yyyy')}
              </h3>
            </div>
            <button
              onClick={() => openCreateTask({ dueDate: format(selectedDate, 'yyyy-MM-dd') })}
              className="p-1.5 rounded-lg bg-primary-soft text-primary hover:bg-primary-soft/80"
              title="Add task for this date"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2.5">
            {selectedDateTasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarIcon className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
                <p className="text-xs font-medium text-foreground">No tasks scheduled</p>
                <p className="text-[11px] mt-0.5">Plan something for this date.</p>
                <button
                  onClick={() => openCreateTask({ dueDate: format(selectedDate, 'yyyy-MM-dd') })}
                  className="mt-3 px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary-hover rounded-lg"
                >
                  Schedule Task
                </button>
              </div>
            ) : (
              selectedDateTasks.map(task => (
                <div
                  key={task.id}
                  className="p-3 rounded-xl bg-card border border-border hover:border-primary/40 space-y-2 text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      <button
                        onClick={() => toggleTaskComplete(task.id)}
                        className={`w-4 h-4 mt-0.5 rounded border flex items-center justify-center shrink-0 ${
                          task.completed
                            ? 'bg-primary border-primary text-primary-foreground'
                            : 'border-muted-foreground/40 hover:border-primary'
                        }`}
                      >
                        {task.completed && <CheckCircle2 className="w-3 h-3" />}
                      </button>
                      <div>
                        <p
                          onClick={() => openEditTask(task)}
                          className={`font-medium cursor-pointer hover:text-primary ${
                            task.completed ? 'line-through text-muted-foreground' : 'text-foreground'
                          }`}
                        >
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-1">
                          {task.scheduledTime && (
                            <span className="font-mono text-primary font-medium">{task.scheduledTime}</span>
                          )}
                          <span>{task.estimatedMinutes}m</span>
                          <span>•</span>
                          <span>{task.category}</span>
                        </div>
                      </div>
                    </div>

                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium shrink-0 ${
                      task.priority === 'High' ? 'bg-red-500/10 text-red-600' : 'bg-muted text-muted-foreground'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
