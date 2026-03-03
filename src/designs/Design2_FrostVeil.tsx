import { useRef, useEffect } from 'react'
import { DesignBase } from './DesignBase'
import { drawCenterUnit, drawBackgroundGlow, drawRingOverlay, drawRingLevel, drawHowahowa } from './drawHelpers'

/**
 * Design 2: Frost Veil
 * 霜のヴェールが幾重にも重なる。超薄い線が密に重なり、
 * リングが「呼吸」するようにopacityと半径が緩やかに脈動する。
 */

function drawFrostVeil(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number,
  amplitude: number
) {
  const cx = w / 2
  const cy = h / 2
  const maxR = Math.min(w, h) / 2 - 10
  const orbR = 30 + amplitude * 8

  ctx.clearRect(0, 0, w, h)

  // 背景グロー
  drawBackgroundGlow(ctx, cx, cy, Math.min(w, h), 0.2)

  const ringCount = Math.floor(8 + amplitude * 8)

  for (let i = 0; i < ringCount; i++) {
    const t = i / ringCount
    const breathPhase = Math.sin(time * 0.8 + i * 0.4)
    const breathRadius = breathPhase * amplitude * 3
    const breathAlpha = 0.5 + breathPhase * 0.3

    const baseR = orbR + 10 + t * (maxR - orbR - 20) + breathRadius
    const rotation = time * 0.15

    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(rotation + i * 0.02)

    ctx.beginPath()
    const points = 120
    for (let p = 0; p <= points; p++) {
      const angle = (p / points) * Math.PI * 2
      const wobble =
        Math.sin(angle * 2 + time * 0.6 + i * 0.5) * amplitude * 3 +
        Math.sin(angle * 3 + time * 0.4 + i * 0.8) * amplitude * 2
      const r = baseR + wobble
      const x = r * Math.cos(angle)
      const y = r * Math.sin(angle)
      if (p === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.closePath()

    const alpha = (0.04 + (1 - t) * 0.1) * breathAlpha
    const hue = 268 + t * 20
    const sat = 45 + t * 10
    const light = 80 + (1 - t) * 10

    // Frost halo on outermost 2 rings
    if (i >= ringCount - 2) {
      ctx.shadowColor = `hsla(${hue}, ${sat}%, ${light}%, 0.3)`
      ctx.shadowBlur = 8
    }

    ctx.strokeStyle = `hsla(${hue}, ${sat}%, ${light}%, ${alpha})`
    ctx.lineWidth = 0.5 + (1 - t) * 1.0
    ctx.stroke()

    ctx.shadowBlur = 0
    ctx.restore()
  }

  // ほわほわエフェクト
  drawHowahowa(ctx, cx, cy, Math.min(w, h), time, amplitude)

  // リングオーバーレイ
  drawRingOverlay(ctx, cx, cy, Math.min(w, h), time, 0.1)
  drawRingLevel(ctx, cx, cy, Math.min(w, h), time, amplitude, 0.2)

  // 中心ユニット（紫グロー + ベゼル + つまみ）
  drawCenterUnit(ctx, cx, cy, orbR, amplitude)
}

export function Design2_FrostVeil() {
  return (
    <DesignBase number="02" title="Frost Veil" subtitle="霜のヴェールが幾重にも呼吸する" description="実装: sin(time)で各リングのopacityと半径を脈動させる呼吸効果。線幅0.5〜1.5pxの超薄い線を密に重ねる。&#10;傾向: 全リング同方向にゆっくり回転。霜のような白っぽい色調で、層が増えると密度が上がり霧のような質感に。">
      {({ amplitude, containerSize }) => (
        <FrostVeilCanvas amplitude={amplitude} size={containerSize} />
      )}
    </DesignBase>
  )
}

function FrostVeilCanvas({ amplitude, size }: { amplitude: number; size: number }) {
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
      drawFrostVeil(ctx, size, size, time, amplitude)
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
