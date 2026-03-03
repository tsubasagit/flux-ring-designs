import { useRef, useEffect } from 'react'
import { DesignBase } from './DesignBase'
import { drawCenterUnit, drawBackgroundGlow, drawRingOverlay, drawRingLevel } from './drawHelpers'
import type { EchoRingVariationConfig, RenderMode } from './Design3_variations'

/**
 * Design 3: Echo Ring
 * 残響のように反復するリング群。リングが2〜4つのグループにクラスター化し、
 * グループ間に空間を持つことで、反復・残響のような視覚効果を生む。
 */

interface DrawParams {
  hue: number
  saturation: number
  lightness: number
  renderMode: RenderMode
  alphaScale: number
  blurAmount: number
  thickScale: number
  filterBlurPx: number
  offsetCount: number
  dotDensity: number
}

const defaultParams: DrawParams = {
  hue: 265,
  saturation: 55,
  lightness: 75,
  renderMode: 'shadowBlur',
  alphaScale: 1.0,
  blurAmount: 0,
  thickScale: 1,
  filterBlurPx: 0,
  offsetCount: 1,
  dotDensity: 1,
}

function buildParams(config?: EchoRingVariationConfig): DrawParams {
  if (!config) return { ...defaultParams, renderMode: 'shadowBlur', blurAmount: 0 }
  return {
    hue: config.hue,
    saturation: config.saturation,
    lightness: config.lightness,
    renderMode: config.renderMode,
    alphaScale: config.alphaScale ?? 1.0,
    blurAmount: config.blurAmount ?? 18,
    thickScale: config.thickScale ?? 3.0,
    filterBlurPx: config.filterBlurPx ?? 4,
    offsetCount: config.offsetCount ?? 4,
    dotDensity: config.dotDensity ?? 1.0,
  }
}

/** リングパスを構築（stroke/fillせず） */
function buildRingPath(
  ctx: CanvasRenderingContext2D,
  baseR: number,
  time: number,
  groupPhaseOffset: number,
  ringIdx: number,
  amplitude: number,
) {
  ctx.beginPath()
  const points = 100
  for (let p = 0; p <= points; p++) {
    const angle = (p / points) * Math.PI * 2
    const wobble =
      Math.sin(angle * 2 + time + groupPhaseOffset + ringIdx * 0.7) * amplitude * 4 +
      Math.sin(angle * 4 + time * 1.5 + groupPhaseOffset + ringIdx) * amplitude * 2
    const r = baseR + wobble
    const x = r * Math.cos(angle)
    const y = r * Math.sin(angle)
    if (p === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.closePath()
}

/** shadowBlur: ctx.shadowBlur + fill でソフトグロー */
function renderShadowBlur(
  ctx: CanvasRenderingContext2D,
  t: number,
  lineW: number,
  params: DrawParams,
  alpha: number,
) {
  const hue = params.hue + t * 30
  const blur = params.blurAmount
  ctx.save()
  ctx.shadowColor = `hsla(${hue}, ${params.saturation}%, ${params.lightness}%, ${alpha * 1.5})`
  ctx.shadowBlur = blur
  ctx.strokeStyle = `hsla(${hue}, ${params.saturation}%, ${params.lightness}%, ${alpha * 0.5})`
  ctx.lineWidth = lineW * 0.5
  ctx.stroke()
  // Double-pass for glow intensity
  ctx.strokeStyle = `hsla(${hue}, ${params.saturation}%, ${params.lightness + 5}%, ${alpha * 0.3})`
  ctx.lineWidth = lineW * 1.5
  ctx.stroke()
  ctx.restore()
}

/** thickFill: 極太 + 超低透明度のストロークで霧状に */
function renderThickFill(
  ctx: CanvasRenderingContext2D,
  t: number,
  lineW: number,
  params: DrawParams,
  alpha: number,
) {
  const hue = params.hue + t * 30
  const thick = lineW * params.thickScale
  ctx.strokeStyle = `hsla(${hue}, ${params.saturation}%, ${params.lightness}%, ${alpha * 0.3})`
  ctx.lineWidth = thick
  ctx.stroke()
  // Inner, slightly more visible layer
  ctx.strokeStyle = `hsla(${hue}, ${params.saturation}%, ${params.lightness + 8}%, ${alpha * 0.15})`
  ctx.lineWidth = thick * 1.8
  ctx.stroke()
}

/** gradientFill: radialGradient でリング形状をフィル */
function renderGradientFill(
  ctx: CanvasRenderingContext2D,
  baseR: number,
  t: number,
  lineW: number,
  params: DrawParams,
  alpha: number,
) {
  const hue = params.hue + t * 30
  const grad = ctx.createRadialGradient(0, 0, baseR - lineW * 2, 0, 0, baseR + lineW * 2)
  grad.addColorStop(0, `hsla(${hue}, ${params.saturation}%, ${params.lightness}%, 0)`)
  grad.addColorStop(0.3, `hsla(${hue}, ${params.saturation}%, ${params.lightness}%, ${alpha * 0.6})`)
  grad.addColorStop(0.5, `hsla(${hue}, ${params.saturation}%, ${params.lightness + 5}%, ${alpha * 0.8})`)
  grad.addColorStop(0.7, `hsla(${hue}, ${params.saturation}%, ${params.lightness}%, ${alpha * 0.6})`)
  grad.addColorStop(1, `hsla(${hue}, ${params.saturation}%, ${params.lightness}%, 0)`)
  ctx.strokeStyle = grad
  ctx.lineWidth = lineW * 4
  ctx.stroke()
}

/** multiOffset: 同一パスを微小オフセットで複数回重ね描画 */
function renderMultiOffset(
  ctx: CanvasRenderingContext2D,
  baseR: number,
  time: number,
  groupPhaseOffset: number,
  ringIdx: number,
  amplitude: number,
  t: number,
  lineW: number,
  params: DrawParams,
  alpha: number,
) {
  const hue = params.hue + t * 30
  const count = params.offsetCount
  for (let oi = 0; oi < count; oi++) {
    const offsetAngle = (oi / count) * Math.PI * 2
    const offsetDist = 2 + amplitude * 1.5
    ctx.save()
    ctx.translate(
      Math.cos(offsetAngle + time * 0.3) * offsetDist,
      Math.sin(offsetAngle + time * 0.3) * offsetDist,
    )
    buildRingPath(ctx, baseR, time, groupPhaseOffset, ringIdx, amplitude)
    ctx.strokeStyle = `hsla(${hue + oi * 5}, ${params.saturation}%, ${params.lightness}%, ${alpha * 0.4})`
    ctx.lineWidth = lineW * 0.8
    ctx.stroke()
    ctx.restore()
  }
}

/** dotCloud: リング軌道上に小ドットを配置 */
function renderDotCloud(
  ctx: CanvasRenderingContext2D,
  baseR: number,
  time: number,
  groupPhaseOffset: number,
  ringIdx: number,
  amplitude: number,
  t: number,
  params: DrawParams,
  alpha: number,
) {
  const hue = params.hue + t * 30
  const dotCount = Math.floor(60 * params.dotDensity)
  for (let d = 0; d < dotCount; d++) {
    const angle = (d / dotCount) * Math.PI * 2
    const wobble =
      Math.sin(angle * 2 + time + groupPhaseOffset + ringIdx * 0.7) * amplitude * 4 +
      Math.sin(angle * 4 + time * 1.5 + groupPhaseOffset + ringIdx) * amplitude * 2
    const r = baseR + wobble + (Math.sin(d * 7.3 + time) * 2)
    const x = r * Math.cos(angle)
    const y = r * Math.sin(angle)
    const sz = 0.8 + Math.sin(d * 3.7 + time * 0.5) * 0.5
    ctx.beginPath()
    ctx.arc(x, y, sz, 0, Math.PI * 2)
    ctx.fillStyle = `hsla(${hue + Math.sin(d) * 15}, ${params.saturation}%, ${params.lightness}%, ${alpha * 0.8})`
    ctx.fill()
  }
}

/** filterBlur: ctx.filter = 'blur()' で直接ぼかし */
function renderFilterBlur(
  ctx: CanvasRenderingContext2D,
  t: number,
  lineW: number,
  params: DrawParams,
  alpha: number,
) {
  const hue = params.hue + t * 30
  ctx.save()
  ctx.filter = `blur(${params.filterBlurPx}px)`
  ctx.strokeStyle = `hsla(${hue}, ${params.saturation}%, ${params.lightness}%, ${alpha * 1.2})`
  ctx.lineWidth = lineW * 1.5
  ctx.stroke()
  ctx.restore()
}

function drawEchoRing(
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

    // Ghost connector ring between groups (only for original)
    if (!noStroke && g > 0) {
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

      const alpha = (0.06 + (1 - t) * 0.14) * params.alphaScale
      const lineW = 1 + (1 - t) * 1.2

      if (noStroke) {
        // Variation mode: use render mode
        switch (params.renderMode) {
          case 'shadowBlur':
            buildRingPath(ctx, baseR, time, groupPhaseOffset, i, amplitude)
            renderShadowBlur(ctx, t, lineW, params, alpha)
            break
          case 'thickFill':
            buildRingPath(ctx, baseR, time, groupPhaseOffset, i, amplitude)
            renderThickFill(ctx, t, lineW, params, alpha)
            break
          case 'gradientFill':
            buildRingPath(ctx, baseR, time, groupPhaseOffset, i, amplitude)
            renderGradientFill(ctx, baseR, t, lineW, params, alpha)
            break
          case 'multiOffset':
            renderMultiOffset(ctx, baseR, time, groupPhaseOffset, i, amplitude, t, lineW, params, alpha)
            break
          case 'dotCloud':
            renderDotCloud(ctx, baseR, time, groupPhaseOffset, i, amplitude, t, params, alpha)
            break
          case 'filterBlur':
            buildRingPath(ctx, baseR, time, groupPhaseOffset, i, amplitude)
            renderFilterBlur(ctx, t, lineW, params, alpha)
            break
        }
      } else {
        // Original mode: standard stroke
        buildRingPath(ctx, baseR, time, groupPhaseOffset, i, amplitude)
        const hue = 265 + t * 30
        ctx.strokeStyle = `hsla(${hue}, 55%, 75%, ${alpha})`
        ctx.lineWidth = lineW
        ctx.stroke()
      }

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

/** Variation component for use in LP grid */
export function EchoRingVariation({ config, compact }: { config: EchoRingVariationConfig; compact?: boolean }) {
  const params = buildParams(config)
  return (
    <DesignBase
      number={config.id}
      title={config.name}
      subtitle={config.description}
      compact={compact}
    >
      {({ amplitude, containerSize }) => (
        <EchoRingCanvas amplitude={amplitude} size={containerSize} params={params} noStroke />
      )}
    </DesignBase>
  )
}

function EchoRingCanvas({
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
      drawEchoRing(ctx, size, size, time, amplitude, params, noStroke)
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
