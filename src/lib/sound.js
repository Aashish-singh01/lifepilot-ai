/**
 * Web Audio API synthesized chimes for LifePilot AI.
 * Plays calm, subtle sounds without external audio files.
 */

let audioCtx = null

function getAudioContext() {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (AudioContextClass) {
      audioCtx = new AudioContextClass()
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {})
  }
  return audioCtx
}

/**
 * Play a calm chime when a focus session completes or goal is achieved
 */
export function playChime(enabled = true) {
  if (!enabled) return

  try {
    const ctx = getAudioContext()
    if (!ctx) return

    const now = ctx.currentTime
    // Pleasant major chord (C5, E5, G5, C6) gentle arpeggio
    const frequencies = [523.25, 659.25, 783.99, 1046.50]

    frequencies.forEach((freq, index) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, now + index * 0.08)

      // Soft envelope
      gain.gain.setValueAtTime(0, now + index * 0.08)
      gain.gain.linearRampToValueAtTime(0.08, now + index * 0.08 + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.08 + 1.2)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now + index * 0.08)
      osc.stop(now + index * 0.08 + 1.3)
    })
  } catch (err) {
    console.warn('Audio playback not supported or blocked:', err)
  }
}

/**
 * Subtle soft tap sound when checking a task
 */
export function playCheckSound(enabled = true) {
  if (!enabled) return

  try {
    const ctx = getAudioContext()
    if (!ctx) return

    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'triangle'
    osc.frequency.setValueAtTime(587.33, now) // D5
    osc.frequency.exponentialRampToValueAtTime(880.00, now + 0.08) // A5

    gain.gain.setValueAtTime(0.05, now)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.16)
  } catch (err) {
    console.warn('Audio playback not supported or blocked:', err)
  }
}
