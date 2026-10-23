import React, { useState, useRef } from 'react'
import {
  Settings as SettingsIcon,
  Sun,
  Moon,
  Clock,
  Target,
  Volume2,
  VolumeX,
  Download,
  Upload,
  RotateCcw,
  Trash2,
  CheckCircle2,
  User,
  ShieldAlert
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { toast } from 'sonner'

export default function Settings() {
  const {
    settings,
    updateSettings,
    exportData,
    handleImportJson,
    resetToSampleData,
    clearAllData
  } = useApp()

  const [name, setName] = useState(settings.name || '')
  const [role, setRole] = useState(settings.role || '')
  const [workingHoursStart, setWorkingHoursStart] = useState(settings.workingHoursStart || '09:00')
  const [workingHoursEnd, setWorkingHoursEnd] = useState(settings.workingHoursEnd || '18:00')
  const [dailyTaskTarget, setDailyTaskTarget] = useState(settings.dailyTaskTarget || 5)
  const [pomodoroDuration, setPomodoroDuration] = useState(settings.pomodoroDuration || 25)
  const [shortBreakDuration, setShortBreakDuration] = useState(settings.shortBreakDuration || 5)
  const [longBreakDuration, setLongBreakDuration] = useState(settings.longBreakDuration || 15)
  const [soundEnabled, setSoundEnabled] = useState(settings.soundEnabled ?? true)

  const [isClearModalOpen, setIsClearModalOpen] = useState(false)
  const [isResetModalOpen, setIsResetModalOpen] = useState(false)
  const fileInputRef = useRef(null)

  const handleSaveProfileAndPreferences = (e) => {
    e.preventDefault()
    updateSettings({
      name: name.trim() || 'Alex Chen',
      role: role.trim() || 'Student & Builder',
      workingHoursStart,
      workingHoursEnd,
      dailyTaskTarget: Number(dailyTaskTarget) || 5,
      pomodoroDuration: Number(pomodoroDuration) || 25,
      shortBreakDuration: Number(shortBreakDuration) || 5,
      longBreakDuration: Number(longBreakDuration) || 15,
      soundEnabled,
    })
  }

  const handleExportJson = () => {
    try {
      const json = exportData()
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `lifepilot_backup_${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('Backup JSON exported successfully')
    } catch (err) {
      toast.error('Failed to export data')
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result
      if (typeof content === 'string') {
        handleImportJson(content)
      }
    }
    reader.onerror = () => {
      toast.error('Failed to read backup file')
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div className="border-b border-border pb-5">
        <h1 className="text-xl md:text-2xl font-semibold text-foreground tracking-tight">
          Settings & Preferences
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Customize your profile, daily work hours, focus intervals, theme, and data storage.
        </p>
      </div>

      <form onSubmit={handleSaveProfileAndPreferences} className="space-y-6">
        {/* Appearance / Theme */}
        <div className="clean-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Appearance Theme</h2>
              <p className="text-xs text-muted-foreground">Select between Light and Dark aesthetic</p>
            </div>
            <div className="flex items-center bg-muted/60 p-1 rounded-xl border border-border">
              <button
                type="button"
                onClick={() => updateSettings({ theme: 'light' })}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  settings.theme === 'light' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>Light</span>
              </button>
              <button
                type="button"
                onClick={() => updateSettings({ theme: 'dark' })}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  settings.theme === 'dark' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Moon className="w-3.5 h-3.5 text-primary" />
                <span>Dark</span>
              </button>
            </div>
          </div>
        </div>

        {/* User Profile */}
        <div className="clean-card p-5 space-y-4">
          <div className="border-b border-border pb-3">
            <h2 className="text-sm font-semibold text-foreground">User Profile</h2>
            <p className="text-xs text-muted-foreground">Your display identity inside LifePilot AI</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Role / Bio
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Student & Builder"
                className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Working Hours & Daily Target */}
        <div className="clean-card p-5 space-y-4">
          <div className="border-b border-border pb-3">
            <h2 className="text-sm font-semibold text-foreground">Planning Engine & Working Hours</h2>
            <p className="text-xs text-muted-foreground">
              These hours bound the local deterministic daily planning engine.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-primary" />
                Workday Start Time
              </label>
              <input
                type="time"
                value={workingHoursStart}
                onChange={(e) => setWorkingHoursStart(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-primary" />
                Workday End Time
              </label>
              <input
                type="time"
                value={workingHoursEnd}
                onChange={(e) => setWorkingHoursEnd(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-primary" />
                Daily Task Target
              </label>
              <input
                type="number"
                min="1"
                max="25"
                value={dailyTaskTarget}
                onChange={(e) => setDailyTaskTarget(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Focus Room & Audio Preferences */}
        <div className="clean-card p-5 space-y-4">
          <div className="border-b border-border pb-3">
            <h2 className="text-sm font-semibold text-foreground">Focus Room & Audio</h2>
            <p className="text-xs text-muted-foreground">Configure Pomodoro intervals and acoustic cues</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Focus Duration (minutes)
              </label>
              <input
                type="number"
                min="5"
                max="120"
                value={pomodoroDuration}
                onChange={(e) => setPomodoroDuration(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Short Break (minutes)
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={shortBreakDuration}
                onChange={(e) => setShortBreakDuration(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Long Break (minutes)
              </label>
              <input
                type="number"
                min="5"
                max="60"
                value={longBreakDuration}
                onChange={(e) => setLongBreakDuration(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {soundEnabled ? <Volume2 className="w-4 h-4 text-primary" /> : <VolumeX className="w-4 h-4 text-muted-foreground" />}
              <div>
                <p className="text-xs font-medium text-foreground">Sound Chimes</p>
                <p className="text-[11px] text-muted-foreground">Play gentle audio bell upon task completion & focus intervals</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                soundEnabled ? 'bg-primary-soft text-primary border-primary-border' : 'bg-muted text-muted-foreground'
              }`}
            >
              {soundEnabled ? 'Enabled' : 'Disabled'}
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-5 py-2 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary-hover rounded-xl shadow-subtle transition-all active:scale-95"
          >
            Save Preferences
          </button>
        </div>
      </form>

      {/* Data Management & Backup Section */}
      <div className="clean-card p-5 space-y-4">
        <div className="border-b border-border pb-3">
          <h2 className="text-sm font-semibold text-foreground">Data Storage & Backup</h2>
          <p className="text-xs text-muted-foreground">
            All your data is stored locally in your browser. Export or import JSON anytime.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Export JSON */}
          <button
            type="button"
            onClick={handleExportJson}
            className="px-3.5 py-2 rounded-xl text-xs font-medium bg-card border border-border hover:border-primary/50 text-foreground flex items-center gap-2 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-primary" />
            <span>Export Data as JSON</span>
          </button>

          {/* Import JSON */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-2 rounded-xl text-xs font-medium bg-card border border-border hover:border-primary/50 text-foreground flex items-center gap-2 transition-colors shadow-xs"
          >
            <Upload className="w-3.5 h-3.5 text-primary" />
            <span>Import JSON Backup</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json,application/json"
            className="hidden"
          />

          {/* Reset to Sample Workspace */}
          <button
            type="button"
            onClick={() => setIsResetModalOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-medium bg-muted/60 hover:bg-muted text-foreground flex items-center gap-2 transition-colors ml-auto"
          >
            <RotateCcw className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Reset to Sample Data</span>
          </button>

          {/* Clear All Data */}
          <button
            type="button"
            onClick={() => setIsClearModalOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-medium bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 flex items-center gap-2 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Workspace</span>
          </button>
        </div>
      </div>

      {/* Clear Confirmation Modal */}
      {isClearModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-card w-full max-w-sm rounded-2xl border border-border shadow-elevated p-5 space-y-3">
            <div className="flex items-center gap-2 text-red-600">
              <ShieldAlert className="w-5 h-5" />
              <h3 className="text-sm font-semibold">Clear All Data</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              This will erase all tasks, goals, focus records, and local notifications from this browser. This action cannot be reversed.
            </p>
            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsClearModalOpen(false)}
                className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  clearAllData()
                  setIsClearModalOpen(false)
                }}
                className="px-3.5 py-1.5 text-xs font-medium bg-red-600 text-white hover:bg-red-700 rounded-lg shadow-subtle"
              >
                Yes, Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-card w-full max-w-sm rounded-2xl border border-border shadow-elevated p-5 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Reset to Sample Data?</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              This will overwrite your current workspace with the default demonstration tasks, goals, and focus history.
            </p>
            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsResetModalOpen(false)}
                className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resetToSampleData()
                  setIsResetModalOpen(false)
                }}
                className="px-3.5 py-1.5 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary-hover rounded-lg shadow-subtle"
              >
                Reset Workspace
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
