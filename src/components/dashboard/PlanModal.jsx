import React, { useMemo } from 'react'
import {
  X,
  Sparkles,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  ArrowRight,
  Info,
  Flag
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { generateSmartDailyPlan } from '../../lib/planner'
import { formatMinutes } from '../../lib/dateUtils'

export default function PlanModal() {
  const {
    isPlanModalOpen,
    setIsPlanModalOpen,
    tasks,
    settings,
    applySmartPlan
  } = useApp()

  const plan = useMemo(() => {
    if (!isPlanModalOpen) return null
    return generateSmartDailyPlan(tasks, settings)
  }, [isPlanModalOpen, tasks, settings])

  if (!isPlanModalOpen || !plan) return null

  const handleApply = () => {
    applySmartPlan(plan.scheduledTasks)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-card w-full max-w-2xl rounded-2xl border border-border shadow-elevated overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary-soft text-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-foreground">Smart Daily Plan</h2>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-primary-soft text-primary border border-primary-border">
                  Local Planning Engine
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Deterministic time-blocking based on deadlines, priorities, and work hours.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsPlanModalOpen(false)}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Transparency / Honesty Disclaimer Banner */}
          <div className="p-3 rounded-xl bg-muted/70 border border-border text-xs text-muted-foreground flex items-start gap-2.5">
            <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="text-foreground font-medium">How this plan works:</strong> LifePilot runs a deterministic planning algorithm in your browser. It calculates deadline urgency, weights priority tiers (High, Medium, Low), and packs tasks sequentially between your configured working hours ({settings.workingHoursStart} – {settings.workingHoursEnd}) with built-in rest buffers.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-card border border-border">
              <span className="text-[11px] text-muted-foreground block">Planned Tasks</span>
              <span className="text-base font-semibold text-foreground mt-0.5 block">
                {plan.scheduledTasks.length} / {plan.totalTasksAnalyzed}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-card border border-border">
              <span className="text-[11px] text-muted-foreground block">Est. Focus Time</span>
              <span className="text-base font-semibold text-foreground mt-0.5 block">
                {formatMinutes(plan.totalEstimatedMinutes)}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-card border border-border">
              <span className="text-[11px] text-muted-foreground block">Working Hours</span>
              <span className="text-base font-semibold text-foreground mt-0.5 block">
                {settings.workingHoursStart} – {settings.workingHoursEnd}
              </span>
            </div>
          </div>

          {/* Overload Alert if detected */}
          {plan.isOverloaded && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div>
                <p className="font-semibold">Schedule Overload Warning</p>
                <p className="mt-0.5 text-[11px] opacity-90 leading-relaxed">
                  Your incomplete tasks total {formatMinutes(plan.totalEstimatedMinutes)}, which exceeds your available workday by ~{formatMinutes(plan.overloadMinutes)}. We scheduled your highest priority items first; remaining items have been placed in the backlog below.
                </p>
              </div>
            </div>
          )}

          {/* Scheduled Chronological Blocks */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Proposed Today's Schedule
            </h3>

            {plan.scheduledTasks.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground rounded-xl border border-dashed border-border">
                <CheckCircle2 className="w-8 h-8 text-primary/40 mx-auto mb-2" />
                <p className="font-medium text-foreground">No incomplete tasks to plan!</p>
                <p className="text-[11px] mt-0.5">Create some tasks first or enjoy your completed day.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {plan.scheduledTasks.map((item, idx) => (
                  <div
                    key={item.task.id}
                    className="p-3.5 rounded-xl bg-card border border-border hover:border-primary/40 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="px-2.5 py-1 rounded-lg bg-primary-soft text-primary font-mono text-xs font-semibold shrink-0">
                          {item.slotLabel}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-foreground">
                              {item.task.title}
                            </span>
                            <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                              item.task.priority === 'High'
                                ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                                : item.task.priority === 'Medium'
                                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                : 'bg-muted text-muted-foreground'
                            }`}>
                              {item.task.priority}
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1.5">
                            <span className="font-medium text-foreground/80">{item.energyPhase}</span>
                            <span>•</span>
                            <span>{item.reasoning}</span>
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-medium text-muted-foreground">
                          {item.durationMinutes}m
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Overflow Tasks if any */}
          {plan.overflowTasks.length > 0 && (
            <div className="space-y-2 pt-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Deferred / Tomorrow's Queue ({plan.overflowTasks.length})
              </h3>
              <div className="space-y-1.5 opacity-70">
                {plan.overflowTasks.map((item) => (
                  <div
                    key={item.task.id}
                    className="p-2.5 rounded-lg bg-muted/40 border border-border text-xs flex items-center justify-between"
                  >
                    <span className="font-medium text-foreground">{item.task.title}</span>
                    <span className="text-muted-foreground text-[11px]">{item.durationMinutes}m</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border flex items-center justify-between bg-card">
          <p className="text-[11px] text-muted-foreground hidden sm:block">
            You can manually adjust task times at any point.
          </p>
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => setIsPlanModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={plan.scheduledTasks.length === 0}
              className="px-4 py-2 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary-hover disabled:opacity-50 rounded-lg shadow-subtle flex items-center gap-1.5 transition-colors"
            >
              <span>Apply Recommended Schedule</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
