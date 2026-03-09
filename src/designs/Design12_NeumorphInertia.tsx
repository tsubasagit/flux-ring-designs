import { useRef, useEffect, useCallback, useState, type ReactNode } from 'react'
import { drawCenterUnit, drawBackgroundGlow, drawRingOverlay, drawHowahowa, drawLightAnimation, amplitudeToLevel } from './drawHelpers'

/**
 * Design 12: Neumorph Noise — 慣性つき
 *
 * Design 10 ベースのニューモフィズム・ノイズ波形に以下を追加:
 *
 * ■ 対数スケール:
 *   rawDelta → sign(d) * ln(1 + |d| * K) / ln(2)
 *   回す速度2倍 → 出力は約1.5倍（ゆるやかなカーブ）
 *
 * ■ スムースリミッター:
 *   maxSpeed * tanh(speed / maxSpeed)
 *   リミッターに到達してもカクつかず滑らかに接続
 *
 * ■ 慣性:
 *   指を離しても velocity が減衰しながらしばらく回り続ける
 */

/* ---- 数学ユーティリティ ---- */

function clamp(v: number, min: number, max: number) {
  return Math.min(Math.max(v, min), max)
}

function logScale(raw: number, K: number = 8): number {
  const sign = raw >= 0 ? 1 : -1
  return sign * Math.log(1 + Math.abs(raw) * K) / Math.LN2
}

function smoothLimit(value: number, max: number): number {
  return max * Math.tanh(value / max)
}

/* ---- ノイズ関数 ---- */

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

/* ---- 慣性コントローラ ---- */

function InertiaBase({
  children,
}: {
  children: (params: { amplitude: number; containerSize: number }) => ReactNode
}) {
  const containerSize = 420
  const [amplitude, setAmplitude] = useState(1.0)
  const lastAngleRef = useRef(0)
  const isDragging = useRef(false)
  const velocityRef = useRef(0)
  const rafRef = useRef<number>(0)

  const LOG_K = 8
  const MAX_SPEED = 0.35
  const FRICTION = 0.975  // 大げさな慣性: 長く滑らかに滑り続ける

  useEffect(() => {
    let running = true
    const tick = () => {
      if (!running) return
      if (!isDragging.current && Math.abs(velocityRef.current) > 0.0001) {
        velocityRef.current *= FRICTION
        setAmplitude(a => clamp(a - velocityRef.current, 0.2, 4))
      } else if (!isDragging.current) {
        velocityRef.current = 0
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { running = false; cancelAnimationFrame(rafRef.current) }
  }, [])

  const applyDelta = useCallback((rawDelta: number) => {
    const logged = logScale(rawDelta, LOG_K)
    const limited = smoothLimit(logged, MAX_SPEED)
    velocityRef.current = limited
    setAmplitude(a => clamp(a - limited, 0.2, 4))
  }, [])

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    const target = e.currentTarget
    const rect = target.getBoundingClientRect()
    lastAngleRef.current = Math.atan2(
      e.clientY - (rect.top + rect.height / 2),
      e.clientX - (rect.left + rect.width / 2)
    )
    isDragging.current = true
    velocityRef.current = 0
    ;(target as HTMLElement).setPointerCapture(e.pointerId)
  }, [])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return
    const target = e.currentTarget
    const rect = target.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const angle = Math.atan2(e.clientY - cy, e.clientX - cx)
    let delta = angle - lastAngleRef.current
    if (delta > Math.PI) delta -= 2 * Math.PI
    if (delta < -Math.PI) delta += 2 * Math.PI
    lastAngleRef.current = angle
    applyDelta(delta)
  }, [applyDelta])

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    isDragging.current = false
    ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
  }, [])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    applyDelta(e.deltaY * 0.005)
  }, [applyDelta])

  const level = amplitudeToLevel(amplitude)
  const levelStr = String(level).padStart(2, '0')

  return (
    <div className="design-card">
      <div className="design-header">
        <span className="design-number">12</span>
        <div>
          <h2 className="design-title">Neumorph Inertia</h2>
          <p className="design-subtitle">慣性つきニューモフィズム・ノイズ波形</p>
        </div>
        <span style={{
          marginLeft: 'auto',
          fontSize: 12,
          fontWeight: 600,
          color: '#a896d0',
          background: 'rgba(200,185,235,0.18)',
          padding: '3px 10px',
          borderRadius: 12,
          letterSpacing: 0.5,
        }}>Lv.{levelStr}</span>
      </div>
      <div
        className="design-canvas-area"
        style={{ width: containerSize, height: containerSize }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={handleWheel}
      >
        {children({ amplitude, containerSize })}
      </div>
      <div className="design-controls">
        <label className="design-slider-label">
          Wave Intensity
          <input
            type="range"
            min={0.2}
            max={4}
            step={0.05}
            value={amplitude}
            onChange={(e) => setAmplitude(Number(e.target.value))}
          />
        </label>
        <span className="design-amplitude-value">{amplitude.toFixed(1)}</span>
      </div>
      <div className="design-description">
        {'操作: 対数スケール（速度2倍→出力1.5倍）＋ tanh リミッター（暴走防止）＋ 慣性（離しても滑る）\nドラッグ → 離すと慣性で滑らかに減速。スライダーでも直接レベル調整可。'}
      </div>
    </div>
  )
}

/* ---- 描画 ---- */

let _offscreen12: HTMLCanvasElement | null = null
let _grainCanvas12: HTMLCanvasElement | null = null
let _grainFrame12 = 0

function getOffscreen(w: number, h: number, dpr: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  if (!_offscreen12 || _offscreen12.width !== w * dpr || _offscreen12.height !== h * dpr) {
    _offscreen12 = document.createElement('canvas')
    _offscreen12.width = w * dpr
    _offscreen12.height = h * dpr
  }
  const ctx = _offscreen12.getContext('2d')!
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, w, h)
  return [_offscreen12, ctx]
}

function drawNoiseGrain(
  ctx: CanvasRenderingContext2D,
  w: number, h: number,
  time: number, alpha: number,
) {
  const step = 8
  const cx = w / 2, cy = h / 2
  const maxDist = Math.min(w, h) / 2
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

function drawNoiseRing(
  ctx: CanvasRenderingContext2D,
  baseR: number, segments: number,
  noiseScale: number, noiseTime: number,
  amplitude: number, level: number,
  style: { hue: number; sat: number; lightness: number; alpha: number; lineWidth: number; offsetY: number; glow?: boolean },
) {
  ctx.beginPath()
  for (let s = 0; s <= segments; s++) {
    const angle = (s / segments) * Math.PI * 2
    const nx = Math.cos(angle) * noiseScale
    const ny = Math.sin(angle) * noiseScale
    const noiseVal = fbmNoise(nx + noiseTime * 0.1, ny + noiseTime * 0.08, 3)
    const clampedAmp = Math.min(amplitude, 2.5)
    const displacement = noiseVal * (3 + clampedAmp * 3) * (0.6 + level * 0.08)
    const r = baseR + displacement
    const x = r * Math.cos(angle)
    const y = r * Math.sin(angle) + style.offsetY
    if (s === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y)
  }
  ctx.closePath()
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

function getAlpha(t: number, level: number, type: 'main' | 'light' | 'shadow'): number {
  const baseFade = 1 - t * 0.4
  const levelVis = 0.2 + (level - 1) * (level >= 4 ? 0.10 : 0.15)
  switch (type) {
    case 'main': return Math.min(0.42, baseFade * levelVis * 0.55)
    case 'light': return Math.min(0.28, baseFade * levelVis * 0.35)
    case 'shadow': return Math.min(0.20, baseFade * levelVis * 0.25)
  }
}

function getLineWidth(t: number, level: number, type: 'main' | 'light' | 'shadow'): number {
  const baseWidth = 1 - t * 0.5
  const levelScale = 0.5 + (level - 1) * 0.12
  switch (type) {
    case 'main': return (0.8 + baseWidth * 1.0) * levelScale
    case 'light': return (0.5 + baseWidth * 0.6) * levelScale
    case 'shadow': return (0.5 + baseWidth * 0.6) * levelScale
  }
}

function drawScene(
  ctx: CanvasRenderingContext2D,
  w: number, h: number,
  time: number, amplitude: number,
) {
  const cx = w / 2, cy = h / 2
  const maxR = Math.min(w, h) / 2 - 10
  const orbR = 38

  ctx.clearRect(0, 0, w, h)

  const level = amplitudeToLevel(amplitude)

  drawBackgroundGlow(ctx, cx, cy, Math.min(w, h), 0.2 + level * 0.06)

  const ringCount = Math.floor(8 + (level - 1) * 5)
  const segments = 64
  const baseHue = 268
  const baseSat = 55

  const dpr = window.devicePixelRatio ?? 1
  const [offscreen, offCtx] = getOffscreen(w, h, dpr)

  _grainFrame12++
  if (_grainFrame12 % 6 === 0 || !_grainCanvas12) {
    if (!_grainCanvas12 || _grainCanvas12.width !== w * dpr) {
      _grainCanvas12 = document.createElement('canvas')
      _grainCanvas12.width = w * dpr
      _grainCanvas12.height = h * dpr
    }
    const gCtx = _grainCanvas12.getContext('2d')!
    gCtx.setTransform(dpr, 0, 0, dpr, 0, 0)
    gCtx.clearRect(0, 0, w, h)
    drawNoiseGrain(gCtx, w, h, time, 0.03 + level * 0.008)
  }
  offCtx.drawImage(_grainCanvas12!, 0, 0, _grainCanvas12!.width, _grainCanvas12!.height, 0, 0, w, h)

  for (let i = 0; i < ringCount; i++) {
    const t = i / ringCount
    const baseR = orbR + 16 + t * (maxR - orbR - 28)
    const rotSpeed = 0.08 + level * level * 0.035
    const rotation = time * rotSpeed + i * 0.12
    const noiseScale = 2.5 + i * 0.3
    const noiseSpeed = time * (0.2 + level * 0.08) + i * 1.7

    offCtx.save()
    offCtx.translate(cx, cy)
    offCtx.rotate(rotation)

    drawNoiseRing(offCtx, baseR, segments, noiseScale, noiseSpeed, amplitude, level, {
      hue: baseHue + t * 20, sat: baseSat + t * 8 + level * 3,
      lightness: 78 + Math.min(level, 3) * 1.5,
      alpha: getAlpha(t, level, 'light'),
      lineWidth: getLineWidth(t, level, 'light'), offsetY: -0.8,
    })
    drawNoiseRing(offCtx, baseR, segments, noiseScale, noiseSpeed, amplitude, level, {
      hue: baseHue + t * 20 - 5, sat: baseSat + t * 6 + level * 3,
      lightness: 68 + level * 2,
      alpha: getAlpha(t, level, 'shadow'),
      lineWidth: getLineWidth(t, level, 'shadow'), offsetY: 0.8,
    })
    drawNoiseRing(offCtx, baseR, segments, noiseScale, noiseSpeed, amplitude, level, {
      hue: baseHue + t * 25, sat: baseSat + t * 10 + level * 4,
      lightness: 72 + Math.min(level, 3) * 2,
      alpha: getAlpha(t, level, 'main'),
      lineWidth: getLineWidth(t, level, 'main'), offsetY: 0, glow: true,
    })

    offCtx.restore()
  }

  ctx.save()
  ctx.globalCompositeOperation = 'screen'
  ctx.globalAlpha = 0.92
  ctx.drawImage(offscreen, 0, 0, offscreen.width, offscreen.height, 0, 0, w, h)
  ctx.restore()

  const clampedHowaAmp = Math.min(amplitude, 1.8)
  drawHowahowa(ctx, cx, cy, Math.min(w, h), time, clampedHowaAmp)
  drawRingOverlay(ctx, cx, cy, Math.min(w, h), time, 0.10)
  drawLightAnimation(ctx, cx, cy, Math.min(w, h), time, amplitude)
  drawCenterUnit(ctx, cx, cy, orbR, amplitude)
}

/* ---- Canvas ---- */

function NNCanvas({ amplitude, size }: { amplitude: number; size: number }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const t0 = useRef(Date.now())

  useEffect(() => {
    const c = ref.current; if (!c) return
    const ctx = c.getContext('2d'); if (!ctx) return
    const dpr = window.devicePixelRatio ?? 1
    c.width = size * dpr; c.height = size * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    let id: number
    const tick = () => {
      drawScene(ctx, size, size, (Date.now() - t0.current) / 1000, amplitude)
      id = requestAnimationFrame(tick)
    }
    id = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(id)
  }, [amplitude, size])

  return <canvas ref={ref} style={{ width: size, height: size, display: 'block' }} />
}

/* ---- エクスポート ---- */

export function Design12_NeumorphInertia() {
  return (
    <InertiaBase>
      {({ amplitude, containerSize }) => (
        <NNCanvas amplitude={amplitude} size={containerSize} />
      )}
    </InertiaBase>
  )
}
