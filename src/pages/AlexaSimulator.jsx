import React, { useState } from 'react'
import {
  Mic,
  MicOff,
  Sparkles,
  Volume2,
  VolumeX,
  Play,
  CheckCircle2,
  Calendar,
  Clock,
  Target,
  ArrowRight,
  Info,
  Send,
  Radio
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { getTodayISO, formatMinutes, formatTaskDate } from '../lib/dateUtils'
import { generateSmartDailyPlan } from '../lib/planner'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

const SAMPLE_PROMPTS = [
  "Alexa, what's on my schedule today?",
  "Alexa, add a high-priority task 'Finish Machine Learning Assignment' for 45 minutes.",
  "Alexa, plan my day between 9 AM and 6 PM.",
  "Alexa, how is my goal progress?",
  "Alexa, start a 25-minute focus session for Math.",
]

export default function AlexaSimulator() {
  const {
    tasks,
    goals,
    settings,
    addTask,
    addFocusSession,
    applySmartPlan
  } = useApp()

  const navigate = useNavigate()
  const [inputPrompt, setInputPrompt] = useState('')
  const [isSpeakingAudio, setIsSpeakingAudio] = useState(false)
  const [audioFeedbackEnabled, setAudioFeedbackEnabled] = useState(true)
  const [conversationHistory, setConversationHistory] = useState([
    {
      sender: 'alexa',
      text: "Good morning! I'm your simulated Alexa+ productivity assistant for LifePilot. You can ask me what's on your schedule, tell me to add tasks, or ask me to optimize your daily plan.",
      card: null,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ])

  // Speech Synthesis helper
  const speakText = (text) => {
    if (!audioFeedbackEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return
    try {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 1.05
      utterance.pitch = 1.0
      utterance.onstart = () => setIsSpeakingAudio(true)
      utterance.onend = () => setIsSpeakingAudio(false)
      utterance.onerror = () => setIsSpeakingAudio(false)
      window.speechSynthesis.speak(utterance)
    } catch (err) {
      console.warn('Speech synthesis error:', err)
      setIsSpeakingAudio(false)
    }
  }

  // Conversational Intent Engine
  const processPrompt = (rawText) => {
    const text = rawText.trim().toLowerCase()
    const todayStr = getTodayISO()
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    // Add user message to history
    const userMsg = {
      sender: 'user',
      text: rawText,
      timestamp: timeNow
    }

    let alexaReply = ''
    let cardData = null

    // 1. SCHEDULE QUERY
    if (text.includes('schedule') || text.includes('today') || text.includes('what do i have') || text.includes('calendar')) {
      const todayTasks = tasks.filter(t => t.dueDate === todayStr || (!t.dueDate && !t.completed))
      const remaining = todayTasks.filter(t => !t.completed)

      if (todayTasks.length === 0) {
        alexaReply = "You have no tasks scheduled for today. Would you like me to help you plan one or run Smart Daily Plan?"
      } else {
        alexaReply = `You have ${todayTasks.length} tasks scheduled today, with ${remaining.length} remaining. Your next item is "${remaining[0]?.title || todayTasks[0].title}".`
        cardData = {
          type: 'schedule',
          title: "Today's Schedule Summary",
          items: todayTasks.slice(0, 4)
        }
      }
    }
    // 2. PLAN MY DAY / OPTIMIZE
    else if (text.includes('plan') || text.includes('optimize') || text.includes('routine')) {
      const plan = generateSmartDailyPlan(tasks, settings)
      alexaReply = `I've analyzed your ${plan.totalTasksAnalyzed} incomplete tasks. I have scheduled ${plan.scheduledTasks.length} tasks within your working hours totaling ${formatMinutes(plan.totalEstimatedMinutes)} of focused time.`
      cardData = {
        type: 'plan',
        title: "Recommended Schedule",
        plan: plan,
      }
    }
    // 3. ADD TASK
    else if (text.includes('add') || text.includes('create') || text.includes('remind me to')) {
      // Extract task title
      let taskTitle = rawText.replace(/alexa/gi, '').replace(/add a (high|medium|low)-priority task/gi, '').replace(/add task/gi, '').replace(/add/gi, '').replace(/remind me to/gi, '').trim()
      taskTitle = taskTitle.replace(/for \d+ minutes?/gi, '').replace(/due (today|tomorrow)/gi, '').replace(/['"]/g, '').trim()
      if (!taskTitle) taskTitle = 'New Voice Task'

      const priority = text.includes('high') ? 'High' : text.includes('low') ? 'Low' : 'Medium'
      const estimatedMinutes = text.match(/(\d+)\s*(min|minute)/i) ? parseInt(RegExp.$1, 10) : 30
      const dueDate = text.includes('tomorrow') ? new Date(Date.now() + 86400000).toISOString().split('T')[0] : todayStr

      const created = addTask({
        title: taskTitle.charAt(0).toUpperCase() + taskTitle.slice(1),
        description: 'Created via simulated Alexa+ voice routine.',
        priority,
        category: 'Study',
        dueDate,
        estimatedMinutes,
        tags: ['Voice', 'AlexaDemo'],
      })

      alexaReply = `I've added "${created.title}" with ${priority} priority for ${estimatedMinutes} minutes to your task list.`
      cardData = {
        type: 'task_created',
        task: created
      }
    }
    // 4. FOCUS SESSION
    else if (text.includes('focus') || text.includes('pomodoro') || text.includes('timer')) {
      alexaReply = "Starting your 25-minute Pomodoro focus block now. I will chime when your session completes."
      addFocusSession({
        taskTitle: 'Voice Initiated Deep Work Block',
        durationMinutes: 25,
        type: 'focus'
      })
      cardData = {
        type: 'focus',
        title: 'Focus Session Triggered',
        duration: 25
      }
    }
    // 5. GOAL QUERY
    else if (text.includes('goal') || text.includes('milestone') || text.includes('target')) {
      const active = goals.filter(g => !g.completed)
      if (active.length === 0) {
        alexaReply = "You currently have no active goals set. You can create your first milestone in the Goals section."
      } else {
        const top = active[0]
        const pct = Math.round((top.currentValue / top.targetValue) * 100)
        alexaReply = `You have ${active.length} active goals. Your leading goal is "${top.title}", which is currently at ${pct}% progress.`
        cardData = {
          type: 'goal',
          goals: active.slice(0, 3)
        }
      }
    }
    // FALLBACK
    else {
      alexaReply = `I understood your request: "${rawText}". In this simulated Alexa+ routine, I can query your schedule, generate time-blocked daily plans, or add new priority tasks.`
    }

    const alexaMsg = {
      sender: 'alexa',
      text: alexaReply,
      card: cardData,
      timestamp: timeNow
    }

    setConversationHistory(prev => [...prev, userMsg, alexaMsg])
    speakText(alexaReply)
  }

  const handleSend = (e) => {
    e.preventDefault()
    if (!inputPrompt.trim()) return
    const promptToSend = inputPrompt
    setInputPrompt('')
    processPrompt(promptToSend)
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto pb-12">
      {/* Header & Hackathon Transparency Notice */}
      <div className="border-b border-border pb-5">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-amber-500 animate-pulse" />
            Hackathon Simulated Experience Track
          </span>
        </div>
        <h1 className="text-xl md:text-2xl font-semibold text-foreground tracking-tight">
          Simulated Alexa+ Productivity Assistant
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Interactive voice and conversational routine demo modeled for the Amazon Developer Hackathon.
        </p>
      </div>

      {/* Honest Transparency Alert */}
      <div className="p-4 rounded-xl bg-card border border-border text-xs text-muted-foreground space-y-1.5 leading-relaxed">
        <div className="flex items-center gap-2 text-foreground font-semibold">
          <Info className="w-4 h-4 text-primary" />
          <span>Honest Simulation Notice (Hackathon Rules Compliance)</span>
        </div>
        <p>
          This is an interactive frontend simulation demonstrating how LifePilot AI pairs with an ambient voice assistant (like Alexa+). All schedule calculations and task modifications operate against your real, active localStorage state. It uses the browser's built-in <code>SpeechSynthesis</code> engine for voice responses. It is not connected to a live AWS account or Amazon Echo device.
        </p>
      </div>

      {/* Voice Controls Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-muted/40 border border-border text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-medium text-foreground">Alexa+ Simulation Engine: Active</span>
          {isSpeakingAudio && (
            <span className="text-primary text-[11px] font-semibold animate-pulse ml-2">
              (Speaking response...)
            </span>
          )}
        </div>

        <button
          onClick={() => {
            if (isSpeakingAudio && window.speechSynthesis) window.speechSynthesis.cancel()
            setAudioFeedbackEnabled(!audioFeedbackEnabled)
          }}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors ${
            audioFeedbackEnabled
              ? 'bg-primary-soft text-primary border-primary-border'
              : 'bg-muted text-muted-foreground border-border'
          }`}
        >
          {audioFeedbackEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          <span>{audioFeedbackEnabled ? 'Voice Output ON' : 'Voice Output Muted'}</span>
        </button>
      </div>

      {/* Sample Prompt Chips */}
      <div>
        <p className="text-[11px] font-medium text-muted-foreground mb-2">
          Try sample Alexa voice prompts:
        </p>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => processPrompt(prompt)}
              className="px-3 py-1.5 text-xs bg-card hover:bg-primary-soft hover:text-primary border border-border hover:border-primary-border rounded-xl transition-all text-left shadow-xs"
            >
              "{prompt}"
            </button>
          ))}
        </div>
      </div>

      {/* Simulated Echo Show Display & Chat Transcript */}
      <div className="clean-card overflow-hidden flex flex-col h-[460px]">
        {/* Echo Show Header Strip */}
        <div className="bg-primary/95 text-primary-foreground px-4 py-2.5 flex items-center justify-between text-xs font-medium">
          <div className="flex items-center gap-2">
            <Mic className="w-4 h-4" />
            <span>Alexa+ Smart Display View</span>
          </div>
          <span className="font-mono text-[11px] opacity-90">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>

        {/* Conversation Stream */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {conversationHistory.map((msg, index) => (
            <div
              key={index}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-1 px-1">
                <span className="font-medium">{msg.sender === 'user' ? 'You' : 'Alexa+'}</span>
                <span>•</span>
                <span>{msg.timestamp}</span>
              </div>

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-xs shadow-subtle'
                    : 'bg-muted/70 text-foreground rounded-bl-xs border border-border'
                }`}
              >
                <p>{msg.text}</p>

                {/* Ambient Echo Show Card Preview */}
                {msg.card && (
                  <div className="mt-3 pt-3 border-t border-border/60 bg-card rounded-xl p-3 shadow-xs text-foreground space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs flex items-center gap-1.5 text-primary">
                        <Sparkles className="w-3.5 h-3.5" />
                        {msg.card.title || 'Alexa Routine Response'}
                      </span>
                    </div>

                    {msg.card.type === 'schedule' && (
                      <div className="space-y-1.5 pt-1">
                        {msg.card.items.map(t => (
                          <div key={t.id} className="text-[11px] flex items-center justify-between bg-muted/40 p-1.5 rounded">
                            <span className={t.completed ? 'line-through text-muted-foreground' : ''}>{t.title}</span>
                            <span className="text-muted-foreground font-mono">{t.scheduledTime || `${t.estimatedMinutes}m`}</span>
                          </div>
                        ))}
                        <button
                          onClick={() => navigate('/tasks')}
                          className="mt-2 text-[11px] text-primary hover:underline font-medium flex items-center gap-1"
                        >
                          View in My Tasks <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    {msg.card.type === 'plan' && (
                      <div className="space-y-2 pt-1">
                        <p className="text-[11px] text-muted-foreground">
                          {msg.card.plan.scheduledTasks.length} time slots ready to apply to today's schedule.
                        </p>
                        <button
                          onClick={() => applySmartPlan(msg.card.plan.scheduledTasks)}
                          className="px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary-hover rounded-lg flex items-center gap-1.5"
                        >
                          <span>Apply Plan to Tasks</span>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {msg.card.type === 'task_created' && (
                      <div className="p-2 rounded bg-primary-soft/40 border border-primary-border/40 text-[11px]">
                        <p className="font-semibold text-foreground">Added to Local Database:</p>
                        <p className="text-primary font-medium mt-0.5">{msg.card.task.title}</p>
                        <p className="text-muted-foreground text-[10px] mt-0.5">Priority: {msg.card.task.priority} • Due: {formatTaskDate(msg.card.task.dueDate)}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Input Form Bar */}
        <form onSubmit={handleSend} className="p-3 border-t border-border bg-card flex items-center gap-2">
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder="Type a voice command (e.g. 'Alexa, what is on my schedule today?')..."
            className="flex-1 px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary-hover text-xs font-medium flex items-center gap-1.5 shadow-subtle shrink-0"
          >
            <span>Ask Alexa</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  )
}
