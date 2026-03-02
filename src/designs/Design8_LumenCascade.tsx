import { useRef, useEffect } from 'react'
import { DesignBase } from './DesignBase'
import { drawCenterUnit, drawBackgroundGlow, drawRingOverlay, drawRingLevel } from './drawHelpers'

/**
 * Design 8: Lumen Cascade
 * 光の滝のように流れ落ちるリング。各リングの円周に沿ってalphaが変化し、
 * 明るい弧の位置がリングごとにずれて螺旋状の光のカスケードを描く。
 */

function drawLumenCascade(
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

  const ringCount = Math.floor(5 + amplitude * 6)
  const segments = 40

  for (let i = 0; i < ringCount; i++) {
    const t = i / ringCount
    const baseR = orbR + 12 + t * (maxR - orbR - 24)
    const rotation = time * 0.3
    const cascadePhase = time * 0.6 + i * 0.4

    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(rotation + i * 0.03)

    // Draw ring as segments with varying alpha
    for (let s = 0; s < segments; s++) {
      const segStart = (s / segments) * Math.PI * 2
      const segEnd = ((s + 1) / segments) * Math.PI * 2
      const segMid = (segStart + segEnd) / 2

      // Gaussian window for cascade brightness
      let angleDelta = segMid - cascadePhase
      while (angleDelta > Math.PI) angleDelta -= Math.PI * 2
      while (angleDelta < -Math.PI) angleDelta += Math.PI * 2
      const brightness = Math.exp(-(angleDelta * angleDelta) / 1.5)

      const baseAlpha = 0.03 + (1 - t) * 0.06
      const alpha = baseAlpha + brightness * (0.15 + amplitude * 0.05)
      const hue = 265 + t * 25
      const sat = 55 + t * 10

      ctx.beginPath()
      // Compute wobbled points for this segment
      const segPoints = 4
      for (let p = 0; p <= segPoints; p++) {
        const angle = segStart + (p / segPoints) * (segEnd - segStart)
        const wobble =
          Math.sin(angle * 2 + time + i * 0.7) * amplitude * 3 +
          Math.sin(angle * 4 + time * 1.3 + i) * amplitude * 1.5
        const r = baseR + wobble
        const x = r * Math.cos(angle)
        const y = r * Math.sin(angle)
        if (p === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }

      // Afterglow on bright segments
      if (brightness > 0.5) {
        ctx.shadowColor = `hsla(${hue}, ${sat}%, 80%, ${brightness * 0.3})`
        ctx.shadowBlur = 6
      } else {
        ctx.shadowBlur = 0
      }

      ctx.strokeStyle = `hsla(${hue}, ${sat}%, 76%, ${alpha})`
      ctx.lineWidth = 0.8 + (1 - t) * 1.2 + brightness * 0.5
      ctx.stroke()
    }

    ctx.shadowBlur = 0
    ctx.restore()
  }

  // リングオーバーレイ
  drawRingOverlay(ctx, cx, cy, Math.min(w, h), time, 0.12)
  drawRingLevel(ctx, cx, cy, Math.min(w, h), time, amplitude, 0.22)

  // 中心ユニット（紫グロー + ベゼル + つまみ）
  drawCenterUnit(ctx, cx, cy, orbR, amplitude)
}

export function Design8_LumenCascade() {
  return (
    <DesignBase number="08" title="Lumen Cascade" subtitle="光の滝のように流れ落ちるリング" description="実装: 40セグメント分割でリング円周のalphaをガウシアン窓で変調。位相オフセットi*0.4で螺旋状のカスケード。&#10;傾向: 明るい弧がリングごとにずれ、光の滝が流れ落ちるような動き。高レベルでアフターグロー効果が強まる。">
      {({ amplitude, containerSize }) => (
        <LumenCascadeCanvas amplitude={amplitude} size={containerSize} />
      )}
    </DesignBase>
  )
}

function LumenCascadeCanvas({ amplitude, size }: { amplitude: number; size: number }) {
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
      drawLumenCascade(ctx, size, size, time, amplitude)
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
