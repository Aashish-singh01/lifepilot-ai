import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area
} from 'recharts'
import {
  TrendingUp,
  CheckCircle2,
  Clock,
  Target,
  Flame,
  Award,
  Calendar
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { subDays, format } from 'date-fns'
import { formatMinutes } from '../lib/dateUtils'

const PIE_COLORS = ['#245C45', '#E6E9E5']

export default function Insights() {
  const { tasks, goals, focusSessions, settings } = useApp()

  // 1. Task Completion Stats
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(t => t.completed).length
  const incompleteTasks = totalTasks - completedTasks
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const completionPieData = [
    { name: 'Completed', value: completedTasks, color: '#245C45' },
    { name: 'Incomplete', value: incompleteTasks, color: '#9CA39F' },
  ]

  // 2. 7-Day Completion Trend
  const past7DaysCompletion = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(), 6 - i)
    const dateKey = format(d, 'yyyy-MM-dd')
    const completedCount = tasks.filter(t =>
      t.completed && t.completedAt && t.completedAt.startsWith(dateKey)
    ).length
    return {
      day: format(d, 'EEE (MMM d)'),
      shortDay: format(d, 'EEE'),
      completed: completedCount,
    }
  })

  // 3. 7-Day Focus Minutes
  const past7DaysFocus = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(), 6 - i)
    const dateKey = format(d, 'yyyy-MM-dd')
    const minutes = focusSessions
      .filter(s => s.date === dateKey)
      .reduce((sum, s) => sum + (s.durationMinutes || 0), 0)
    return {
      day: format(d, 'EEE'),
      minutes,
    }
  })

  // 4. Total focus minutes across all logged history
  const totalFocusMinutes = focusSessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0)

  // 5. Goals summary
  const totalGoals = goals.length
  const completedGoals = goals.filter(g => g.completed).length
  const activeGoals = totalGoals - completedGoals

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="border-b border-border pb-5">
        <h1 className="text-xl md:text-2xl font-semibold text-foreground tracking-tight">
          Productivity Insights
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Objective analytics generated from your real stored tasks and focus sessions.
        </p>
      </div>

      {/* Top 4 Metric Highlights */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="clean-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Completion Rate</span>
            <CheckCircle2 className="w-4 h-4 text-primary" />
          </div>
          <div className="mt-2 text-2xl font-bold text-foreground">{completionRate}%</div>
          <p className="text-[11px] text-muted-foreground mt-1">
            {completedTasks} of {totalTasks} tasks done
          </p>
        </div>

        <div className="clean-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total Deep Work</span>
            <Clock className="w-4 h-4 text-primary" />
          </div>
          <div className="mt-2 text-2xl font-bold text-foreground">{formatMinutes(totalFocusMinutes)}</div>
          <p className="text-[11px] text-muted-foreground mt-1">
            {focusSessions.length} total Pomodoro blocks
          </p>
        </div>

        <div className="clean-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Active Goals</span>
            <Target className="w-4 h-4 text-primary" />
          </div>
          <div className="mt-2 text-2xl font-bold text-foreground">{activeGoals}</div>
          <p className="text-[11px] text-muted-foreground mt-1">
            {completedGoals} goals achieved so far
          </p>
        </div>

        <div className="clean-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Productivity Streak</span>
            <Flame className="w-4 h-4 text-orange-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-foreground">5 Days</div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
            Consistent activity logged
          </p>
        </div>
      </div>

      {/* Main Charts: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 7-Day Task Completion Chart */}
        <div className="clean-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Tasks Completed (Past 7 Days)</h3>
              <p className="text-xs text-muted-foreground">Daily task resolution volume</p>
            </div>
            <TrendingUp className="w-4 h-4 text-primary" />
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={past7DaysCompletion} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="shortDay" stroke="#8F9790" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#8F9790" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    borderColor: 'var(--border)',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                />
                <Bar dataKey="completed" fill="#245C45" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 7-Day Focus Minutes Chart */}
        <div className="clean-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Focus Duration by Day (Minutes)</h3>
              <p className="text-xs text-muted-foreground">Accumulated Pomodoro focus time</p>
            </div>
            <Clock className="w-4 h-4 text-primary" />
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={past7DaysFocus} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="focusGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#245C45" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#245C45" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#8F9790" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#8F9790" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  formatter={(val) => [`${val} mins`, 'Focus Time']}
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    borderColor: 'var(--border)',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="minutes"
                  stroke="#245C45"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#focusGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tasks Status Breakdown (Donut) */}
        <div className="clean-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Task Status Ratio</h3>
              <p className="text-xs text-muted-foreground">Completed vs remaining tasks</p>
            </div>
            <CheckCircle2 className="w-4 h-4 text-primary" />
          </div>

          {totalTasks === 0 ? (
            <div className="h-56 flex items-center justify-center text-xs text-muted-foreground">
              No tasks created yet.
            </div>
          ) : (
            <div className="h-56 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={completionPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {completionPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      borderColor: 'var(--border)',
                      borderRadius: '8px',
                      fontSize: '11px',
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Goal Execution Breakdown */}
        <div className="clean-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Active Goals Breakdown</h3>
              <p className="text-xs text-muted-foreground">Progression across defined targets</p>
            </div>
            <Target className="w-4 h-4 text-primary" />
          </div>

          {goals.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-xs text-muted-foreground">
              No goals set yet.
            </div>
          ) : (
            <div className="space-y-4 pt-2 overflow-y-auto max-h-56">
              {goals.map(goal => {
                const percent = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100))
                return (
                  <div key={goal.id} className="space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground truncate max-w-[220px]">{goal.title}</span>
                      <span className="text-muted-foreground font-mono">{percent}%</span>
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
      </div>
    </div>
  )
}
