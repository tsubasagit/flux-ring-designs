import { useRef, useEffect } from 'react'
import { DesignBase } from './DesignBase'
import { drawCenterUnit, drawBackgroundGlow, drawRingOverlay, drawRingLevel } from './drawHelpers'

/**
 * Design 3: Echo Ring
 * 残響のように反復するリング群。リングが2〜4つのグループにクラスター化し、
 * グループ間に空間を持つことで、反復・残響のような視覚効果を生む。
 */

function drawEchoRing(
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

  const groupCount = Math.floor(2 + amplitude * 2)
  const ringsPerGroup = Math.floor(3 + amplitude * 1)
  const availableSpace = maxR - orbR - 20
  const groupSpacing = availableSpace / groupCount
  const inGroupSpacing = 4 + amplitude * 2

  for (let g = 0; g < groupCount; g++) {
    const groupBaseR = orbR + 15 + g * groupSpacing
    const groupPhaseOffset = g * 1.2
    const rotationDir = g % 2 === 0 ? 1 : -1

    // Ghost connector ring between groups
    if (g > 0) {
      const connectorR = orbR + 15 + (g - 0.5) * groupSpacing
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(time * 0.2 * rotationDir)
      ctx.beginPath()
      for (let p = 0; p <= 100; p++) {
        const angle = (p / 100) * Math.PI * 2
        const x = connectorR * Math.cos(angle)
        const y = connectorR * Math.sin(angle)
        if (p === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.closePath()
      ctx.strokeStyle = `hsla(275, 50%, 80%, 0.03)`
      ctx.lineWidth = 0.5
      ctx.stroke()
      ctx.restore()
    }

    for (let i = 0; i < ringsPerGroup; i++) {
      const t = (g * ringsPerGroup + i) / (groupCount * ringsPerGroup)
      const baseR = groupBaseR + i * inGroupSpacing
      const speed = 0.4 + (1 - t) * 0.5
      const rotation = time * speed * rotationDir

      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(rotation)

      ctx.beginPath()
      const points = 100
      for (let p = 0; p <= points; p++) {
        const angle = (p / points) * Math.PI * 2
        const wobble =
          Math.sin(angle * 2 + time + groupPhaseOffset + i * 0.7) * amplitude * 4 +
          Math.sin(angle * 4 + time * 1.5 + groupPhaseOffset + i) * amplitude * 2
        const r = baseR + wobble
        const x = r * Math.cos(angle)
        const y = r * Math.sin(angle)
        if (p === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.closePath()

      const alpha = 0.06 + (1 - t) * 0.14
      const hue = 265 + t * 30
      ctx.strokeStyle = `hsla(${hue}, 55%, 75%, ${alpha})`
      ctx.lineWidth = 1 + (1 - t) * 1.2
      ctx.stroke()

      ctx.restore()
    }
  }

  // リングオーバーレイ
  drawRingOverlay(ctx, cx, cy, Math.min(w, h), time, 0.12)
  drawRingLevel(ctx, cx, cy, Math.min(w, h), time, amplitude, 0.22)

  // 中心ユニット（紫グロー + ベゼル + つまみ）
  drawCenterUnit(ctx, cx, cy, orbR, amplitude)
}

export function Design3_EchoRing() {
  return (
    <DesignBase number="03" title="Echo Ring" subtitle="残響のように反復するリング群" description="実装: リングを2〜4グループにクラスター化。グループ内は密、グループ間は空間を空ける。交互逆回転。&#10;傾向: グループ数が増えるほど「残響」の反復が増し、極薄のゴーストコネクタがグループ間を繋ぐ。">
      {({ amplitude, containerSize }) => (
        <EchoRingCanvas amplitude={amplitude} size={containerSize} />
      )}
    </DesignBase>
  )
}

function EchoRingCanvas({ amplitude, size }: { amplitude: number; size: number }) {
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
      drawEchoRing(ctx, size, size, time, amplitude)
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
