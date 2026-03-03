/**
 * Echo Ring (Design 03) — 5 Variations
 * 外枠線なし（モヤモヤ感）、各バリエーションは描画方法・色相が異なる
 */

export type RenderMode = 'shadowBlur' | 'thickFill' | 'gradientFill' | 'multiOffset' | 'dotCloud'

export interface EchoRingVariationConfig {
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
}

export const echoRingVariations: EchoRingVariationConfig[] = [
  {
    id: '03-1',
    name: 'Mist Whisper',
    renderMode: 'shadowBlur',
    hue: 270,
    saturation: 50,
    lightness: 75,
    description: '淡い紫のソフトグロー',
    blurAmount: 20,
    alphaScale: 1.2,
  },
  {
    id: '03-2',
    name: 'Warm Haze',
    renderMode: 'thickFill',
    hue: 25,
    saturation: 60,
    lightness: 72,
    description: '暖色系の霧状レイヤー',
    thickScale: 3.5,
    alphaScale: 0.7,
  },
  {
    id: '03-3',
    name: 'Aurora Mist',
    renderMode: 'gradientFill',
    hue: 160,
    saturation: 55,
    lightness: 70,
    description: 'シアングラデーション',
    alphaScale: 1.1,
  },
  {
    id: '03-4',
    name: 'Rose Cloud',
    renderMode: 'multiOffset',
    hue: 330,
    saturation: 50,
    lightness: 75,
    description: 'ピンクの多重レイヤー',
    offsetCount: 4,
    alphaScale: 0.8,
  },
  {
    id: '03-5',
    name: 'Solar Corona',
    renderMode: 'dotCloud',
    hue: 45,
    saturation: 65,
    lightness: 72,
    description: '金色の粒子ドット',
    dotDensity: 1.5,
    alphaScale: 1.0,
  },
]
