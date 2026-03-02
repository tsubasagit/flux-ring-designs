import { useRef, useEffect } from 'react'

const SIZE = 144
const CENTER = SIZE / 2

export function CenterAuroraCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const startRef = useRef(Date.now())

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let rafId: number

    const tick = () => {
      const elapsed = (Date.now() - startRef.current) / 1000

      ctx.clearRect(0, 0, SIZE, SIZE)

      // 円形クリップ
      ctx.save()
      ctx.beginPath()
      ctx.arc(CENTER, CENTER, CENTER - 1, 0, Math.PI * 2)
      ctx.clip()

      // ベース: ごく薄い白〜ラベンダー
      const gradientBase = ctx.createRadialGradient(
        CENTER, CENTER, 0,
        CENTER, CENTER, CENTER
      )
      gradientBase.addColorStop(0, 'rgba(255, 252, 255, 0.92)')
      gradientBase.addColorStop(1, 'rgba(248, 245, 255, 0.88)')
      ctx.fillStyle = gradientBase
      ctx.fillRect(0, 0, SIZE, SIZE)

      // 流れる紫のオーロラ（複数のかたまりがゆっくり移動）
      const t = elapsed * 0.4
      const layers = [
        { phase: 0, radius: 28, xScale: 0.6, yScale: 0.5 },
        { phase: Math.PI * 0.6, radius: 32, xScale: 0.5, yScale: 0.65 },
        { phase: Math.PI * 1.2, radius: 24, xScale: 0.55, yScale: 0.45 },
        { phase: Math.PI * 0.3, radius: 36, xScale: 0.45, yScale: 0.55 },
      ]

      layers.forEach((layer, i) => {
        const dx = Math.sin(t + layer.phase) * 18 * layer.xScale + Math.sin(t * 0.7 + i) * 8
        const dy = Math.cos(t * 0.85 + layer.phase * 1.1) * 16 * layer.yScale + Math.cos(t * 0.6 + i * 2) * 6
        const cx = CENTER + dx
        const cy = CENTER + dy

        const g = ctx.createRadialGradient(
          cx, cy, 0,
          cx, cy, layer.radius
        )
        g.addColorStop(0, `rgba(180, 160, 220, ${0.12 + Math.sin(t + i) * 0.04})`)
        g.addColorStop(0.5, `rgba(200, 185, 235, ${0.06 + Math.sin(t * 1.2 + i) * 0.02})`)
        g.addColorStop(1, 'rgba(240, 235, 255, 0)')

        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(cx, cy, layer.radius, 0, Math.PI * 2)
        ctx.fill()
      })

      // 縁に近い部分のうねり（オーロラのカーテン風）
      const wavePhase = elapsed * 0.5
      for (let j = 0; j < 3; j++) {
        const g = ctx.createRadialGradient(
          CENTER, CENTER, CENTER * 0.3,
          CENTER, CENTER, CENTER
        )
        const shift = (j / 3) * Math.PI * 2 + wavePhase
        g.addColorStop(0.5, 'rgba(255,255,255,0)')
        g.addColorStop(0.75, `rgba(195, 178, 228, ${0.04 + Math.sin(shift) * 0.02})`)
        g.addColorStop(1, `rgba(180, 160, 220, ${0.06 + Math.sin(shift * 1.3) * 0.02})`)
        ctx.fillStyle = g
        ctx.fillRect(0, 0, SIZE, SIZE)
      }

      ctx.restore()
      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      width={SIZE}
      height={SIZE}
      className="center-aurora-canvas"
      aria-hidden
    />
  )
}
