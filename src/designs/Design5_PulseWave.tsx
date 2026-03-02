import { useRef, useEffect } from 'react'
import { DesignBase } from './DesignBase'
import { drawCenterUnit, drawBackgroundGlow, drawRingOverlay, drawRingLevel } from './drawHelpers'

/**
 * Design 5: Pulse Wave
 * 脈動するリングが球から発生し外側に波紋のように広がる。
 * 層が増えると同時に脈打つリングが増え、
 * 各リングが有機的にうねりながら回転する。
 */

function drawPulseWave(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number,
  amplitude: number
) {
  const cx = w / 2
  const cy = h / 2
  const orbR = 30 + amplitude * 6
  const maxR = Math.min(w, h) / 2 - 10

  ctx.clearRect(0, 0, w, h)

  // 背景グロー
  drawBackgroundGlow(ctx, cx, cy, Math.min(w, h), 0.2)

  // パルスリング（波紋）
  const pulseCount = Math.floor(3 + amplitude * 5)
  const pulseInterval = 2.5 / (1 + amplitude * 0.3) // 秒ごとにパルス
  const maxPulseR = maxR

  for (let p = 0; p < pulseCount; p++) {
    const birthTime = p * pulseInterval * 0.3
    const age = (time - birthTime) % (pulseInterval * pulseCount * 0.3)
    if (age < 0) continue

    const progress = age / (pulseInterval * pulseCount * 0.3)
    const pulseR = orbR + 10 + progress * (maxPulseR - orbR - 10)
    const fadeAlpha = (1 - progress) * (0.15 + amplitude * 0.05)

    if (fadeAlpha <= 0) continue

    const rotation = time * 0.2 + p * 0.5

    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(rotation)

    ctx.beginPath()
    const segments = 100
    for (let s = 0; s <= segments; s++) {
      const angle = (s / segments) * Math.PI * 2
      const wave =
        Math.sin(angle * 3 + time * 1.2 + p * 1.5) * amplitude * 5 * (1 - progress * 0.5) +
        Math.sin(angle * 5 + time * 0.7 + p * 2.3) * amplitude * 3 * (1 - progress * 0.7) +
        Math.sin(angle * 8 + time * 2 + p) * amplitude * 1.5 * (1 - progress * 0.8)
      const r = pulseR + wave
      const x = r * Math.cos(angle)
      const y = r * Math.sin(angle)
      if (s === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.closePath()

    // 輪郭の厚み
    const thickness = (2 + amplitude * 2) * (1 - progress * 0.7)
    const hue = 268 + p * 8 + progress * 15
    ctx.strokeStyle = `hsla(${hue}, 60%, 78%, ${fadeAlpha})`
    ctx.lineWidth = thickness
    ctx.stroke()

    // うっすら塗り
    ctx.fillStyle = `hsla(${hue}, 65%, 85%, ${fadeAlpha * 0.25})`
    ctx.fill()

    ctx.restore()
  }

  // 回転する装飾リング
  const decoCount = Math.floor(2 + amplitude * 2)
  for (let d = 0; d < decoCount; d++) {
    const dt = d / decoCount
    const decoR = orbR + 15 + dt * 50 * amplitude
    const speed = 0.4 + dt * 0.3
    const rotation = time * speed * (d % 2 === 0 ? 1 : -0.8)

    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(rotation)

    // 二重線リング
    for (let line = 0; line < 2; line++) {
      const lineR = decoR + (line - 0.5) * (3 + amplitude)
      ctx.beginPath()
      const pts = 80
      for (let p = 0; p <= pts; p++) {
        const angle = (p / pts) * Math.PI * 2
        const wobble = Math.sin(angle * 4 + time + d * 2 + line) * amplitude * 2
        const r = lineR + wobble
        const x = r * Math.cos(angle)
        const y = r * Math.sin(angle)
        if (p === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.closePath()

      const hue = 270 + d * 12
      ctx.strokeStyle = `hsla(${hue}, 50%, 80%, ${0.06 + (1 - dt) * 0.08})`
      ctx.lineWidth = 0.8
      ctx.stroke()
    }

    ctx.restore()
  }

  // 光のスパークル
  const sparkleCount = Math.floor(8 + amplitude * 15)
  for (let i = 0; i < sparkleCount; i++) {
    const seed = i * 17.3
    const angle = time * 0.3 + (i / sparkleCount) * Math.PI * 2
    const dist = orbR + 20 + Math.sin(seed) * 60 * amplitude
    const x = cx + dist * Math.cos(angle + Math.sin(time + seed) * 0.2)
    const y = cy + dist * Math.sin(angle + Math.sin(time + seed) * 0.2)

    const twinkle = Math.sin(time * 3 + seed * 5) * 0.5 + 0.5
    const sz = (1 + amplitude * 0.5) * twinkle

    if (twinkle < 0.3) continue

    ctx.save()
    ctx.translate(x, y)

    // 十字のスパークル
    const sparkAlpha = 0.15 + twinkle * 0.3
    ctx.strokeStyle = `rgba(220, 200, 255, ${sparkAlpha})`
    ctx.lineWidth = 0.5

    const armLen = sz * 3
    ctx.beginPath()
    ctx.moveTo(-armLen, 0)
    ctx.lineTo(armLen, 0)
    ctx.moveTo(0, -armLen)
    ctx.lineTo(0, armLen)
    ctx.stroke()

    // 中心ドット
    ctx.beginPath()
    ctx.arc(0, 0, sz * 0.5, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(240, 230, 255, ${sparkAlpha})`
    ctx.fill()

    ctx.restore()
  }

  // リングオーバーレイ
  drawRingOverlay(ctx, cx, cy, Math.min(w, h), time, 0.1)
  drawRingLevel(ctx, cx, cy, Math.min(w, h), time, amplitude, 0.2)

  // 中心ユニット（紫グロー + ベゼル + つまみ）
  drawCenterUnit(ctx, cx, cy, orbR, amplitude)

  // パルス発光（Design5固有）
  const pulseGlow = Math.sin(time * 2) * 0.15 + 0.25
  ctx.shadowColor = `rgba(180, 150, 255, ${pulseGlow})`
  ctx.shadowBlur = 15 + amplitude * 5
  ctx.beginPath()
  ctx.arc(cx, cy, orbR, 0, Math.PI * 2)
  ctx.strokeStyle = `rgba(200, 180, 255, ${pulseGlow * 0.5})`
  ctx.lineWidth = 1.5
  ctx.stroke()
  ctx.shadowBlur = 0
}

export function Design5_PulseWave() {
  return (
    <DesignBase number="05" title="Pulse Wave" subtitle="脈動する波紋がリズミカルに広がる" description="実装: 時間経過で波紋が外側に拡散。減衰する振幅+フェードアウトで自然な波及効果。十字スパークル付き。&#10;傾向: パルス数が増えるほど同時波紋が重なり、リズミカルで華やかな脈動になる。">
      {({ amplitude, containerSize }) => (
        <PulseWaveCanvas amplitude={amplitude} size={containerSize} />
      )}
    </DesignBase>
  )
}

function PulseWaveCanvas({ amplitude, size }: { amplitude: number; size: number }) {
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
      drawPulseWave(ctx, size, size, time, amplitude)
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
