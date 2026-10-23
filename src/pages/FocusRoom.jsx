import React, { useState, useEffect, useRef } from 'react'
import {
  Play,
  Pause,
  RotateCcw,
  Coffee,
  Brain,
  CheckCircle2,
  Volume2,
  VolumeX,
  Clock,
  Sparkles,
  ArrowRight
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { formatMinutes } from '../lib/dateUtils'
import { format } from 'date-fns'

const TIMER_MODES = {
  FOCUS: 'focus',
  SHORT_BREAK: 'short_break',
  LONG_BREAK: 'long_break',
}

export default function FocusRoom() {
  const {
    tasks,
    settings,
    updateSettings,
    focusSessions,
    addFocusSession
  } = useApp()

  const [mode, setMode] = useState(TIMER_MODES.FOCUS)
  const [selectedTaskId, setSelectedTaskId] = useState('')
  const [isActive, setIsActive] = useState(false)
  
  // Timer durations in seconds
  const focusDurationSec = (settings.pomodoroDuration || 25) * 60
  const shortBreakDurationSec = (settings.shortBreakDuration || 5) * 60
  const longBreakDurationSec = (settings.longBreakDuration || 15) * 60

  const getDurationForMode = (m) => {
    switch (m) {
      case TIMER_MODES.SHORT_BREAK: return shortBreakDurationSec
      case TIMER_MODES.LONG_BREAK: return longBreakDurationSec
      default: return focusDurationSec
    }
  }

  const [timeLeft, setTimeLeft] = useState(focusDurationSec)
  const intervalRef = useRef(null)

  // Switch modes
  const handleSwitchMode = (newMode) => {
    setIsActive(false)
    if (intervalRef.current) clearInterval(intervalRef.current)
    setMode(newMode)
    setTimeLeft(getDurationForMode(newMode))
  }

  // Timer Tick Effect
  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current)
            setIsActive(false)
            handleTimerComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isActive, mode])

  // Timer Complete Handler
  const handleTimerComplete = () => {
    if (mode === TIMER_MODES.FOCUS) {
      const associatedTask = tasks.find(t => t.id === selectedTaskId)
      addFocusSession({
        taskId: selectedTaskId || null,
        taskTitle: associatedTask ? associatedTask.title : 'Deep Focus Session',
        durationMinutes: settings.pomodoroDuration || 25,
        type: 'focus'
      })
      // Auto prompt switch to short break
      setMode(TIMER_MODES.SHORT_BREAK)
      setTimeLeft(shortBreakDurationSec)
    } else {
      // Break completed, switch back to focus
      setMode(TIMER_MODES.FOCUS)
      setTimeLeft(focusDurationSec)
    }
  }

  const handleToggleTimer = () => {
    setIsActive(prev => !prev)
  }

  const handleResetTimer = () => {
    setIsActive(false)
    if (intervalRef.current) clearInterval(intervalRef.current)
    setTimeLeft(getDurationForMode(mode))
  }

  // Format mm:ss
  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

  // Progress percentage for circular or bar visualization
  const totalDuration = getDurationForMode(mode)
  const progressPercent = Math.max(0, Math.min(100, ((totalDuration - timeLeft) / totalDuration) * 100))

  // Today's focus sessions metrics
  const todayStr = new Date().toISOString().split('T')[0]
  const todaysSessions = focusSessions.filter(s => s.date === todayStr)
  const todaysFocusMinutes = todaysSessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0)

  const incompleteTasks = tasks.filter(t => !t.completed)

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-foreground tracking-tight">
            Focus Room
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Immerse in distraction-free deep work blocks.
          </p>
        </div>

        {/* Sound toggle */}
        <button
          onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
          className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-2 transition-colors ${
            settings.soundEnabled
              ? 'bg-primary-soft text-primary border-primary-border'
              : 'bg-muted text-muted-foreground border-border'
          }`}
        >
          {settings.soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          <span>{settings.soundEnabled ? 'Chimes Active' : 'Muted'}</span>
        </button>
      </div>

      {/* Main Focus Card */}
      <div className="clean-card p-8 md:p-12 text-center relative overflow-hidden bg-gradient-to-b from-card to-card-muted/40">
        {/* Mode Selector Tabs */}
        <div className="inline-flex items-center gap-1.5 bg-muted/70 p-1 rounded-2xl border border-border mx-auto mb-8">
          <button
            onClick={() => handleSwitchMode(TIMER_MODES.FOCUS)}
            className={`px-4 py-1.5 text-xs font-medium rounded-xl transition-all ${
              mode === TIMER_MODES.FOCUS
                ? 'bg-primary text-primary-foreground shadow-subtle'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Deep Focus ({settings.pomodoroDuration || 25}m)
          </button>
          <button
            onClick={() => handleSwitchMode(TIMER_MODES.SHORT_BREAK)}
            className={`px-4 py-1.5 text-xs font-medium rounded-xl transition-all ${
              mode === TIMER_MODES.SHORT_BREAK
                ? 'bg-primary text-primary-foreground shadow-subtle'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Short Break ({settings.shortBreakDuration || 5}m)
          </button>
          <button
            onClick={() => handleSwitchMode(TIMER_MODES.LONG_BREAK)}
            className={`px-4 py-1.5 text-xs font-medium rounded-xl transition-all ${
              mode === TIMER_MODES.LONG_BREAK
                ? 'bg-primary text-primary-foreground shadow-subtle'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Long Break ({settings.longBreakDuration || 15}m)
          </button>
        </div>

        {/* Big Clean Timer Display */}
        <div className="py-4">
          <div className="text-7xl md:text-8xl font-bold tracking-tight font-mono text-foreground select-none">
            {formattedTime}
          </div>
          <p className="text-xs uppercase tracking-widest text-primary font-semibold mt-2">
            {mode === TIMER_MODES.FOCUS ? 'Focus Block in Progress' : 'Rest & Recharge'}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="max-w-md mx-auto w-full bg-muted rounded-full h-1.5 overflow-hidden my-6">
          <div
            className="bg-primary h-full transition-all duration-1000 ease-linear rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Task Connection Picker */}
        <div className="max-w-xs mx-auto mb-8">
          <label className="block text-[11px] font-medium text-muted-foreground mb-1.5">
            Anchor this session to a task:
          </label>
          <select
            value={selectedTaskId}
            onChange={(e) => setSelectedTaskId(e.target.value)}
            disabled={isActive}
            className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary truncate"
          >
            <option value="">General Focus / No Task</option>
            {incompleteTasks.map(t => (
              <option key={t.id} value={t.id}>{t.title}</option>
            ))}
          </select>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={handleToggleTimer}
            className="px-8 py-3 rounded-2xl bg-primary text-primary-foreground hover:bg-primary-hover shadow-elevated font-medium text-sm flex items-center gap-2.5 transition-all active:scale-95"
          >
            {isActive ? (
              <>
                <Pause className="w-4 h-4" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>{timeLeft < totalDuration ? 'Resume' : 'Start Focus'}</span>
              </>
            )}
          </button>

          <button
            onClick={handleResetTimer}
            className="p-3 rounded-2xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Reset timer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Focus Session History & Today's Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Today's Focus Metrics */}
        <div className="clean-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Today's Focus Output</h3>
            <Brain className="w-4 h-4 text-primary" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-foreground">{formatMinutes(todaysFocusMinutes)}</span>
            <span className="text-xs text-muted-foreground">accumulated</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {todaysSessions.length} completed session(s) today.
          </p>
        </div>

        {/* Recent Focus Session Log (2 Cols) */}
        <div className="md:col-span-2 clean-card p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-border pb-2.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recent Focus Sessions</h3>
            <span className="text-xs text-muted-foreground font-mono">{focusSessions.length} total logged</span>
          </div>

          {focusSessions.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">
              No focus sessions recorded yet. Start your first session above!
            </p>
          ) : (
            <div className="divide-y divide-border max-h-48 overflow-y-auto">
              {focusSessions.slice(0, 5).map(session => (
                <div key={session.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    <span className="font-medium text-foreground truncate max-w-[240px]">
                      {session.taskTitle}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground shrink-0 text-[11px]">
                    <span>{session.durationMinutes} min</span>
                    <span>•</span>
                    <span className="font-mono">{session.date}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
