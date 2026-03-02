/**
 * Figmaアセットのプリロード & キャッシュ
 */

const base = import.meta.env.BASE_URL

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

export const SPHERE_SRC = `${base}sphere.png`
export const KNOB_SRC = `${base}knob.png`
export const RING_BEZEL_SRC = `${base}ring-bezel.png`
export const RING_OVERLAY_SRC = `${base}ring-overlay.png`
export const RING_LEVELS_SRC = `${base}ring-levels.png`

/** 全アセットをプリロード。アプリ起動時に1回呼ぶ */
export async function preloadAssets() {
  await Promise.all([
    load(SPHERE_SRC),
    load(RING_OVERLAY_SRC),
    load(RING_LEVELS_SRC),
    load(KNOB_SRC),
    load(RING_BEZEL_SRC),
  ])
}

/** リングレベルスプライトシートの定数 */
export const RING_LEVELS = {
  cols: 5,
  frameW: 1550,
  frameH: 1500,
} as const
