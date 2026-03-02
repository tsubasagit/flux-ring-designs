import { useRef, useEffect } from 'react'
import { DesignBase } from './DesignBase'
import { drawCenterUnit, drawBackgroundGlow, drawRingOverlay, drawRingLevel } from './drawHelpers'

/**
 * Design 1: Silk Orbit
 * 絹のような薄い同心円リングが異なる速度で時計回りに回転。
 * ドラッグで層が増え、リングが広がる。
 */

function drawSilkOrbit(
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

  // 背景グロー（Figmaアセット）
  drawBackgroundGlow(ctx, cx, cy, Math.min(w, h), 0.2)

  // 層数: amplitudeに応じて増加
  const ringCount = Math.floor(4 + amplitude * 5)
  const outerRingCount = Math.floor(2 + amplitude * 3)

  // 外側の薄い放射状リング
  for (let i = 0; i < outerRingCount; i++) {
    const t = i / outerRingCount
    const baseR = orbR + 40 + t * (maxR - orbR - 40)
    const speed = 0.3 + t * 0.2
    const rotation = time * speed * (i % 2 === 0 ? 1 : -0.7)

    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(rotation)

    ctx.beginPath()
    const points = 120
    for (let p = 0; p <= points; p++) {
      const angle = (p / points) * Math.PI * 2
      const wobble =
        Math.sin(angle * 3 + time * 0.8 + i * 1.5) * amplitude * 6 +
        Math.sin(angle * 5 + time * 0.5 + i * 2.3) * amplitude * 3 +
        Math.sin(angle * 7 + time * 1.2 + i) * amplitude * 2
      const r = baseR + wobble
      const x = r * Math.cos(angle)
      const y = r * Math.sin(angle)
      if (p === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.closePath()

    const alpha = 0.03 + (1 - t) * 0.08
    const hue = 270 + i * 15
    ctx.strokeStyle = `hsla(${hue}, 60%, 78%, ${alpha * 2})`
    ctx.lineWidth = 1.5 + amplitude * 0.3
    ctx.stroke()
    ctx.fillStyle = `hsla(${hue}, 65%, 85%, ${alpha})`
    ctx.fill()

    ctx.restore()
  }

  // 内側のフラックスリング
  for (let i = 0; i < ringCount; i++) {
    const t = i / ringCount
    const baseR = orbR + 8 + t * 50 * amplitude
    const speed = 0.5 + (1 - t) * 0.8
    const rotation = time * speed

    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(rotation)

    ctx.beginPath()
    const points = 100
    for (let p = 0; p <= points; p++) {
      const angle = (p / points) * Math.PI * 2
      const wobble =
        Math.sin(angle * 2 + time + i * 0.7) * amplitude * 4 +
        Math.sin(angle * 4 + time * 1.5 + i) * amplitude * 2
      const r = baseR + wobble
      const x = r * Math.cos(angle)
      const y = r * Math.sin(angle)
      if (p === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.closePath()

    const alpha = 0.08 + (1 - t) * 0.15
    const hue = 265 + t * 30
    ctx.strokeStyle = `hsla(${hue}, 55%, 75%, ${alpha})`
    ctx.lineWidth = 1 + (1 - t) * 1.5
    ctx.stroke()

    ctx.restore()
  }

  // リングオーバーレイ（Figmaアセット）
  drawRingOverlay(ctx, cx, cy, Math.min(w, h), time, 0.12)
  drawRingLevel(ctx, cx, cy, Math.min(w, h), time, amplitude, 0.25)

  // 中心ユニット（紫グロー + ベゼル + つまみ）
  drawCenterUnit(ctx, cx, cy, orbR, amplitude)
}

export function Design1_SilkOrbit() {
  return (
    <DesignBase number="01" title="Silk Orbit" subtitle="絹糸のような同心円が静かに回転する" description="実装: sin(angle*N)の調波合成でうねりを生成。内側リングは高速回転、外側は低速で逆回転。&#10;傾向: 層が増えるほどリング密度と振幅が大きくなり、絹糸が織りなすような柔らかい重なりに。">
      {({ amplitude, containerSize }) => (
        <SilkOrbitCanvas amplitude={amplitude} size={containerSize} />
      )}
    </DesignBase>
  )
}

function SilkOrbitCanvas({ amplitude, size }: { amplitude: number; size: number }) {
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
      drawSilkOrbit(ctx, size, size, time, amplitude)
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
