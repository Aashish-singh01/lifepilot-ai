import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  CheckSquare,
  Calendar as CalendarIcon,
  Target,
  Timer,
  BarChart3,
  Settings,
  Mic,
  Sparkles,
  Flame,
  Sun,
  Moon,
  ChevronRight
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { cn } from '../../lib/utils'

const NAV_ITEMS = [
  { to: '/', label: 'Overview', icon: LayoutDashboard },
  { to: '/tasks', label: 'My Tasks', icon: CheckSquare },
  { to: '/calendar', label: 'Calendar', icon: CalendarIcon },
  { to: '/goals', label: 'Goals', icon: Target },
  { to: '/focus', label: 'Focus Room', icon: Timer },
  { to: '/insights', label: 'Insights', icon: BarChart3 },
  { to: '/alexa-simulator', label: 'Alexa+ Voice Demo', icon: Mic, badge: 'Demo' },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar({ onCloseMobile }) {
  const { settings, updateSettings, tasks } = useApp()
  const location = useLocation()

  // Calculate quick stats for sidebar badge
  const incompleteCount = tasks.filter(t => !t.completed).length

  const toggleTheme = () => {
    updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })
  }

  return (
    <aside className="w-64 h-full bg-card border-r border-border flex flex-col justify-between select-none">
      {/* Top Header & Brand */}
      <div>
        <div className="p-5 border-b border-border flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-subtle group-hover:scale-105 transition-transform">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="currentColor" fillOpacity="0.2" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-foreground tracking-tight text-base">LifePilot</span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-primary-soft text-primary">AI</span>
              </div>
              <p className="text-xs text-muted-foreground font-normal">Personal Planner</p>
            </div>
          </NavLink>

          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title={`Switch to ${settings.theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {settings.theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.to

            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onCloseMobile}
                className={cn(
                  'flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all group',
                  isActive
                    ? 'bg-primary-soft text-primary font-semibold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className={cn('w-4 h-4 transition-colors', isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground')} />
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.to === '/tasks' && incompleteCount > 0 && (
                    <span className="px-1.5 py-0.2 text-[11px] font-medium rounded-full bg-muted text-muted-foreground">
                      {incompleteCount}
                    </span>
                  )}
                  {item.badge && (
                    <span className="px-1.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      {item.badge}
                    </span>
                  )}
                </div>
              </NavLink>
            )
          })}
        </nav>
      </div>

      {/* Bottom Profile & Productivity Badge */}
      <div className="p-4 border-t border-border space-y-3">
        {/* Streak / Motivation Pill */}
        <div className="bg-primary-soft/60 rounded-xl p-2.5 flex items-center justify-between border border-primary-border/40">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">5-Day Streak</p>
              <p className="text-[11px] text-muted-foreground">Daily targets active</p>
            </div>
          </div>
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="System Active" />
        </div>

        {/* User initials & profile */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground font-semibold text-xs flex items-center justify-center shadow-subtle">
              {settings.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'LP'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-medium text-foreground truncate max-w-[120px]">{settings.name}</p>
              <p className="text-[11px] text-muted-foreground truncate">{settings.role || 'Member'}</p>
            </div>
          </div>
          <NavLink
            to="/settings"
            className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted"
            title="Settings"
          >
            <ChevronRight className="w-4 h-4" />
          </NavLink>
        </div>
      </div>
    </aside>
  )
}
