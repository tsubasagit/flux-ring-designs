import { useRef, useEffect } from 'react'
import { DesignBase } from './DesignBase'
import { drawCenterUnit, drawBackgroundGlow, drawRingOverlay, drawHowahowa, drawLightAnimation, amplitudeToLevel } from './drawHelpers'

/**
 * Design 10: Neumorph Noise
 * ニューモフィズム × ノイズ波形
 *
 * Figma構想に立ち返り、以下を実現:
 * - 多層のノイズ変調リング（08-1-1の少ない波形問題を解消）
 * - レベルが上がっても黒ずまない（screen合成 + 明度維持）
 * - ニューモフィズム的な凸凹の表面感（明暗2トーンの波線）
 * - 有機的なノイズテクスチャ
 */

// Simple hash-based noise (deterministic, no dependency)
function noise2D(x: number, y: number): number {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453
  return (n - Math.floor(n)) * 2 - 1
}

function smoothNoise(x: number, y: number): number {
  const ix = Math.floor(x)
  const iy = Math.floor(y)
  const fx = x - ix
  const fy = y - iy
  // Smoothstep
  const sx = fx * fx * (3 - 2 * fx)
  const sy = fy * fy * (3 - 2 * fy)

  const n00 = noise2D(ix, iy)
  const n10 = noise2D(ix + 1, iy)
  const n01 = noise2D(ix, iy + 1)
  const n11 = noise2D(ix + 1, iy + 1)

  return n00 * (1 - sx) * (1 - sy) + n10 * sx * (1 - sy) +
         n01 * (1 - sx) * sy + n11 * sx * sy
}

function fbmNoise(x: number, y: number, octaves: number): number {
  let value = 0
  let amp = 1
  let freq = 1
  let maxAmp = 0
  for (let i = 0; i < octaves; i++) {
    value += smoothNoise(x * freq, y * freq) * amp
    maxAmp += amp
    amp *= 0.5
    freq *= 2.0
  }
  return value / maxAmp
}

// Cached offscreen canvases (reused across frames)
let _offscreen: HTMLCanvasElement | null = null
let _grainCanvas: HTMLCanvasElement | null = null
let _grainFrame = 0

function getOffscreen(w: number, h: number, dpr: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  if (!_offscreen || _offscreen.width !== w * dpr || _offscreen.height !== h * dpr) {
    _offscreen = document.createElement('canvas')
    _offscreen.width = w * dpr
    _offscreen.height = h * dpr
  }
  const ctx = _offscreen.getContext('2d')!
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, w, h)
  return [_offscreen, ctx]
}

function drawNeumorphNoise(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number,
  amplitude: number,
) {
  const cx = w / 2
  const cy = h / 2
  const maxR = Math.min(w, h) / 2 - 10
  const orbR = 38

  ctx.clearRect(0, 0, w, h)

  const level = amplitudeToLevel(amplitude)
  const tNorm = Math.max(0, Math.min(1, (amplitude - 0.2) / 3.8))

  // --- Background glow (subtle, neumorphic soft light) ---
  drawBackgroundGlow(ctx, cx, cy, Math.min(w, h), 0.2 + level * 0.06)

  // --- Neumorphic noise rings ---
  // Many layers: level controls density and intensity
  // Lv1: 8 rings (soft), Lv5: 28 rings (dense, energetic)
  const ringCount = Math.floor(8 + (level - 1) * 5)
  const segments = 64 // High segment count for smooth noise curves
  const baseHue = 268
  const baseSat = 55

  // Reuse cached offscreen canvas for screen blending (prevents darkening)
  const dpr = window.devicePixelRatio ?? 1
  const [offscreen, offCtx] = getOffscreen(w, h, dpr)

  // Neumorphic surface noise grain (cached, updates every 6 frames)
  _grainFrame++
  if (_grainFrame % 6 === 0 || !_grainCanvas) {
    if (!_grainCanvas || _grainCanvas.width !== w * dpr) {
      _grainCanvas = document.createElement('canvas')
      _grainCanvas.width = w * dpr
      _grainCanvas.height = h * dpr
    }
    const gCtx = _grainCanvas.getContext('2d')!
    gCtx.setTransform(dpr, 0, 0, dpr, 0, 0)
    gCtx.clearRect(0, 0, w, h)
    drawNoiseGrain(gCtx, w, h, time, 0.03 + level * 0.008)
  }
  offCtx.drawImage(_grainCanvas!, 0, 0, _grainCanvas!.width, _grainCanvas!.height, 0, 0, w, h)

  for (let i = 0; i < ringCount; i++) {
    const t = i / ringCount
    const baseR = orbR + 16 + t * (maxR - orbR - 28)

    // Rotation speed: clearly accelerates with level
    // Lv1: 0.18, Lv2: 0.32, Lv3: 0.50, Lv4: 0.72, Lv5: 0.98
    const rotSpeed = 0.08 + level * level * 0.035
    const rotation = time * rotSpeed + i * 0.12
    // Noise-based displacement per ring
    const noiseScale = 2.5 + i * 0.3
    const noiseSpeed = time * (0.2 + level * 0.08) + i * 1.7

    offCtx.save()
    offCtx.translate(cx, cy)
    offCtx.rotate(rotation)

    // === Light stroke (top highlight - neumorphic raised edge) ===
    drawNoiseRing(offCtx, baseR, segments, noiseScale, noiseSpeed, amplitude, level, {
      hue: baseHue + t * 20,
      sat: baseSat + t * 8 + level * 3,
      lightness: 78 + Math.min(level, 3) * 1.5,
      alpha: getAlpha(t, level, tNorm, 'light'),
      lineWidth: getLineWidth(t, level, 'light'),
      offsetY: -0.8, // shift up for highlight
    })

    // === Dark stroke (bottom shadow - neumorphic depth, kept purple not black) ===
    drawNoiseRing(offCtx, baseR, segments, noiseScale, noiseSpeed, amplitude, level, {
      hue: baseHue + t * 20 - 5,
      sat: baseSat + t * 6 + level * 3,
      lightness: 68 + level * 2,
      alpha: getAlpha(t, level, tNorm, 'shadow'),
      lineWidth: getLineWidth(t, level, 'shadow'),
      offsetY: 0.8, // shift down for shadow
    })

    // === Main ring (core waveform) ===
    drawNoiseRing(offCtx, baseR, segments, noiseScale, noiseSpeed, amplitude, level, {
      hue: baseHue + t * 25,
      sat: baseSat + t * 10 + level * 4,
      lightness: 72 + Math.min(level, 3) * 2,
      alpha: getAlpha(t, level, tNorm, 'main'),
      lineWidth: getLineWidth(t, level, 'main'),
      offsetY: 0,
      glow: true,
    })

    offCtx.restore()
  }

  // Composite offscreen with screen blend (no darkening!)
  ctx.save()
  ctx.globalCompositeOperation = 'screen'
  ctx.globalAlpha = 0.92
  ctx.drawImage(offscreen, 0, 0, offscreen.width, offscreen.height, 0, 0, w, h)
  ctx.restore()

  // --- Howahowa (Figma asset, strongly clamped to keep purple, avoid dark variants) ---
  const clampedHowaAmp = Math.min(amplitude, 1.8)
  drawHowahowa(ctx, cx, cy, Math.min(w, h), time, clampedHowaAmp)

  // --- Ring overlay ---
  drawRingOverlay(ctx, cx, cy, Math.min(w, h), time, 0.10)

  // --- Light sparkle animation ---
  drawLightAnimation(ctx, cx, cy, Math.min(w, h), time, amplitude)

  // --- Center unit (knob + bezel) ---
  drawCenterUnit(ctx, cx, cy, orbR, amplitude)
}

/** Draw a single noise-modulated ring */
function drawNoiseRing(
  ctx: CanvasRenderingContext2D,
  baseR: number,
  segments: number,
  noiseScale: number,
  noiseTime: number,
  amplitude: number,
  level: number,
  style: {
    hue: number
    sat: number
    lightness: number
    alpha: number
    lineWidth: number
    offsetY: number
    glow?: boolean
  },
) {
  ctx.beginPath()

  for (let s = 0; s <= segments; s++) {
    const angle = (s / segments) * Math.PI * 2
    const nx = Math.cos(angle) * noiseScale
    const ny = Math.sin(angle) * noiseScale

    // Multi-octave noise displacement
    const noiseVal = fbmNoise(nx + noiseTime * 0.1, ny + noiseTime * 0.08, 3)
    // Amplitude scales the noise displacement (clamped to prevent ring crossing at high levels)
    const clampedAmp = Math.min(amplitude, 2.5)
    const displacement = noiseVal * (3 + clampedAmp * 3) * (0.6 + level * 0.08)

    const r = baseR + displacement
    const x = r * Math.cos(angle)
    const y = r * Math.sin(angle) + style.offsetY

    if (s === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }

  ctx.closePath()

  // Glow for main rings (subdued at Lv4-5 to prevent white-out)
  if (style.glow && level >= 2) {
    const glowAlpha = level >= 4 ? style.alpha * 0.2 : style.alpha * 0.35
    ctx.shadowColor = `hsla(${style.hue}, ${style.sat}%, ${Math.min(style.lightness + 3, 82)}%, ${glowAlpha})`
    ctx.shadowBlur = 3 + Math.min(level, 3) * 1.2
  }

  ctx.strokeStyle = `hsla(${style.hue}, ${style.sat}%, ${style.lightness}%, ${style.alpha})`
  ctx.lineWidth = style.lineWidth
  ctx.stroke()
  ctx.shadowBlur = 0
}

/** Compute alpha based on ring position, level, and stroke type */
function getAlpha(t: number, level: number, _tNorm: number, type: 'main' | 'light' | 'shadow'): number {
  // Outer rings are more transparent
  const baseFade = 1 - t * 0.4
  // Level visibility: starts subtle, builds with level
  // Lv4-5: cap visibility to prevent white-out from too many bright rings
  const levelVis = 0.2 + (level - 1) * (level >= 4 ? 0.10 : 0.15)

  switch (type) {
    case 'main':
      return Math.min(0.42, baseFade * levelVis * 0.55)
    case 'light':
      return Math.min(0.28, baseFade * levelVis * 0.35)
    case 'shadow':
      return Math.min(0.20, baseFade * levelVis * 0.25)
  }
}

/** Compute line width based on ring position, level, and stroke type */
function getLineWidth(t: number, level: number, type: 'main' | 'light' | 'shadow'): number {
  const baseWidth = 1 - t * 0.5 // inner rings thicker
  const levelScale = 0.5 + (level - 1) * 0.12 // Lv1: 0.5, Lv5: 0.98

  switch (type) {
    case 'main':
      return (0.8 + baseWidth * 1.0) * levelScale
    case 'light':
      return (0.5 + baseWidth * 0.6) * levelScale
    case 'shadow':
      return (0.5 + baseWidth * 0.6) * levelScale
  }
}

/** Subtle noise grain texture for neumorphic surface feel — purple-tinted, no dark pixels */
function drawNoiseGrain(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number,
  alpha: number,
) {
  const step = 8
  const cx = w / 2
  const cy = h / 2
  const maxDist = Math.min(w, h) / 2

  ctx.save()
  ctx.globalAlpha = alpha

  for (let x = 0; x < w; x += step) {
    for (let y = 0; y < h; y += step) {
      const dx = x - cx
      const dy = y - cy
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist > maxDist) continue

      const n = noise2D(x * 0.05 + time * 0.5, y * 0.05 + time * 0.3)
      const radialFade = 1 - (dist / maxDist)
      // Purple-tinted grain: high lightness range (180-220) to avoid dark pixels
      const r = 180 + n * 20
      const g = 170 + n * 15
      const b = 210 + n * 20

      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${radialFade * 0.4})`
      ctx.fillRect(x, y, step, step)
    }
  }

  ctx.restore()
}

export function Design10_NeumorphNoise() {
  return (
    <DesignBase
      number="10"
      title="Neumorph Noise"
      subtitle="ニューモフィズムのノイズ波形"
      description="実装: FBMノイズで有機的な波形変調。3層ストローク（ハイライト/シャドウ/メイン）でニューモフィズムの凸凹感。Screen合成で黒ずみ防止。&#10;傾向: Lv1は穏やかな8リング、Lv5は28リングの密度ある波動。レベルが上がるほど波形が増え明るさを維持。"
    >
      {({ amplitude, containerSize }) => (
        <NeumorphNoiseCanvas amplitude={amplitude} size={containerSize} />
      )}
    </DesignBase>
  )
}

function NeumorphNoiseCanvas({ amplitude, size }: { amplitude: number; size: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const startRef = useRef(Date.now())

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio ?? 1
    canvas.width = size * dpr
    canvas.height = size * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    let rafId: number
    const tick = () => {
      const time = (Date.now() - startRef.current) / 1000
      drawNeumorphNoise(ctx, size, size, time, amplitude)
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [amplitude, size])

  return (
    <canvas
      ref={canvasRef}
      style={{ width: size, height: size, display: 'block' }}
    />
  )
}
