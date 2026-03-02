import { useRef, useEffect } from 'react'
import { DesignBase } from './DesignBase'
import { drawCenterUnit, drawBackgroundGlow, drawRingOverlay, drawRingLevel } from './drawHelpers'

/**
 * Design 6: Haze Drift
 * 陽炎のようにゆらぐ同心円。リングの大部分はほぼ完全な円だが、
 * 2〜6箇所の「ノット」で局所的にガウシアン変形し、蜃気楼のような歪みを生む。
 */

function drawHazeDrift(
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

  // Atmospheric background layer
  const atmGrad = ctx.createRadialGradient(cx, cy, orbR * 1.5, cx, cy, maxR)
  atmGrad.addColorStop(0, 'rgba(200, 180, 240, 0.06)')
  atmGrad.addColorStop(1, 'rgba(200, 180, 240, 0)')
  ctx.fillStyle = atmGrad
  ctx.fillRect(0, 0, w, h)

  const ringCount = Math.floor(5 + amplitude * 5)
  const knotCount = Math.floor(2 + amplitude)

  // Generate stable knot positions that drift slowly
  const knots: { angle: number; sigma: number; strength: number }[] = []
  for (let k = 0; k < knotCount; k++) {
    knots.push({
      angle: (k / knotCount) * Math.PI * 2 + time * 0.08,
      sigma: 0.3 + Math.sin(time * 0.3 + k * 2) * 0.1,
      strength: amplitude * 8 * (0.7 + Math.sin(time * 0.5 + k * 1.5) * 0.3),
    })
  }

  for (let i = 0; i < ringCount; i++) {
    const t = i / ringCount
    const baseR = orbR + 12 + t * (maxR - orbR - 24)
    const rotation = time * 0.08

    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(rotation + i * 0.01)

    ctx.beginPath()
    const points = 120
    for (let p = 0; p <= points; p++) {
      const angle = (p / points) * Math.PI * 2

      // Gaussian bumps at knot positions
      let wobble = 0
      for (const knot of knots) {
        let delta = angle - knot.angle
        // Wrap to [-PI, PI]
        while (delta > Math.PI) delta -= Math.PI * 2
        while (delta < -Math.PI) delta += Math.PI * 2
        const gaussian = Math.exp(-(delta * delta) / (2 * knot.sigma * knot.sigma))
        wobble += gaussian * knot.strength * (0.5 + t * 0.5)
      }

      const r = baseR + wobble
      const x = r * Math.cos(angle)
      const y = r * Math.sin(angle)
      if (p === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.closePath()

    const alpha = 0.06 + (1 - t) * 0.12
    const hue = 268 + t * 25
    ctx.strokeStyle = `hsla(${hue}, 55%, 78%, ${alpha})`
    ctx.lineWidth = 0.8 + (1 - t) * 1.2
    ctx.stroke()

    ctx.restore()
  }

  // リングオーバーレイ
  drawRingOverlay(ctx, cx, cy, Math.min(w, h), time, 0.1)
  drawRingLevel(ctx, cx, cy, Math.min(w, h), time, amplitude, 0.22)

  // 中心ユニット（紫グロー + ベゼル + つまみ）
  drawCenterUnit(ctx, cx, cy, orbR, amplitude)
}

export function Design6_HazeDrift() {
  return (
    <DesignBase number="06" title="Haze Drift" subtitle="陽炎のようにゆらぐ同心円" description="実装: ガウシアンバンプ exp(-δ²/2σ²) で局所的に膨らみを生成。ほぼ真円に数箇所のノットが歪む。&#10;傾向: ノット数がamplitudeで増加。低レベルは真円に近く上品、高レベルは蜃気楼のような複雑な歪みに。">
      {({ amplitude, containerSize }) => (
        <HazeDriftCanvas amplitude={amplitude} size={containerSize} />
      )}
    </DesignBase>
  )
}

function HazeDriftCanvas({ amplitude, size }: { amplitude: number; size: number }) {
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
      drawHazeDrift(ctx, size, size, time, amplitude)
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
