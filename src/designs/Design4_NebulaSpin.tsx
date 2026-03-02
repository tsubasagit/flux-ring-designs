import { useRef, useEffect } from 'react'
import { DesignBase } from './DesignBase'
import { drawCenterUnit, drawBackgroundGlow, drawRingOverlay, drawRingLevel } from './drawHelpers'

/**
 * Design 4: Nebula Spin
 * 銀河の渦巻き腕のようなスパイラルが球を取り囲む。
 * 層が増えると腕が増え、星雲のような密度が増す。
 */

function hash(n: number): number {
  const x = Math.sin(n * 127.1 + n * 311.7) * 43758.5453
  return x - Math.floor(x)
}

function drawNebulaSpin(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number,
  amplitude: number
) {
  const cx = w / 2
  const cy = h / 2
  const orbR = 28 + amplitude * 7

  ctx.clearRect(0, 0, w, h)

  // 背景グロー
  drawBackgroundGlow(ctx, cx, cy, Math.min(w, h), 0.2)

  const armCount = Math.floor(2 + amplitude * 2.5)
  const spiralTurns = 1 + amplitude * 0.8
  const maxExtent = Math.min(w, h) / 2 - 15

  // 星雲の腕
  for (let arm = 0; arm < armCount; arm++) {
    const armOffset = (arm / armCount) * Math.PI * 2
    const rotation = time * 0.25

    ctx.save()
    ctx.translate(cx, cy)

    // 各腕をパスとして描画
    const segPerArm = 60
    const armWidth = 12 + amplitude * 8

    for (let layer = 0; layer < 3; layer++) {
      const layerOffset = (layer - 1) * armWidth * 0.3

      ctx.beginPath()
      for (let s = 0; s <= segPerArm; s++) {
        const t = s / segPerArm
        const spiralAngle = armOffset + rotation + t * spiralTurns * Math.PI * 2
        const spiralR = orbR + 8 + t * (maxExtent - orbR - 8)

        const wobble =
          Math.sin(spiralAngle * 2 + time * 0.5 + arm) * amplitude * 3 +
          Math.sin(t * 10 + time * 0.8 + arm * 3) * amplitude * 2

        const width = armWidth * (1 - t * 0.6) * (0.8 + Math.sin(time + t * 5 + arm) * 0.2)
        const perpAngle = spiralAngle + Math.PI / 2

        const r = spiralR + wobble + layerOffset
        const x = r * Math.cos(spiralAngle) + Math.cos(perpAngle) * width * (layer === 0 ? -0.5 : layer === 2 ? 0.5 : 0)
        const y = r * Math.sin(spiralAngle) + Math.sin(perpAngle) * width * (layer === 0 ? -0.5 : layer === 2 ? 0.5 : 0)

        if (s === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }

      const hue = 265 + arm * 20 + layer * 8
      const alpha = (0.03 + (2 - Math.abs(layer - 1)) * 0.04) * (0.7 + amplitude * 0.15)
      ctx.strokeStyle = `hsla(${hue}, 65%, 78%, ${alpha * 2})`
      ctx.lineWidth = armWidth * (0.3 + (2 - Math.abs(layer - 1)) * 0.3)
      ctx.lineCap = 'round'
      ctx.stroke()
    }

    ctx.restore()
  }

  // ダストパーティクル
  const dustCount = Math.floor(50 + amplitude * 80)
  for (let i = 0; i < dustCount; i++) {
    const seed = i * 7.3
    const armIdx = i % armCount
    const armOffset = (armIdx / armCount) * Math.PI * 2

    const t = hash(seed) // 0-1 along arm
    const spiralAngle = armOffset + time * 0.25 + t * spiralTurns * Math.PI * 2
    const spiralR = orbR + 8 + t * (maxExtent - orbR - 8)

    const scatter = (hash(seed + 50) - 0.5) * 30 * amplitude
    const r = spiralR + scatter

    const x = cx + r * Math.cos(spiralAngle + hash(seed + 100) * 0.3)
    const y = cy + r * Math.sin(spiralAngle + hash(seed + 100) * 0.3)

    const sz = 0.5 + hash(seed + 200) * 1.5 + amplitude * 0.2
    const alpha = 0.1 + hash(seed + 300) * 0.2
    const hue = 260 + hash(seed + 400) * 40

    ctx.beginPath()
    ctx.arc(x, y, sz, 0, Math.PI * 2)
    ctx.fillStyle = `hsla(${hue}, 60%, 85%, ${alpha})`
    ctx.fill()
  }

  // うっすらとした全体リング
  const ringCount = Math.floor(2 + amplitude * 2)
  for (let r = 0; r < ringCount; r++) {
    const rt = r / ringCount
    const ringR = orbR + 30 + rt * 80 * amplitude
    const rotation = time * (0.15 + rt * 0.1) * (r % 2 === 0 ? 1 : -1)

    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(rotation)
    ctx.beginPath()
    ctx.arc(0, 0, ringR, 0, Math.PI * 2)
    ctx.strokeStyle = `hsla(275, 50%, 82%, ${0.04 + (1 - rt) * 0.06})`
    ctx.lineWidth = 1 + amplitude * 0.5
    ctx.stroke()
    ctx.restore()
  }

  // リングオーバーレイ
  drawRingOverlay(ctx, cx, cy, Math.min(w, h), time, 0.1)
  drawRingLevel(ctx, cx, cy, Math.min(w, h), time, amplitude, 0.2)

  // 中心ユニット（紫グロー + ベゼル + つまみ）
  drawCenterUnit(ctx, cx, cy, orbR, amplitude)
}

export function Design4_NebulaSpin() {
  return (
    <DesignBase number="04" title="Nebula Spin" subtitle="銀河の渦巻き腕が星雲のように広がる" description="実装: スパイラル方程式でN本の渦巻き腕を描画。hash関数で疑似ランダムなダスト粒子を配置。&#10;傾向: 腕の本数とダスト密度がamplitudeで増加。低レベルは2本腕、高レベルでは密な星雲状に。">
      {({ amplitude, containerSize }) => (
        <NebulaSpinCanvas amplitude={amplitude} size={containerSize} />
      )}
    </DesignBase>
  )
}

function NebulaSpinCanvas({ amplitude, size }: { amplitude: number; size: number }) {
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
      drawNebulaSpin(ctx, size, size, time, amplitude)
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
