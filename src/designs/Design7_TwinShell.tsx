import { useRef, useEffect } from 'react'
import { DesignBase } from './DesignBase'
import { drawCenterUnit, drawBackgroundGlow, drawRingOverlay, drawRingLevel } from './drawHelpers'

/**
 * Design 7: Twin Shell
 * 二重殻が呼応しながら回転する。内殻は高周波うねりで細かいリプル、
 * 外殻は低周波うねりで大きな波。対話的なコントラストを生む。
 */

function drawTwinShell(
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

  const innerCount = Math.floor(3 + amplitude * 3)
  const outerCount = Math.floor(2 + amplitude * 3)
  const shellGap = 15 + amplitude * 8

  const availableInner = (maxR - orbR - shellGap - 20) * 0.5
  const innerStart = orbR + 12
  const outerStart = innerStart + availableInner + shellGap

  // Inner shell: clockwise, high-frequency ripple
  for (let i = 0; i < innerCount; i++) {
    const t = i / innerCount
    const baseR = innerStart + t * availableInner
    const rotation = time * 0.6

    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(rotation)

    ctx.beginPath()
    const points = 120
    for (let p = 0; p <= points; p++) {
      const angle = (p / points) * Math.PI * 2
      const wobble =
        Math.sin(angle * 3 + time * 1.2 + i * 0.8) * amplitude * 2.5 +
        Math.sin(angle * 6 + time * 0.9 + i * 1.5) * amplitude * 1.5 +
        Math.sin(angle * 9 + time * 1.5 + i * 0.5) * amplitude * 0.8
      const r = baseR + wobble
      const x = r * Math.cos(angle)
      const y = r * Math.sin(angle)
      if (p === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.closePath()

    const alpha = 0.08 + (1 - t) * 0.14
    const hue = 268 + t * 20
    ctx.strokeStyle = `hsla(${hue}, 58%, 76%, ${alpha})`
    ctx.lineWidth = 0.8 + (1 - t) * 1.2
    ctx.stroke()
    ctx.restore()
  }

  // Bridge arcs between shells
  const bridgeCount = 3 + Math.floor(amplitude)
  for (let b = 0; b < bridgeCount; b++) {
    const bridgeAngleStart = (b / bridgeCount) * Math.PI * 2 + time * 0.15
    const arcLength = 0.2 + amplitude * 0.1
    const bridgeR = innerStart + availableInner + shellGap * 0.5

    ctx.save()
    ctx.translate(cx, cy)
    ctx.beginPath()
    ctx.arc(0, 0, bridgeR, bridgeAngleStart, bridgeAngleStart + arcLength)
    ctx.strokeStyle = `hsla(275, 50%, 80%, 0.04)`
    ctx.lineWidth = 0.5
    ctx.stroke()
    ctx.restore()
  }

  // Outer shell: counter-clockwise, low-frequency wave
  for (let i = 0; i < outerCount; i++) {
    const t = i / outerCount
    const availableOuter = maxR - outerStart - 5
    const baseR = outerStart + t * availableOuter
    const rotation = -time * 0.35

    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(rotation)

    ctx.beginPath()
    const points = 120
    for (let p = 0; p <= points; p++) {
      const angle = (p / points) * Math.PI * 2
      const wobble =
        Math.sin(angle * 1.5 + time * 0.7 + i * 1.2) * amplitude * 5 +
        Math.sin(angle * 2.5 + time * 0.5 + i * 0.9) * amplitude * 3
      const r = baseR + wobble
      const x = r * Math.cos(angle)
      const y = r * Math.sin(angle)
      if (p === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.closePath()

    const alpha = 0.06 + (1 - t) * 0.1
    const hue = 272 + t * 22
    ctx.strokeStyle = `hsla(${hue}, 52%, 78%, ${alpha})`
    ctx.lineWidth = 1 + (1 - t) * 1.5
    ctx.stroke()
    ctx.restore()
  }

  // リングオーバーレイ
  drawRingOverlay(ctx, cx, cy, Math.min(w, h), time, 0.12)
  drawRingLevel(ctx, cx, cy, Math.min(w, h), time, amplitude, 0.22)

  // 中心ユニット（紫グロー + ベゼル + つまみ）
  drawCenterUnit(ctx, cx, cy, orbR, amplitude)
}

export function Design7_TwinShell() {
  return (
    <DesignBase number="07" title="Twin Shell" subtitle="二重殻が呼応しながら回転する" description="実装: 内殻(高周波 angle*3,6,9)と外殻(低周波 angle*1.5,2.5)の2グループが逆方向に回転。ブリッジアーク接続。&#10;傾向: 内殻は細かいリプル、外殻は大きな波。対比が層数増加で際立ち、対話的な動きになる。">
      {({ amplitude, containerSize }) => (
        <TwinShellCanvas amplitude={amplitude} size={containerSize} />
      )}
    </DesignBase>
  )
}

function TwinShellCanvas({ amplitude, size }: { amplitude: number; size: number }) {
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
      drawTwinShell(ctx, size, size, time, amplitude)
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
