/**
 * Figmaアセットのプリロード & キャッシュ
 */

const cache = new Map<string, HTMLImageElement>()

function load(src: string): Promise<HTMLImageElement> {
  const cached = cache.get(src)
  if (cached) return Promise.resolve(cached)

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      cache.set(src, img)
      resolve(img)
    }
    img.onerror = reject
    img.src = src
  })
}

export function getImage(src: string): HTMLImageElement | null {
  return cache.get(src) ?? null
}

/** 全アセットをプリロード。アプリ起動時に1回呼ぶ */
export async function preloadAssets() {
  await Promise.all([
    load('/sphere.png'),
    load('/ring-overlay.png'),
    load('/ring-levels.png'),
    load('/knob.png'),
    load('/ring-bezel.png'),
  ])
}

export const SPHERE_SRC = '/sphere.png'
export const KNOB_SRC = '/knob.png'
export const RING_BEZEL_SRC = '/ring-bezel.png'
export const RING_OVERLAY_SRC = '/ring-overlay.png'
export const RING_LEVELS_SRC = '/ring-levels.png'

/** リングレベルスプライトシートの定数 */
export const RING_LEVELS = {
  cols: 5,
  frameW: 1550,
  frameH: 1500,
} as const
