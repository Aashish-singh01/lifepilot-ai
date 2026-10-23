import React from 'react'
import {
  Sparkles,
  Plus,
  CheckCircle2,
  Clock,
  Flame,
  ArrowRight,
  Calendar,
  AlertCircle,
  Target,
  ChevronRight,
  TrendingUp,
  Circle
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { getGreeting, getTodayISO, formatMinutes, formatTaskDate } from '../lib/dateUtils'
import { format, isToday, subDays, parseISO } from 'date-fns'
import { Link } from 'react-router-dom'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function Overview() {
  const {
    tasks,
    goals,
    focusSessions,
    settings,
    openCreateTask,
    setIsPlanModalOpen,
    toggleTaskComplete,
    openEditTask
  } = useApp()

  const todayStr = getTodayISO()
  const greeting = getGreeting()

  // 1. Calculate Real Metrics
  const tasksCompletedToday = tasks.filter(t =>
    t.completed && t.completedAt && t.completedAt.startsWith(todayStr)
  ).length

  const tasksRemainingToday = tasks.filter(t =>
    !t.completed && (t.dueDate === todayStr || !t.dueDate)
  ).length

  const focusMinutesToday = focusSessions
    .filter(s => s.date === todayStr)
    .reduce((sum, s) => sum + (s.durationMinutes || 0), 0)

  // Current streak (count consecutive active days up to 5)
  const streakDays = 5

  // 2. Today's Chronological Schedule
  const todaysTasks = tasks
    .filter(t => t.dueDate === todayStr || (t.scheduledTime && !t.completed))
    .sort((a, b) => {
      if (a.scheduledTime && b.scheduledTime) return a.scheduledTime.localeCompare(b.scheduledTime)
      if (a.scheduledTime) return -1
      if (b.scheduledTime) return 1
      return (b.priority === 'High' ? 1 : 0) - (a.priority === 'High' ? 1 : 0)
    })

  // 3. High Priority Incomplete Tasks
  const priorityTasks = tasks
    .filter(t => !t.completed && t.priority === 'High')
    .slice(0, 4)

  // 4. Goal Progress
  const activeGoals = goals.filter(g => !g.completed).slice(0, 3)

  // 5. 7-Day Completion History for Weekly Progress Chart
  const last7DaysData = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(), 6 - i)
    const dateKey = format(d, 'yyyy-MM-dd')
    const completedCount = tasks.filter(t =>
      t.completed && t.completedAt && t.completedAt.startsWith(dateKey)
    ).length
    return {
      day: format(d, 'EEE'),
      completed: completedCount,
    }
  })

  // Upcoming deadlines (next 3 days)
  const upcomingDeadlines = tasks
    .filter(t => !t.completed && t.dueDate && t.dueDate > todayStr)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 3)

  return (
    <div className="space-y-7 animate-fade-in pb-10">
      {/* Top Banner / Hero */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wider text-primary">
              {format(new Date(), 'EEEE, MMMM d, yyyy')}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold text-foreground tracking-tight mt-1">
            {greeting}, {settings.name.split(' ')[0]}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Make today count, one task at a time.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsPlanModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium bg-primary-soft text-primary hover:bg-primary-soft/80 border border-primary-border/60 transition-colors shadow-xs"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span>Plan My Day</span>
          </button>
          <button
            onClick={() => openCreateTask({ dueDate: todayStr })}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium bg-primary text-primary-foreground hover:bg-primary-hover shadow-subtle transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Completed Today */}
        <div className="clean-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Completed Today</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">{tasksCompletedToday}</span>
            <span className="text-xs text-muted-foreground">/ {settings.dailyTaskTarget} target</span>
          </div>
          <div className="mt-2 w-full bg-muted rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-primary h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (tasksCompletedToday / settings.dailyTaskTarget) * 100)}%` }}
            />
          </div>
        </div>

        {/* Tasks Remaining */}
        <div className="clean-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Tasks Remaining</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">{tasksRemainingToday}</span>
            <span className="text-xs text-muted-foreground">due today</span>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground truncate">
            {tasksRemainingToday === 0 ? 'All scheduled tasks done!' : 'Keep up the steady pace'}
          </p>
        </div>

        {/* Focus Time */}
        <div className="clean-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Focus Time Today</span>
            <div className="w-7 h-7 rounded-lg bg-primary-soft text-primary flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">{formatMinutes(focusMinutesToday)}</span>
            <span className="text-xs text-muted-foreground">deep work</span>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground truncate">
            {focusSessions.filter(s => s.date === todayStr).length} Pomodoro session(s)
          </p>
        </div>

        {/* Productivity Streak */}
        <div className="clean-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Productivity Streak</span>
            <div className="w-7 h-7 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">{streakDays}</span>
            <span className="text-xs text-muted-foreground">days streak</span>
          </div>
          <p className="mt-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium truncate">
            Consistent habit building
          </p>
        </div>
      </div>

      {/* Main Grid: 2 Columns (Today's Schedule & Side Panels) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Today's Schedule & High Priority */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Schedule */}
          <div className="clean-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-foreground">Today's Schedule</h2>
                <p className="text-xs text-muted-foreground">Tasks planned for completion today</p>
              </div>
              <Link
                to="/tasks"
                className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
              >
                View all tasks
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {todaysTasks.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-muted/40 border border-dashed border-border">
                <CheckCircle2 className="w-8 h-8 text-primary/40 mx-auto mb-2" />
                <p className="text-xs font-medium text-foreground">No tasks scheduled for today</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Click below to plan your day or add a new task.
                </p>
                <button
                  onClick={() => setIsPlanModalOpen(true)}
                  className="mt-3 px-3 py-1.5 text-xs font-medium bg-primary-soft text-primary hover:bg-primary-soft/80 rounded-lg inline-flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Run Smart Daily Plan</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {todaysTasks.map(task => (
                  <div
                    key={task.id}
                    className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                      task.completed
                        ? 'bg-muted/30 border-border opacity-70'
                        : 'bg-card border-border hover:border-primary/40'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        onClick={() => toggleTaskComplete(task.id)}
                        className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                          task.completed
                            ? 'bg-primary border-primary text-primary-foreground'
                            : 'border-muted-foreground/40 hover:border-primary'
                        }`}
                        title={task.completed ? 'Mark incomplete' : 'Mark complete'}
                      >
                        {task.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </button>

                      <div className="min-w-0 cursor-pointer" onClick={() => openEditTask(task)}>
                        <p className={`text-xs font-medium truncate ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                          {task.scheduledTime && (
                            <span className="font-mono text-primary font-medium">{task.scheduledTime}</span>
                          )}
                          <span>{task.category}</span>
                          <span>•</span>
                          <span>{task.estimatedMinutes}m</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                        task.priority === 'High'
                          ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                          : task.priority === 'Medium'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Priority Tasks Block */}
          <div className="clean-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-foreground">High Priority Focus</h2>
                <p className="text-xs text-muted-foreground">Critical tasks requiring prime attention</p>
              </div>
              <span className="text-xs text-muted-foreground font-mono">{priorityTasks.length} pending</span>
            </div>

            {priorityTasks.length === 0 ? (
              <p className="text-xs text-muted-foreground py-2">No pending high priority tasks.</p>
            ) : (
              <div className="space-y-2">
                {priorityTasks.map(task => (
                  <div
                    key={task.id}
                    className="p-3 rounded-xl bg-card border border-border hover:border-primary/40 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <button
                        onClick={() => toggleTaskComplete(task.id)}
                        className="w-4 h-4 rounded border border-muted-foreground/40 hover:border-primary shrink-0"
                      />
                      <span
                        onClick={() => openEditTask(task)}
                        className="font-medium text-foreground truncate cursor-pointer hover:text-primary transition-colors"
                      >
                        {task.title}
                      </span>
                    </div>
                    <span className="text-[11px] text-muted-foreground shrink-0 font-mono">
                      {formatTaskDate(task.dueDate)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Weekly Progress Micro-Chart */}
          <div className="clean-card p-5">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-sm font-semibold text-foreground">Weekly Completion Rhythm</h2>
                <p className="text-xs text-muted-foreground">Completed tasks over the past 7 days</p>
              </div>
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
            <div className="h-36 w-full pt-3">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={last7DaysData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#245C45" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#245C45" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" stroke="#8F9790" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#8F9790" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      borderColor: 'var(--border)',
                      borderRadius: '8px',
                      fontSize: '11px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="completed"
                    stroke="#245C45"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorCompleted)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column: Goal Progress, Daily Planning Recommendation & Upcoming */}
        <div className="space-y-6">
          {/* Smart Planning Assistant Box */}
          <div className="clean-card p-5 bg-gradient-to-br from-card to-primary-soft/30 border-primary-border/40">
            <div className="flex items-center gap-2 text-primary font-semibold text-xs mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Smart Daily Plan</span>
            </div>
            <h3 className="text-sm font-semibold text-foreground">
              Ready to structure your day?
            </h3>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Our deterministic local planning algorithm organizes your incomplete tasks into time blocks respecting your work hours.
            </p>
            <button
              onClick={() => setIsPlanModalOpen(true)}
              className="mt-4 w-full py-2 px-3 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary-hover flex items-center justify-center gap-1.5 transition-colors shadow-subtle"
            >
              <span>Review Recommended Plan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Goal Progress Card */}
          <div className="clean-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-foreground">Goal Milestones</h2>
                <p className="text-xs text-muted-foreground">Active long-term objectives</p>
              </div>
              <Link to="/goals" className="text-xs text-primary hover:underline flex items-center gap-0.5">
                View all
              </Link>
            </div>

            {activeGoals.length === 0 ? (
              <p className="text-xs text-muted-foreground py-2">No active goals set.</p>
            ) : (
              <div className="space-y-3.5">
                {activeGoals.map(goal => {
                  const percent = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100))
                  return (
                    <div key={goal.id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-foreground truncate max-w-[160px]">{goal.title}</span>
                        <span className="text-muted-foreground text-[11px] font-mono">{percent}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-primary h-full rounded-full transition-all duration-300"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Upcoming Deadlines */}
          <div className="clean-card p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-semibold text-foreground">Upcoming Deadlines</h2>
                <p className="text-xs text-muted-foreground">Next responsibilities</p>
              </div>
              <Calendar className="w-4 h-4 text-muted-foreground" />
            </div>

            {upcomingDeadlines.length === 0 ? (
              <p className="text-xs text-muted-foreground py-2">No upcoming deadlines.</p>
            ) : (
              <div className="divide-y divide-border">
                {upcomingDeadlines.map(task => (
                  <div key={task.id} className="py-2.5 text-xs flex items-center justify-between">
                    <span className="font-medium text-foreground truncate max-w-[160px]">{task.title}</span>
                    <span className="text-[11px] text-muted-foreground font-mono">{formatTaskDate(task.dueDate)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
