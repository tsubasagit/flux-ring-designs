/**
 * Lumen Cascade (Design 08) — 5 Variations
 * 回転加速・波紋線数増加・レベル遷移フェード対応
 */

export interface LumenCascadeVariationConfig {
  id: string
  name: string
  description: string
  rotationSpeedScale: number
  cascadeSpeedScale: number
  hue: number
  saturation: number
  wobbleScale: number
  gaussianWidth: number
  /** Lv1 starting speed multiplier (default 1.0) */
  baseSpeedMultiplier?: number
  /** Prevent darkening at Lv4-5 (default false) */
  preventDarkening?: boolean
}

/** 8-1 Sub-variations (8-1-1 ~ 8-1-5) */
export const violetTorrentSubVariations: LumenCascadeVariationConfig[] = [
  {
    id: '08-1-1',
    name: 'Violet Breeze',
    description: '紫の微風、穏やかな加速',
    rotationSpeedScale: 1.3,
    cascadeSpeedScale: 1.0,
    hue: 270,
    saturation: 58,
    wobbleScale: 0.9,
    gaussianWidth: 1.8,
    baseSpeedMultiplier: 1.2,
    preventDarkening: true,
  },
  {
    id: '08-1-2',
    name: 'Violet Stream',
    description: '紫の小川、滑らかな流れ',
    rotationSpeedScale: 1.35,
    cascadeSpeedScale: 1.05,
    hue: 268,
    saturation: 60,
    wobbleScale: 1.0,
    gaussianWidth: 1.6,
    baseSpeedMultiplier: 1.3,
    preventDarkening: true,
  },
  {
    id: '08-1-3',
    name: 'Violet Torrent',
    description: '紫の激流、均整のとれた加速',
    rotationSpeedScale: 1.4,
    cascadeSpeedScale: 1.1,
    hue: 270,
    saturation: 58,
    wobbleScale: 1.0,
    gaussianWidth: 1.5,
    baseSpeedMultiplier: 1.4,
    preventDarkening: true,
  },
  {
    id: '08-1-4',
    name: 'Violet Surge',
    description: '紫の奔流、力強い波動',
    rotationSpeedScale: 1.45,
    cascadeSpeedScale: 1.15,
    hue: 272,
    saturation: 56,
    wobbleScale: 1.1,
    gaussianWidth: 1.4,
    baseSpeedMultiplier: 1.55,
    preventDarkening: true,
  },
  {
    id: '08-1-5',
    name: 'Violet Tempest',
    description: '紫の嵐、疾走するカスケード',
    rotationSpeedScale: 1.5,
    cascadeSpeedScale: 1.2,
    hue: 265,
    saturation: 62,
    wobbleScale: 1.2,
    gaussianWidth: 1.3,
    baseSpeedMultiplier: 1.7,
    preventDarkening: true,
  },
]

export const lumenCascadeVariations: LumenCascadeVariationConfig[] = [
  {
    id: '08-1',
    name: 'Violet Torrent',
    description: '紫の激流、加速強め',
    rotationSpeedScale: 1.3,
    cascadeSpeedScale: 1.0,
    hue: 270,
    saturation: 58,
    wobbleScale: 1.0,
    gaussianWidth: 1.5,
    preventDarkening: true,
  },
  {
    id: '08-2',
    name: 'Cyan Cascade',
    description: 'シアンの柔らかい光の弧',
    rotationSpeedScale: 1.0,
    cascadeSpeedScale: 0.9,
    hue: 190,
    saturation: 55,
    wobbleScale: 0.8,
    gaussianWidth: 2.2,
  },
  {
    id: '08-3',
    name: 'Amber Falls',
    description: '金色の波紋、ウォブル強め',
    rotationSpeedScale: 1.1,
    cascadeSpeedScale: 1.0,
    hue: 38,
    saturation: 65,
    wobbleScale: 1.6,
    gaussianWidth: 1.5,
  },
  {
    id: '08-4',
    name: 'Rose Spiral',
    description: 'ローズの高速カスケード',
    rotationSpeedScale: 1.0,
    cascadeSpeedScale: 1.5,
    hue: 340,
    saturation: 52,
    wobbleScale: 1.0,
    gaussianWidth: 1.5,
  },
  {
    id: '08-5',
    name: 'Emerald Flow',
    description: 'エメラルドのシャープな弧',
    rotationSpeedScale: 1.2,
    cascadeSpeedScale: 1.1,
    hue: 155,
    saturation: 55,
    wobbleScale: 1.0,
    gaussianWidth: 0.8,
  },
]
