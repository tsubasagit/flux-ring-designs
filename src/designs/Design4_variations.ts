/**
 * Nebula Spin (Design 04) — 10 Variations
 * 各バリエーションは描画方法・色相・特徴が異なる
 */

export type RenderMode = 'shadowBlur' | 'thickFill' | 'gradientFill' | 'multiOffset' | 'dotCloud' | 'filterBlur'

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
  filterBlurPx?: number
  offsetCount?: number
  dotDensity?: number
  alphaScale?: number
  /** 回転速度倍率 (デフォルト1.0) */
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
    description: 'ソフトぼかしアーム',
    blurAmount: 20,
    alphaScale: 1.2,
  },
  {
    id: '04-2',
    name: 'Solar Wind',
    renderMode: 'shadowBlur',
    hue: 15,
    saturation: 65,
    lightness: 70,
    description: '暖色・高速回転',
    blurAmount: 16,
    alphaScale: 1.0,
    speedScale: 1.8,
  },
  {
    id: '04-3',
    name: 'Emerald Galaxy',
    renderMode: 'gradientFill',
    hue: 140,
    saturation: 55,
    lightness: 68,
    description: '緑グラデーション渦',
    alphaScale: 1.1,
  },
  {
    id: '04-4',
    name: 'Ice Spiral',
    renderMode: 'filterBlur',
    hue: 210,
    saturation: 50,
    lightness: 78,
    description: '氷のような冷たさ',
    filterBlurPx: 5,
    alphaScale: 0.6,
  },
  {
    id: '04-5',
    name: 'Cosmic Dust',
    renderMode: 'dotCloud',
    hue: 35,
    saturation: 45,
    lightness: 75,
    description: '粒子雲アーム',
    dotDensity: 2.0,
    alphaScale: 1.0,
  },
  {
    id: '04-6',
    name: 'Magenta Storm',
    renderMode: 'thickFill',
    hue: 310,
    saturation: 65,
    lightness: 68,
    description: '濃密ビビッド',
    thickScale: 3.0,
    alphaScale: 0.7,
  },
  {
    id: '04-7',
    name: 'Midnight Fog',
    renderMode: 'shadowBlur',
    hue: 240,
    saturation: 50,
    lightness: 60,
    description: '暗く深いムード',
    blurAmount: 28,
    alphaScale: 1.4,
  },
  {
    id: '04-8',
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
    id: '04-9',
    name: 'Teal Whirlpool',
    renderMode: 'gradientFill',
    hue: 175,
    saturation: 55,
    lightness: 70,
    description: 'タイトな渦巻き',
    alphaScale: 1.0,
    speedScale: 0.6,
  },
  {
    id: '04-10',
    name: 'Monochrome',
    renderMode: 'thickFill',
    hue: 0,
    saturation: 10,
    lightness: 68,
    description: 'モノクロエレガント',
    thickScale: 3.5,
    alphaScale: 0.7,
  },
]
