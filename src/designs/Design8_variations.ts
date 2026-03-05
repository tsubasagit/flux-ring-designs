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
}

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
