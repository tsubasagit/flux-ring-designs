import { useRef, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { preloadAssets } from './assetLoader'
import {
  drawCenterUnit,
  drawBackgroundGlow,
  drawRingOverlay,
  drawHowahowa,
  drawLightAnimation,
} from './drawHelpers'
import './DesignLab.css'

// ─── Noise helpers (same as Design10) ───

function noise2D(x: number, y: number): number {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453
  return (n - Math.floor(n)) * 2 - 1
}

function smoothNoise(x: number, y: number): number {
  const ix = Math.floor(x)
  const iy = Math.floor(y)
  const fx = x - ix
  const fy = y - iy
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
  let value = 0, amp = 1, freq = 1, maxAmp = 0
  for (let i = 0; i < octaves; i++) {
    value += smoothNoise(x * freq, y * freq) * amp
    maxAmp += amp
    amp *= 0.5
    freq *= 2.0
  }
  return value / maxAmp
}

// ─── Configurable parameters ───

export interface LabParams {
  // Ring
  ringCount: number
  baseHue: number
  baseSat: number
  baseLightness: number
  noiseScale: number
  rotSpeed: number
  lineWidthScale: number
  ringAlpha: number
  // Neumorphism
  neumorphDepth: number
  // Wave
  amplitude: number
  // Layers toggle
  showGrain: boolean
  showBackgroundGlow: boolean
  showHowahowa: boolean
  showRingOverlay: boolean
  showLightAnim: boolean
  showCenterUnit: boolean
}

const DEFAULTS: LabParams = {
  ringCount: 18,
  baseHue: 268,
  baseSat: 55,
  baseLightness: 72,
  noiseScale: 2.5,
  rotSpeed: 0.5,
  lineWidthScale: 1.0,
  ringAlpha: 0.35,
  neumorphDepth: 0.8,
  amplitude: 1.5,
  showGrain: true,
  showBackgroundGlow: true,
  showHowahowa: true,
  showRingOverlay: true,
  showLightAnim: true,
  showCenterUnit: true,
}

// ─── Drawing ───

let _labOffscreen: HTMLCanvasElement | null = null
let _labGrain: HTMLCanvasElement | null = null
let _labGrainFrame = 0

function getLabOffscreen(w: number, h: number, dpr: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  if (!_labOffscreen || _labOffscreen.width !== w * dpr || _labOffscreen.height !== h * dpr) {
    _labOffscreen = document.createElement('canvas')
    _labOffscreen.width = w * dpr
    _labOffscreen.height = h * dpr
  }
  const ctx = _labOffscreen.getContext('2d')!
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, w, h)
  return [_labOffscreen, ctx]
}

function drawLabGrain(ctx: CanvasRenderingContext2D, w: number, h: number, time: number, alpha: number) {
  const step = 8, cx = w / 2, cy = h / 2, maxDist = Math.min(w, h) / 2
  ctx.save()
  ctx.globalAlpha = alpha
  for (let x = 0; x < w; x += step) {
    for (let y = 0; y < h; y += step) {
      const dx = x - cx, dy = y - cy
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist > maxDist) continue
      const n = noise2D(x * 0.05 + time * 0.5, y * 0.05 + time * 0.3)
      const radialFade = 1 - (dist / maxDist)
      ctx.fillStyle = `rgba(${180 + n * 20}, ${170 + n * 15}, ${210 + n * 20}, ${radialFade * 0.4})`
      ctx.fillRect(x, y, step, step)
    }
  }
  ctx.restore()
}

function drawLab(
  ctx: CanvasRenderingContext2D,
  w: number, h: number,
  time: number,
  p: LabParams,
) {
  const cx = w / 2, cy = h / 2
  const maxR = Math.min(w, h) / 2 - 10
  const orbR = 38
  ctx.clearRect(0, 0, w, h)

  // Background glow
  if (p.showBackgroundGlow) {
    drawBackgroundGlow(ctx, cx, cy, Math.min(w, h), 0.25)
  }

  // Offscreen for rings (screen composite)
  const dpr = window.devicePixelRatio ?? 1
  const [offscreen, offCtx] = getLabOffscreen(w, h, dpr)

  // Grain
  if (p.showGrain) {
    _labGrainFrame++
    if (_labGrainFrame % 6 === 0 || !_labGrain) {
      if (!_labGrain || _labGrain.width !== w * dpr) {
        _labGrain = document.createElement('canvas')
        _labGrain.width = w * dpr
        _labGrain.height = h * dpr
      }
      const gCtx = _labGrain.getContext('2d')!
      gCtx.setTransform(dpr, 0, 0, dpr, 0, 0)
      gCtx.clearRect(0, 0, w, h)
      drawLabGrain(gCtx, w, h, time, 0.04)
    }
    offCtx.drawImage(_labGrain!, 0, 0, _labGrain!.width, _labGrain!.height, 0, 0, w, h)
  }

  // Rings
  const segments = 64
  for (let i = 0; i < p.ringCount; i++) {
    const t = i / p.ringCount
    const baseR = orbR + 16 + t * (maxR - orbR - 28)
    const rotation = time * p.rotSpeed + i * 0.12
    const ns = p.noiseScale + i * 0.3
    const noiseTime = time * 0.3 + i * 1.7

    offCtx.save()
    offCtx.translate(cx, cy)
    offCtx.rotate(rotation)

    // Highlight
    drawLabRing(offCtx, baseR, segments, ns, noiseTime, p, {
      hueShift: t * 20,
      lightnessBonus: 6,
      alpha: p.ringAlpha * 0.65,
      lwScale: 0.7,
      offsetY: -p.neumorphDepth,
    })
    // Shadow
    drawLabRing(offCtx, baseR, segments, ns, noiseTime, p, {
      hueShift: t * 20 - 5,
      lightnessBonus: -4,
      alpha: p.ringAlpha * 0.5,
      lwScale: 0.7,
      offsetY: p.neumorphDepth,
    })
    // Main
    drawLabRing(offCtx, baseR, segments, ns, noiseTime, p, {
      hueShift: t * 25,
      lightnessBonus: 0,
      alpha: p.ringAlpha,
      lwScale: 1.0,
      offsetY: 0,
      glow: true,
    })
    offCtx.restore()
  }

  // Composite
  ctx.save()
  ctx.globalCompositeOperation = 'screen'
  ctx.globalAlpha = 0.92
  ctx.drawImage(offscreen, 0, 0, offscreen.width, offscreen.height, 0, 0, w, h)
  ctx.restore()

  // Howahowa
  if (p.showHowahowa) {
    drawHowahowa(ctx, cx, cy, Math.min(w, h), time, Math.min(p.amplitude, 1.8))
  }
  // Ring overlay
  if (p.showRingOverlay) {
    drawRingOverlay(ctx, cx, cy, Math.min(w, h), time, 0.10)
  }
  // Light animation
  if (p.showLightAnim) {
    drawLightAnimation(ctx, cx, cy, Math.min(w, h), time, p.amplitude)
  }
  // Center unit
  if (p.showCenterUnit) {
    drawCenterUnit(ctx, cx, cy, orbR, p.amplitude)
  }
}

function drawLabRing(
  ctx: CanvasRenderingContext2D,
  baseR: number,
  segments: number,
  noiseScale: number,
  noiseTime: number,
  p: LabParams,
  s: { hueShift: number; lightnessBonus: number; alpha: number; lwScale: number; offsetY: number; glow?: boolean },
) {
  ctx.beginPath()
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2
    const nx = Math.cos(angle) * noiseScale
    const ny = Math.sin(angle) * noiseScale
    const noiseVal = fbmNoise(nx + noiseTime * 0.1, ny + noiseTime * 0.08, 3)
    const displacement = noiseVal * (3 + Math.min(p.amplitude, 2.5) * 3) * 0.75
    const r = baseR + displacement
    const x = r * Math.cos(angle)
    const y = r * Math.sin(angle) + s.offsetY
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.closePath()

  const hue = p.baseHue + s.hueShift
  const light = p.baseLightness + s.lightnessBonus

  if (s.glow) {
    ctx.shadowColor = `hsla(${hue}, ${p.baseSat}%, ${Math.min(light + 3, 85)}%, ${s.alpha * 0.3})`
    ctx.shadowBlur = 4
  }

  ctx.strokeStyle = `hsla(${hue}, ${p.baseSat}%, ${light}%, ${s.alpha})`
  ctx.lineWidth = p.lineWidthScale * s.lwScale
  ctx.stroke()
  ctx.shadowBlur = 0
}

// ─── Slider definition ───

interface SliderDef {
  key: keyof LabParams
  label: string
  desc: string
  min: number
  max: number
  step: number
  codeRef: string
}

const SLIDERS: SliderDef[] = [
  { key: 'ringCount', label: 'リング本数', desc: 'リングの数。増やすほど密度UP', min: 2, max: 40, step: 1, codeRef: 'ringCount = 8 + (level-1) * 5' },
  { key: 'baseHue', label: '色相 (Hue)', desc: '0=赤, 120=緑, 268=紫, 360=赤', min: 0, max: 360, step: 1, codeRef: 'baseHue = 268' },
  { key: 'baseSat', label: '彩度', desc: '高いほど鮮やか、低いとモノクロに', min: 0, max: 100, step: 1, codeRef: 'baseSat = 55' },
  { key: 'baseLightness', label: '明度', desc: '高いと明るく、低いと暗い', min: 40, max: 95, step: 1, codeRef: 'lightness: 72' },
  { key: 'noiseScale', label: '波形の粗さ', desc: '大きいとギザギザ、小さいと滑らか', min: 0.5, max: 8, step: 0.1, codeRef: 'noiseScale = 2.5' },
  { key: 'rotSpeed', label: '回転速度', desc: 'リングの回転スピード', min: 0, max: 2, step: 0.02, codeRef: 'rotSpeed = 0.08 + level²×0.035' },
  { key: 'lineWidthScale', label: '線の太さ', desc: 'リングの線幅', min: 0.2, max: 4, step: 0.1, codeRef: 'lineWidth = (0.8+base) × scale' },
  { key: 'ringAlpha', label: 'リング透明度', desc: '低いと透け、高いとくっきり', min: 0.05, max: 0.7, step: 0.01, codeRef: 'alpha = baseFade × levelVis' },
  { key: 'neumorphDepth', label: 'ニューモフィズム深さ', desc: 'ハイライト/シャドウのズレ幅 → 立体感', min: 0, max: 5, step: 0.1, codeRef: 'offsetY = ±0.8' },
  { key: 'amplitude', label: '振幅 (波の強さ)', desc: '波形の揺れ幅。つまみ操作に相当', min: 0.2, max: 4, step: 0.05, codeRef: 'amplitude (slider/knob)' },
]

interface ToggleDef {
  key: keyof LabParams
  label: string
  desc: string
  isImage: boolean
}

const TOGGLES: ToggleDef[] = [
  { key: 'showGrain', label: 'ノイズグレイン', desc: '表面のざらつき質感', isImage: false },
  { key: 'showBackgroundGlow', label: '背景グロー', desc: 'sphere.png — 紫の光球', isImage: true },
  { key: 'showHowahowa', label: 'ほわほわ', desc: 'howahowa.png — ぼかしグロー', isImage: true },
  { key: 'showRingOverlay', label: 'リングオーバーレイ', desc: 'ring-overlay.png — 光沢', isImage: true },
  { key: 'showLightAnim', label: '光のアニメーション', desc: 'light-anim.png — キラキラ', isImage: true },
  { key: 'showCenterUnit', label: '中央ユニット', desc: 'knob.png + ring-bezel.png', isImage: true },
]

// ─── Component ───

export default function DesignLab() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const startRef = useRef(Date.now())
  const paramsRef = useRef<LabParams>({ ...DEFAULTS })
  const [params, setParams] = useState<LabParams>({ ...DEFAULTS })

  useEffect(() => { preloadAssets() }, [])
  paramsRef.current = params

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const size = 420
    const dpr = window.devicePixelRatio ?? 1
    canvas.width = size * dpr
    canvas.height = size * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    let rafId: number
    const tick = () => {
      const time = (Date.now() - startRef.current) / 1000
      drawLab(ctx, size, size, time, paramsRef.current)
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [])

  const updateParam = (key: keyof LabParams, value: number | boolean) => {
    setParams((prev) => ({ ...prev, [key]: value }))
  }

  const resetAll = () => setParams({ ...DEFAULTS })

  return (
    <div className="lab">
      {/* Header */}
      <div className="lab-header">
        <Link to="/playground" className="lab-back">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Playground
        </Link>
        <h1 className="lab-title">Design Lab</h1>
        <p className="lab-subtitle">Design 10: Neumorph Noise — パラメータを変えて仕組みを理解しよう</p>
      </div>

      <div className="lab-main">
        {/* Canvas */}
        <div className="lab-preview">
          <div className="lab-canvas-wrap">
            <canvas ref={canvasRef} style={{ width: 420, height: 420, display: 'block' }} />
          </div>
        </div>

        {/* Controls */}
        <div className="lab-controls">
          {/* Sliders */}
          <div className="lab-section">
            <div className="lab-section-header">
              <h2>パラメータ調整</h2>
              <button className="lab-reset" onClick={resetAll}>リセット</button>
            </div>

            {SLIDERS.map((s) => (
              <div className="lab-slider" key={s.key}>
                <div className="lab-slider-head">
                  <span className="lab-slider-label">{s.label}</span>
                  <span className="lab-slider-value">{(params[s.key] as number).toFixed(s.step < 1 ? (s.step < 0.1 ? 2 : 1) : 0)}</span>
                </div>
                <p className="lab-slider-desc">{s.desc}</p>
                <input
                  type="range"
                  min={s.min}
                  max={s.max}
                  step={s.step}
                  value={params[s.key] as number}
                  onChange={(e) => updateParam(s.key, Number(e.target.value))}
                />
                <code className="lab-slider-code">{s.codeRef}</code>
              </div>
            ))}
          </div>

          {/* Layer toggles */}
          <div className="lab-section">
            <h2>レイヤー ON / OFF</h2>
            <p className="lab-section-desc">各レイヤーを切り替えて、どの要素が何の役割か確認できます</p>

            {TOGGLES.map((t) => (
              <label className="lab-toggle" key={t.key}>
                <input
                  type="checkbox"
                  checked={params[t.key] as boolean}
                  onChange={(e) => updateParam(t.key, e.target.checked)}
                />
                <span className="lab-toggle-switch" />
                <div className="lab-toggle-info">
                  <span className="lab-toggle-label">
                    {t.label}
                    <span className={`lab-toggle-badge ${t.isImage ? 'lab-badge-image' : 'lab-badge-code'}`}>
                      {t.isImage ? 'Image' : 'Code'}
                    </span>
                  </span>
                  <span className="lab-toggle-desc">{t.desc}</span>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
