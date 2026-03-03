import { useRef, useEffect } from 'react'
import { DesignBase } from './DesignBase'
import { drawCenterUnit, drawBackgroundGlow, drawRingOverlay, drawRingLevel, drawHowahowa, drawLightAnimation } from './drawHelpers'
import type { NebulaSpinVariationConfig, RenderMode } from './Design4_variations'

/**
 * Design 4: Nebula Spin
 * 銀河の渦巻き腕のようなスパイラルが球を取り囲む。
 * 層が増えると腕が増え、星雲のような密度が増す。
 */

interface DrawParams {
  hue: number
  saturation: number
  lightness: number
  renderMode: RenderMode
  alphaScale: number
  blurAmount: number
  thickScale: number
  offsetCount: number
  dotDensity: number
  speedScale: number
}

const defaultParams: DrawParams = {
  hue: 265,
  saturation: 65,
  lightness: 78,
  renderMode: 'shadowBlur',
  alphaScale: 1.0,
  blurAmount: 0,
  thickScale: 1,
  offsetCount: 1,
  dotDensity: 1,
  speedScale: 1.0,
}

function buildParams(config?: NebulaSpinVariationConfig): DrawParams {
  if (!config) return defaultParams
  return {
    hue: config.hue,
    saturation: config.saturation,
    lightness: config.lightness,
    renderMode: config.renderMode,
    alphaScale: config.alphaScale ?? 1.0,
    blurAmount: config.blurAmount ?? 20,
    thickScale: config.thickScale ?? 3.0,
    offsetCount: config.offsetCount ?? 4,
    dotDensity: config.dotDensity ?? 1.0,
    speedScale: config.speedScale ?? 1.0,
  }
}

function hash(n: number): number {
  const x = Math.sin(n * 127.1 + n * 311.7) * 43758.5453
  return x - Math.floor(x)
}

/** shadowBlur for spiral arm stroke */
function renderArmShadowBlur(
  ctx: CanvasRenderingContext2D,
  armWidth: number,
  layer: number,
  params: DrawParams,
  alpha: number,
  hue: number,
) {
  ctx.save()
  ctx.shadowColor = `hsla(${hue}, ${params.saturation}%, ${params.lightness}%, ${alpha * 2})`
  ctx.shadowBlur = params.blurAmount
  ctx.strokeStyle = `hsla(${hue}, ${params.saturation}%, ${params.lightness}%, ${alpha})`
  ctx.lineWidth = armWidth * (0.3 + (2 - Math.abs(layer - 1)) * 0.3)
  ctx.lineCap = 'round'
  ctx.stroke()
  // Second pass for glow
  ctx.strokeStyle = `hsla(${hue}, ${params.saturation}%, ${params.lightness + 5}%, ${alpha * 0.5})`
  ctx.lineWidth = armWidth * (0.5 + (2 - Math.abs(layer - 1)) * 0.4)
  ctx.stroke()
  ctx.restore()
}

/** thickFill for spiral arm */
function renderArmThickFill(
  ctx: CanvasRenderingContext2D,
  armWidth: number,
  layer: number,
  params: DrawParams,
  alpha: number,
  hue: number,
) {
  const thick = armWidth * params.thickScale * (0.3 + (2 - Math.abs(layer - 1)) * 0.3)
  ctx.strokeStyle = `hsla(${hue}, ${params.saturation}%, ${params.lightness}%, ${alpha * 0.35})`
  ctx.lineWidth = thick
  ctx.lineCap = 'round'
  ctx.stroke()
  ctx.strokeStyle = `hsla(${hue}, ${params.saturation}%, ${params.lightness + 8}%, ${alpha * 0.15})`
  ctx.lineWidth = thick * 1.6
  ctx.stroke()
}

/** gradientFill for spiral arm */
function renderArmGradientFill(
  ctx: CanvasRenderingContext2D,
  armWidth: number,
  layer: number,
  params: DrawParams,
  alpha: number,
  hue: number,
  maxExtent: number,
) {
  const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, maxExtent)
  grad.addColorStop(0, `hsla(${hue}, ${params.saturation}%, ${params.lightness}%, 0)`)
  grad.addColorStop(0.2, `hsla(${hue}, ${params.saturation}%, ${params.lightness}%, ${alpha * 0.7})`)
  grad.addColorStop(0.6, `hsla(${hue + 15}, ${params.saturation}%, ${params.lightness + 5}%, ${alpha * 0.9})`)
  grad.addColorStop(1, `hsla(${hue + 30}, ${params.saturation}%, ${params.lightness}%, ${alpha * 0.3})`)
  ctx.strokeStyle = grad
  ctx.lineWidth = armWidth * (0.5 + (2 - Math.abs(layer - 1)) * 0.5)
  ctx.lineCap = 'round'
  ctx.stroke()
}


/** multiOffset for spiral arm — rebuilds arm path at slight offsets */
function renderArmMultiOffset(
  ctx: CanvasRenderingContext2D,
  armWidth: number,
  layer: number,
  params: DrawParams,
  alpha: number,
  hue: number,
  time: number,
  // arm path params for rebuild
  armOffset: number,
  rotation: number,
  spiralTurns: number,
  orbR: number,
  maxExtent: number,
  amplitude: number,
  arm: number,
) {
  const count = params.offsetCount
  for (let oi = 0; oi < count; oi++) {
    const oAngle = (oi / count) * Math.PI * 2
    const oDist = 2 + amplitude * 1.2
    ctx.save()
    ctx.translate(
      Math.cos(oAngle + time * 0.2) * oDist,
      Math.sin(oAngle + time * 0.2) * oDist,
    )
    // Rebuild path
    const segPerArm = 60
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
    ctx.strokeStyle = `hsla(${hue + oi * 5}, ${params.saturation}%, ${params.lightness}%, ${alpha * 0.45})`
    ctx.lineWidth = armWidth * (0.2 + (2 - Math.abs(layer - 1)) * 0.2)
    ctx.lineCap = 'round'
    ctx.stroke()
    ctx.restore()
  }
}

/** dotCloud for spiral — scatter dots along arm trajectory */
function renderArmDotCloud(
  ctx: CanvasRenderingContext2D,
  params: DrawParams,
  alpha: number,
  hue: number,
  time: number,
  armOffset: number,
  rotation: number,
  spiralTurns: number,
  orbR: number,
  maxExtent: number,
  amplitude: number,
  arm: number,
  armWidth: number,
) {
  const dotCount = Math.floor(80 * params.dotDensity)
  for (let d = 0; d < dotCount; d++) {
    const t = d / dotCount
    const spiralAngle = armOffset + rotation + t * spiralTurns * Math.PI * 2
    const spiralR = orbR + 8 + t * (maxExtent - orbR - 8)
    const wobble =
      Math.sin(spiralAngle * 2 + time * 0.5 + arm) * amplitude * 3 +
      Math.sin(t * 10 + time * 0.8 + arm * 3) * amplitude * 2
    const scatter = (hash(d * 13.7 + arm * 50) - 0.5) * armWidth * 1.2
    const r = spiralR + wobble + scatter
    const x = r * Math.cos(spiralAngle)
    const y = r * Math.sin(spiralAngle)
    const sz = 0.5 + hash(d * 7.1 + arm * 30) * 1.5
    ctx.beginPath()
    ctx.arc(x, y, sz, 0, Math.PI * 2)
    ctx.fillStyle = `hsla(${hue + hash(d * 3.3) * 20}, ${params.saturation}%, ${params.lightness}%, ${alpha * 0.9})`
    ctx.fill()
  }
}

function drawNebulaSpin(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number,
  amplitude: number,
  params: DrawParams = defaultParams,
  noStroke: boolean = false,
) {
  const cx = w / 2
  const cy = h / 2
  const orbR = 28 + amplitude * 7
  const speed = params.speedScale

  ctx.clearRect(0, 0, w, h)

  // 背景グロー
  drawBackgroundGlow(ctx, cx, cy, Math.min(w, h), 0.2)

  const armCount = Math.floor(2 + amplitude * 2.5)
  const spiralTurns = 1 + amplitude * 0.8
  const maxExtent = Math.min(w, h) / 2 - 15

  // 星雲の腕
  for (let arm = 0; arm < armCount; arm++) {
    const armOffset = (arm / armCount) * Math.PI * 2
    const rotation = time * 0.25 * speed

    ctx.save()
    ctx.translate(cx, cy)

    const segPerArm = 60
    const armWidth = 12 + amplitude * 8

    for (let layer = 0; layer < 3; layer++) {
      const layerOffset = (layer - 1) * armWidth * 0.3
      const hue = noStroke ? params.hue + arm * 20 + layer * 8 : 265 + arm * 20 + layer * 8
      const alpha = noStroke
        ? (0.03 + (2 - Math.abs(layer - 1)) * 0.04) * (0.7 + amplitude * 0.15) * params.alphaScale
        : (0.03 + (2 - Math.abs(layer - 1)) * 0.04) * (0.7 + amplitude * 0.15)

      if (noStroke && params.renderMode === 'dotCloud') {
        renderArmDotCloud(ctx, params, alpha, hue, time, armOffset, rotation, spiralTurns, orbR, maxExtent, amplitude, arm, armWidth)
        continue
      }

      if (noStroke && params.renderMode === 'multiOffset') {
        renderArmMultiOffset(ctx, armWidth, layer, params, alpha, hue, time, armOffset, rotation, spiralTurns, orbR, maxExtent, amplitude, arm)
        continue
      }

      // Build arm path
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

      if (noStroke) {
        switch (params.renderMode) {
          case 'shadowBlur':
            renderArmShadowBlur(ctx, armWidth, layer, params, alpha, hue)
            break
          case 'thickFill':
            renderArmThickFill(ctx, armWidth, layer, params, alpha, hue)
            break
          case 'gradientFill':
            renderArmGradientFill(ctx, armWidth, layer, params, alpha, hue, maxExtent)
            break
          default:
            // fallback
            ctx.strokeStyle = `hsla(${hue}, ${params.saturation}%, ${params.lightness}%, ${alpha * 2})`
            ctx.lineWidth = armWidth * (0.3 + (2 - Math.abs(layer - 1)) * 0.3)
            ctx.lineCap = 'round'
            ctx.stroke()
        }
      } else {
        ctx.strokeStyle = `hsla(${hue}, 65%, 78%, ${alpha * 2})`
        ctx.lineWidth = armWidth * (0.3 + (2 - Math.abs(layer - 1)) * 0.3)
        ctx.lineCap = 'round'
        ctx.stroke()
      }
    }

    ctx.restore()
  }

  // ダストパーティクル
  const dustCount = Math.floor(50 + amplitude * 80)
  for (let i = 0; i < dustCount; i++) {
    const seed = i * 7.3
    const armIdx = i % armCount
    const armOffset = (armIdx / armCount) * Math.PI * 2

    const t = hash(seed)
    const spiralAngle = armOffset + time * 0.25 * speed + t * spiralTurns * Math.PI * 2
    const spiralR = orbR + 8 + t * (maxExtent - orbR - 8)

    const scatter = (hash(seed + 50) - 0.5) * 30 * amplitude
    const r = spiralR + scatter

    const x = cx + r * Math.cos(spiralAngle + hash(seed + 100) * 0.3)
    const y = cy + r * Math.sin(spiralAngle + hash(seed + 100) * 0.3)

    const sz = 0.5 + hash(seed + 200) * 1.5 + amplitude * 0.2
    const dustAlpha = (0.1 + hash(seed + 300) * 0.2) * params.alphaScale
    const dustHue = noStroke ? params.hue + hash(seed + 400) * 40 : 260 + hash(seed + 400) * 40

    ctx.beginPath()
    ctx.arc(x, y, sz, 0, Math.PI * 2)
    ctx.fillStyle = `hsla(${dustHue}, ${noStroke ? params.saturation : 60}%, ${noStroke ? params.lightness : 85}%, ${dustAlpha})`
    ctx.fill()
  }

  // うっすらとした全体リング (variations skip stroke)
  if (!noStroke) {
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
  }

  // ほわほわエフェクト
  drawHowahowa(ctx, cx, cy, Math.min(w, h), time, amplitude)

  // リングオーバーレイ
  drawRingOverlay(ctx, cx, cy, Math.min(w, h), time, 0.1)
  drawRingLevel(ctx, cx, cy, Math.min(w, h), time, amplitude, 0.2)

  // 光のアニメーション
  drawLightAnimation(ctx, cx, cy, Math.min(w, h), time, amplitude)

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

/** Variation component for use in LP grid */
export function NebulaSpinVariation({ config, compact }: { config: NebulaSpinVariationConfig; compact?: boolean }) {
  const params = buildParams(config)
  return (
    <DesignBase
      number={config.id}
      title={config.name}
      subtitle={config.description}
      compact={compact}
    >
      {({ amplitude, containerSize }) => (
        <NebulaSpinCanvas amplitude={amplitude} size={containerSize} params={params} noStroke />
      )}
    </DesignBase>
  )
}

function NebulaSpinCanvas({
  amplitude,
  size,
  params,
  noStroke = false,
  fps,
}: {
  amplitude: number
  size: number
  params?: DrawParams
  noStroke?: boolean
  fps?: number
}) {
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
    const interval = fps ? 1000 / fps : 0
    let lastFrame = 0

    const tick = (now?: number) => {
      if (fps && now) {
        if (now - lastFrame < interval) {
          rafId = requestAnimationFrame(tick)
          return
        }
        lastFrame = now
      }
      const time = (Date.now() - startRef.current) / 1000
      drawNebulaSpin(ctx, size, size, time, amplitude, params, noStroke)
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [amplitude, size, params, noStroke, fps])

  return (
    <canvas
      ref={canvasRef}
      style={{ width: size, height: size, display: 'block' }}
    />
  )
}
