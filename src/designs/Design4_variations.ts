/**
 * Nebula Spin (Design 04) — 5 Variations
 * 外枠線なし（モヤモヤ感）、各バリエーションは描画方法・色相が異なる
 */

export type RenderMode = 'shadowBlur' | 'thickFill' | 'gradientFill' | 'multiOffset' | 'dotCloud'

export interface NebulaSpinVariationConfig {
  id: string
  name: string
  renderMode: RenderMode
  hue: number
  saturation: number
  lightness: number
  description: string
  blurAmount?: number
  thickScale?: number
  offsetCount?: number
  dotDensity?: number
  alphaScale?: number
  speedScale?: number
}

export const nebulaSpinVariations: NebulaSpinVariationConfig[] = [
  {
    id: '04-1',
    name: 'Violet Nebula',
    renderMode: 'shadowBlur',
    hue: 280,
    saturation: 55,
    lightness: 75,
    description: 'ソフトぼかしの紫渦',
    blurAmount: 22,
    alphaScale: 1.2,
  },
  {
    id: '04-2',
    name: 'Emerald Galaxy',
    renderMode: 'gradientFill',
    hue: 140,
    saturation: 55,
    lightness: 68,
    description: '緑グラデーション渦',
    alphaScale: 1.1,
  },
  {
    id: '04-3',
    name: 'Cosmic Dust',
    renderMode: 'dotCloud',
    hue: 35,
    saturation: 45,
    lightness: 75,
    description: '粒子雲のアーム',
    dotDensity: 2.0,
    alphaScale: 1.0,
  },
  {
    id: '04-4',
    name: 'Amber Drift',
    renderMode: 'multiOffset',
    hue: 40,
    saturation: 60,
    lightness: 72,
    description: '金色多重オフセット',
    offsetCount: 4,
    alphaScale: 0.8,
  },
  {
    id: '04-5',
    name: 'Magenta Storm',
    renderMode: 'thickFill',
    hue: 310,
    saturation: 65,
    lightness: 68,
    description: '濃密マゼンタの霧',
    thickScale: 3.0,
    alphaScale: 0.7,
  },
]
