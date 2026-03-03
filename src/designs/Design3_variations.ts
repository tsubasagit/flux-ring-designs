/**
 * Echo Ring (Design 03) — 10 Variations
 * 各バリエーションは描画方法・色相・特徴が異なる
 */

export type RenderMode = 'shadowBlur' | 'thickFill' | 'gradientFill' | 'multiOffset' | 'dotCloud' | 'filterBlur'

export interface EchoRingVariationConfig {
  id: string
  name: string
  renderMode: RenderMode
  hue: number
  saturation: number
  lightness: number
  description: string
  /** shadowBlur の強さ（shadowBlur モード用） */
  blurAmount?: number
  /** thickFill の線幅倍率 */
  thickScale?: number
  /** filterBlur の blur px */
  filterBlurPx?: number
  /** multiOffset の描画回数 */
  offsetCount?: number
  /** dotCloud のドット数倍率 */
  dotDensity?: number
  /** 全体の透明度倍率 (デフォルト1.0) */
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
    description: '淡い紫グロー',
    blurAmount: 18,
    alphaScale: 1.2,
  },
  {
    id: '03-2',
    name: 'Warm Haze',
    renderMode: 'shadowBlur',
    hue: 25,
    saturation: 60,
    lightness: 72,
    description: '暖色系の霧',
    blurAmount: 22,
    alphaScale: 1.0,
  },
  {
    id: '03-3',
    name: 'Deep Nebula',
    renderMode: 'thickFill',
    hue: 250,
    saturation: 55,
    lightness: 65,
    description: '濃い半透明藍',
    thickScale: 3.5,
    alphaScale: 0.6,
  },
  {
    id: '03-4',
    name: 'Aurora Mist',
    renderMode: 'gradientFill',
    hue: 160,
    saturation: 55,
    lightness: 70,
    description: 'シアングラデーション',
    alphaScale: 1.1,
  },
  {
    id: '03-5',
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
    id: '03-6',
    name: 'Ghost Echo',
    renderMode: 'filterBlur',
    hue: 275,
    saturation: 45,
    lightness: 78,
    description: '強ぼかし・極低透明度',
    filterBlurPx: 6,
    alphaScale: 0.5,
  },
  {
    id: '03-7',
    name: 'Solar Corona',
    renderMode: 'dotCloud',
    hue: 45,
    saturation: 65,
    lightness: 72,
    description: '粒子ドット描画',
    dotDensity: 1.5,
    alphaScale: 1.0,
  },
  {
    id: '03-8',
    name: 'Ocean Depth',
    renderMode: 'shadowBlur',
    hue: 200,
    saturation: 60,
    lightness: 68,
    description: '深海ブルー',
    blurAmount: 24,
    alphaScale: 1.3,
  },
  {
    id: '03-9',
    name: 'Twilight',
    renderMode: 'gradientFill',
    hue: 290,
    saturation: 50,
    lightness: 72,
    description: 'デュアルトーン',
    alphaScale: 1.0,
  },
  {
    id: '03-10',
    name: 'Smoke Ring',
    renderMode: 'thickFill',
    hue: 0,
    saturation: 10,
    lightness: 70,
    description: 'モノクロ(彩度10)',
    thickScale: 4.0,
    alphaScale: 0.7,
  },
]
