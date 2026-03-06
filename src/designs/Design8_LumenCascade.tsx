import { useRef, useEffect } from 'react'
import { DesignBase } from './DesignBase'
import { drawCenterUnit, drawBackgroundGlow, drawRingOverlay, drawRingLevel, drawHowahowa, drawLightAnimation, amplitudeToLevel } from './drawHelpers'
import type { LumenCascadeVariationConfig } from './Design8_variations'

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
  amplitude: number,
  config?: LumenCascadeVariationConfig
) {
  const cx = w / 2
  const cy = h / 2
  const maxR = Math.min(w, h) / 2 - 10
  // ダイヤルサイズ固定（amplitude に依存しない）
  const orbR = config ? 38 : 30 + amplitude * 8

  ctx.clearRect(0, 0, w, h)

  const level = amplitudeToLevel(amplitude)
  const rotSpeedScale = config?.rotationSpeedScale ?? 1.0
  const cascSpeedScale = config?.cascadeSpeedScale ?? 1.0
  const wobbleScale = config?.wobbleScale ?? 1.0
  const gaussWidth = config?.gaussianWidth ?? 1.5
  const baseHue = config?.hue ?? 265
  const baseSat = config?.saturation ?? 55
  const baseSpeedMul = config?.baseSpeedMultiplier ?? 1.0
  const noDarken = config?.preventDarkening ?? false

  // 背景グロー（バリエーションではレベルに応じて強化）
  const bgGlowAlpha = noDarken
    ? 0.25 + level * 0.08
    : config ? 0.2 + level * 0.06 : 0.2
  drawBackgroundGlow(ctx, cx, cy, Math.min(w, h), bgGlowAlpha)

  // 波紋線数: noDarken ではLv1で少なく、レベルで段階的に増やす
  const ringCount = config
    ? (noDarken
      ? Math.floor(3 + (level - 1) * 4.5)   // Lv1:3 → Lv2:7 → Lv3:12 → Lv4:16 → Lv5:21
      : Math.floor(10 + (level - 1) * 5))
    : Math.floor(5 + amplitude * 6)
  const segments = 40

  // レベル遷移フェード: レベル内進行度を算出
  const tNorm = Math.max(0, Math.min(1, (amplitude - 0.2) / 3.8))
  const levelFloat = tNorm * 5
  const levelFrac = levelFloat - Math.floor(levelFloat)
  const fadeAlpha = config ? (levelFrac < 0.25 ? levelFrac / 0.25 : 1.0) : 1.0

  // 回転加速: レベル連動（baseSpeedMultiplier でLv1の速度を底上げ）
  // 加速倍率はスタート速度が速いほど控えめにする
  const accelDamping = 1.0 / Math.sqrt(baseSpeedMul)
  const baseSpeed = 0.3 * rotSpeedScale * baseSpeedMul
  const levelBoost = level * 0.08 * rotSpeedScale * accelDamping

  for (let i = 0; i < ringCount; i++) {
    const t = i / ringCount
    const baseR = orbR + 12 + t * (maxR - orbR - 24)
    const rotation = time * (baseSpeed + levelBoost)
    const cascadePhase = time * (0.6 * baseSpeedMul + level * 0.1 * accelDamping) * cascSpeedScale + i * 0.4

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
      const brightness = Math.exp(-(angleDelta * angleDelta) / gaussWidth)

      // noDarken: Lv1で薄く → Lv5で濃く、段階的に存在感を増す
      const levelAlphaBoost = config ? level * 0.08 : 0
      const levelVisibility = noDarken ? 0.15 + (level - 1) * 0.12 : 1.0  // Lv1:0.15 → Lv5:0.63
      const rawAlpha = (0.12 + (1 - t) * 0.1 + levelAlphaBoost + brightness * (0.25 + amplitude * 0.06)) * fadeAlpha * levelVisibility
      // 重なりが暗くならないようalphaを制限
      const alphaLimit = noDarken ? 0.5 : 1.0
      const alpha = Math.min(alphaLimit, rawAlpha)
      const hue = baseHue + t * 25
      // noDarken: 彩度を高めに保つ（紫がしっかり見えるように）
      const sat = noDarken
        ? baseSat + t * 8 + level * 2
        : baseSat + t * 10

      ctx.beginPath()
      // Compute wobbled points for this segment
      const segPoints = 4
      for (let p = 0; p <= segPoints; p++) {
        const angle = segStart + (p / segPoints) * (segEnd - segStart)
        // noDarken: 高レベルでwobbleを抑え、リングの交差・重なりを防ぐ
        const ampForWobble = noDarken ? Math.min(amplitude, 2.0 + level * 0.3) : amplitude
        const wobble =
          (Math.sin(angle * 2 + time + i * 0.7) * ampForWobble * 3 +
          Math.sin(angle * 4 + time * 1.3 + i) * ampForWobble * 1.5) * wobbleScale
        const r = baseR + wobble
        const x = r * Math.cos(angle)
        const y = r * Math.sin(angle)
        if (p === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }

      // Afterglow on bright segments（レベルが上がるほどグロー強化）
      const glowBoost = config ? 1 + level * 0.15 : 1
      const glowLightness = noDarken ? 72 + level * 1.5 : 82
      if (brightness > 0.4) {
        ctx.shadowColor = `hsla(${hue}, ${sat}%, ${glowLightness}%, ${brightness * 0.35 * fadeAlpha * glowBoost})`
        ctx.shadowBlur = 6 + (config ? level * 2 : 0)
      } else {
        ctx.shadowBlur = 0
      }

      // 明度: 紫がきちんと見える範囲に維持（65-72%）
      // 高すぎると白く、低すぎると重なりで黒くなる
      const lightness = noDarken
        ? 66 + level * 1.2
        : 76 + (config ? level * 2 : 0)
      ctx.strokeStyle = `hsla(${hue}, ${sat}%, ${lightness}%, ${alpha})`
      // noDarken: Lv1で細く、レベルで太くなる
      const lineScale = noDarken ? 0.4 + (level - 1) * 0.18 : 1.0  // Lv1:0.4 → Lv5:1.12
      ctx.lineWidth = (0.8 + (1 - t) * 1.2 + brightness * 0.5) * lineScale
      ctx.stroke()
    }

    ctx.shadowBlur = 0
    ctx.restore()
  }

  // ほわほわエフェクト
  if (noDarken) {
    // noDarken: Lv4-5でもLv3の画像を使い、暗い画像を回避
    const clampedAmp = Math.min(amplitude, 2.5)
    drawHowahowa(ctx, cx, cy, Math.min(w, h), time, clampedAmp)
  } else {
    drawHowahowa(ctx, cx, cy, Math.min(w, h), time, amplitude)
  }

  // リングオーバーレイ
  drawRingOverlay(ctx, cx, cy, Math.min(w, h), time, 0.12)
  // noDarken: multiply ブレンドの drawRingLevel を完全スキップ（黒みの主因）
  if (!noDarken) {
    drawRingLevel(ctx, cx, cy, Math.min(w, h), time, amplitude, 0.22)
  }

  // 光のアニメーション
  drawLightAnimation(ctx, cx, cy, Math.min(w, h), time, amplitude)

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

/** Variation component for use in LP grid */
export function LumenCascadeVariation({ config, compact }: { config: LumenCascadeVariationConfig; compact?: boolean }) {
  return (
    <DesignBase
      number={config.id}
      title={config.name}
      subtitle={config.description}
      compact={compact}
    >
      {({ amplitude, containerSize }) => (
        <LumenCascadeCanvas amplitude={amplitude} size={containerSize} config={config} />
      )}
    </DesignBase>
  )
}

function LumenCascadeCanvas({ amplitude, size, config }: { amplitude: number; size: number; config?: LumenCascadeVariationConfig }) {
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
      drawLumenCascade(ctx, size, size, time, amplitude, config)
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [amplitude, size, config])

  return (
    <canvas
      ref={canvasRef}
      style={{ width: size, height: size, display: 'block' }}
    />
  )
}
