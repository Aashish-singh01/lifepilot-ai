import React, { useState, useRef, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import {
  Menu,
  Search,
  Plus,
  Sparkles,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Trash2,
  X
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { format } from 'date-fns'

const ROUTE_TITLES = {
  '/': { title: 'Overview', subtitle: 'Make today count, one task at a time.' },
  '/tasks': { title: 'My Tasks', subtitle: 'Organize, prioritize, and conquer your responsibilities.' },
  '/calendar': { title: 'Calendar', subtitle: 'Time-block your schedule and track deadlines.' },
  '/goals': { title: 'Goals', subtitle: 'Set measurable targets and track sustained progress.' },
  '/focus': { title: 'Focus Room', subtitle: 'Distraction-free Pomodoro blocks for deep work.' },
  '/insights': { title: 'Insights & Analytics', subtitle: 'Reflect on habits, streaks, and output metrics.' },
  '/alexa-simulator': { title: 'Alexa+ Voice Simulation', subtitle: 'Simulated voice routine & task orchestration for hackathon demo.' },
  '/settings': { title: 'Settings', subtitle: 'Preferences, schedule working hours, theme & data management.' },
}

export default function TopNav({ onOpenMobile }) {
  const location = useLocation()
  const {
    openCreateTask,
    setIsPlanModalOpen,
    setIsSearchOpen,
    notifications,
    markNotificationAsRead,
    clearAllNotifications
  } = useApp()

  const [isNotifOpen, setIsNotifOpen] = useState(false)
  const notifRef = useRef(null)

  const unreadCount = notifications.filter(n => !n.read).length
  const currentRouteMeta = ROUTE_TITLES[location.pathname] || {
    title: 'LifePilot AI',
    subtitle: 'Daily planning workspace'
  }

  // Close notifications dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="h-16 px-4 md:px-8 border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between">
      {/* Left: Mobile hamburger + Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base md:text-lg font-semibold text-foreground tracking-tight flex items-center gap-2">
            {currentRouteMeta.title}
          </h1>
          <p className="text-xs text-muted-foreground hidden sm:block">
            {currentRouteMeta.subtitle}
          </p>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Search trigger */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground bg-muted/60 hover:bg-muted rounded-lg border border-border/80 transition-colors"
          title="Search tasks & goals (Ctrl+K)"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Search</span>
          <kbd className="hidden sm:inline-block text-[10px] px-1 py-0.2 rounded bg-background border border-border text-muted-foreground font-mono">
            ⌘K
          </kbd>
        </button>

        {/* Plan My Day button */}
        <button
          onClick={() => setIsPlanModalOpen(true)}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary-soft text-primary hover:bg-primary-soft/80 border border-primary-border/50 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span>Plan My Day</span>
        </button>

        {/* New Task button */}
        <button
          onClick={() => openCreateTask()}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary-hover shadow-subtle transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </button>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(prev => !prev)}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted relative transition-colors"
            title="Local notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent-forest ring-2 ring-card animate-pulse" />
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-card border border-border rounded-xl shadow-elevated z-50 overflow-hidden animate-fade-in">
              <div className="p-3 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-foreground">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 text-[10px] rounded bg-primary-soft text-primary font-semibold">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {notifications.length > 0 && (
                  <button
                    onClick={clearAllNotifications}
                    className="text-[11px] text-muted-foreground hover:text-red-600 flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear all</span>
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-border">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-muted-foreground">
                    <CheckCircle2 className="w-8 h-8 text-primary/40 mx-auto mb-2" />
                    <p className="font-medium text-foreground">All caught up!</p>
                    <p className="text-[11px] mt-0.5">No new notifications at this time.</p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => markNotificationAsRead(notif.id)}
                      className={`p-3 text-xs cursor-pointer transition-colors hover:bg-muted/50 ${
                        !notif.read ? 'bg-primary-soft/30' : ''
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        {notif.type === 'warning' ? (
                          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        ) : notif.type === 'focus' ? (
                          <Clock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        ) : (
                          <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground">{notif.title}</p>
                          <p className="text-muted-foreground text-[11px] mt-0.5 leading-relaxed">{notif.message}</p>
                          <p className="text-[10px] text-muted-foreground/80 mt-1">
                            {format(new Date(notif.date), 'MMM d, h:mm a')}
                          </p>
                        </div>
                        {!notif.read && (
                          <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
