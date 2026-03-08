import { useRef, useEffect, useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { Design10_NeumorphNoise } from './Design10_NeumorphNoise'
import './Playground.css'

const TAU = Math.PI * 2
const PARTICLE_COUNT = 180
const BASE_RADIUS_RATIO = 0.28

interface Particle {
  angle: number
  speed: number
  radiusOffset: number
  size: number
  hue: number
  opacity: number
  trail: number
}

function createParticles(): Particle[] {
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    angle: (i / PARTICLE_COUNT) * TAU + Math.random() * 0.1,
    speed: 0.002 + Math.random() * 0.004,
    radiusOffset: (Math.random() - 0.5) * 40,
    size: 1.5 + Math.random() * 3,
    hue: 260 + Math.random() * 40,
    opacity: 0.3 + Math.random() * 0.7,
    trail: 3 + Math.random() * 8,
  }))
}

export default function Playground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: 0.5, y: 0.5 })
  const particlesRef = useRef<Particle[]>(createParticles())
  const animRef = useRef(0)
  const [intensity, setIntensity] = useState(1.0)
  const intensityRef = useRef(1.0)
  const [hueShift, setHueShift] = useState(0)
  const hueShiftRef = useRef(0)

  intensityRef.current = intensity
  hueShiftRef.current = hueShift

  const handleMouseMove = useCallback((e: MouseEvent) => {
    mouseRef.current = {
      x: e.clientX / window.innerWidth,
      y: e.clientY / window.innerHeight,
    }
  }, [])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    const t = e.touches[0]
    mouseRef.current = {
      x: t.clientX / window.innerWidth,
      y: t.clientY / window.innerHeight,
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const particles = particlesRef.current

    let w = 0
    let h = 0
    const resize = () => {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w * devicePixelRatio
      canvas.height = h * devicePixelRatio
      canvas.style.width = w + 'px'
      canvas.style.height = h + 'px'
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const draw = (time: number) => {
      const t = time * 0.001
      const mx = mouseRef.current.x
      const my = mouseRef.current.y
      const inten = intensityRef.current
      const hs = hueShiftRef.current

      // Background fade
      ctx.fillStyle = 'rgba(20, 16, 32, 0.15)'
      ctx.fillRect(0, 0, w, h)

      const cx = w / 2
      const cy = h / 2
      const baseR = Math.min(w, h) * BASE_RADIUS_RATIO

      // Mouse influence on ring shape
      const distortX = (mx - 0.5) * 80 * inten
      const distortY = (my - 0.5) * 80 * inten

      // Draw glow behind ring
      const glowGrad = ctx.createRadialGradient(cx, cy, baseR * 0.3, cx, cy, baseR * 1.8)
      glowGrad.addColorStop(0, `hsla(${270 + hs}, 60%, 50%, ${0.08 * inten})`)
      glowGrad.addColorStop(0.5, `hsla(${280 + hs}, 50%, 40%, ${0.04 * inten})`)
      glowGrad.addColorStop(1, 'transparent')
      ctx.fillStyle = glowGrad
      ctx.fillRect(0, 0, w, h)

      // Update and draw particles
      for (const p of particles) {
        p.angle += p.speed * (0.5 + inten * 0.8)

        // Organic ring shape with mouse distortion
        const wave1 = Math.sin(p.angle * 3 + t * 0.5) * 15 * inten
        const wave2 = Math.cos(p.angle * 5 - t * 0.3) * 8 * inten
        const wave3 = Math.sin(p.angle * 7 + t * 0.8) * 5 * inten
        const r = baseR + p.radiusOffset + wave1 + wave2 + wave3

        // Apply mouse distortion
        const dx = Math.cos(p.angle) * distortX
        const dy = Math.sin(p.angle) * distortY
        const x = cx + Math.cos(p.angle) * r + dx
        const y = cy + Math.sin(p.angle) * r + dy

        // Trail
        const tx = cx + Math.cos(p.angle - p.speed * p.trail) * (r - 2) + dx * 0.8
        const ty = cy + Math.sin(p.angle - p.speed * p.trail) * (r - 2) + dy * 0.8

        const hue = p.hue + hs + Math.sin(t * 0.2 + p.angle) * 20

        // Draw trail
        ctx.beginPath()
        ctx.moveTo(tx, ty)
        ctx.lineTo(x, y)
        ctx.strokeStyle = `hsla(${hue}, 60%, 70%, ${p.opacity * 0.3 * inten})`
        ctx.lineWidth = p.size * 0.6
        ctx.stroke()

        // Draw particle
        ctx.beginPath()
        ctx.arc(x, y, p.size * (0.5 + inten * 0.5), 0, TAU)
        ctx.fillStyle = `hsla(${hue}, 70%, 75%, ${p.opacity * inten})`
        ctx.fill()

        // Bright core
        if (p.size > 3) {
          ctx.beginPath()
          ctx.arc(x, y, p.size * 0.3, 0, TAU)
          ctx.fillStyle = `hsla(${hue}, 40%, 95%, ${p.opacity * 0.8})`
          ctx.fill()
        }
      }

      // Center knob glow
      const centerGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseR * 0.35)
      centerGlow.addColorStop(0, `hsla(${270 + hs}, 30%, 85%, 0.15)`)
      centerGlow.addColorStop(0.6, `hsla(${270 + hs}, 40%, 60%, 0.05)`)
      centerGlow.addColorStop(1, 'transparent')
      ctx.fillStyle = centerGlow
      ctx.beginPath()
      ctx.arc(cx, cy, baseR * 0.35, 0, TAU)
      ctx.fill()

      // Center text
      ctx.save()
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.font = '200 28px -apple-system, sans-serif'
      ctx.fillStyle = `hsla(${270 + hs}, 30%, 80%, 0.5)`
      ctx.fillText('Flux Ring', cx, cy - 8)
      ctx.font = '100 13px -apple-system, sans-serif'
      ctx.fillStyle = `hsla(${270 + hs}, 20%, 70%, 0.35)`
      ctx.fillText('PLAYGROUND', cx, cy + 16)
      ctx.restore()

      animRef.current = requestAnimationFrame(draw)
    }

    // Initial fill
    ctx.fillStyle = '#141020'
    ctx.fillRect(0, 0, w, h)

    animRef.current = requestAnimationFrame(draw)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('touchmove', handleTouchMove, { passive: true })

    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('touchmove', handleTouchMove)
    }
  }, [handleMouseMove, handleTouchMove])

  return (
    <div className="playground">
      <canvas ref={canvasRef} className="playground-canvas" />

      <div className="playground-ui">
        <Link to="/" className="playground-back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back
        </Link>

        <div className="playground-controls">
          <label className="playground-control">
            <span>Intensity</span>
            <input
              type="range"
              min={0.2}
              max={3}
              step={0.05}
              value={intensity}
              onChange={(e) => setIntensity(Number(e.target.value))}
            />
          </label>
          <label className="playground-control">
            <span>Hue</span>
            <input
              type="range"
              min={0}
              max={360}
              step={1}
              value={hueShift}
              onChange={(e) => setHueShift(Number(e.target.value))}
            />
          </label>
        </div>
      </div>

      <div className="playground-hint">
        Move your cursor to distort the ring
      </div>

      <div className="playground-mini-design">
        <Design10_NeumorphNoise />
      </div>
    </div>
  )
}
