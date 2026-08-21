let audioCtx = null

function getAudioContext() {
  const Ctx = window.AudioContext || window.webkitAudioContext
  if (!Ctx) return null
  if (!audioCtx) audioCtx = new Ctx()
  return audioCtx
}

function playTone(frequency, startDelay, duration) {
  const ctx = getAudioContext()
  if (!ctx) return
  const startAt = ctx.currentTime + startDelay
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.value = frequency
  gain.gain.setValueAtTime(0, startAt)
  gain.gain.linearRampToValueAtTime(0.18, startAt + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.001, startAt + duration)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(startAt)
  osc.stop(startAt + duration + 0.05)
}

const CHIMES = {
  upcoming: [[660, 0, 0.14]],
  start: [
    [784, 0, 0.13],
    [988, 0.15, 0.16],
  ],
  finish: [
    [523, 0, 0.16],
    [392, 0.18, 0.22],
  ],
}

/** Plays a short, self-contained chime via Web Audio — no external assets. */
export function playNotificationSound(kind) {
  try {
    for (const [frequency, delay, duration] of CHIMES[kind] ?? []) {
      playTone(frequency, delay, duration)
    }
  } catch {
    // Audio can be blocked (autoplay policy, unsupported browser) — the
    // toast/notification still gets shown regardless.
  }
}
