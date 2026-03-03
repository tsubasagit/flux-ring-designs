import { useRef, useCallback, useState, type ReactNode } from 'react'

function clamp(v: number, min: number, max: number) {
  return Math.min(Math.max(v, min), max)
}

type Props = {
  title: string
  subtitle: string
  number: string
  description?: string
  children: (params: { amplitude: number; containerSize: number }) => ReactNode
  containerSize?: number
  /** compact mode for variation cards (smaller size, no description) */
  compact?: boolean
}

export function DesignBase({ title, subtitle, number, description, children, containerSize, compact }: Props) {
  const resolvedSize = containerSize ?? (compact ? 320 : 420)
  const [amplitude, setAmplitude] = useState(1.0)
  const lastAngleRef = useRef(0)
  const isDragging = useRef(false)

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    const target = e.currentTarget
    const rect = target.getBoundingClientRect()
    lastAngleRef.current = Math.atan2(
      e.clientY - (rect.top + rect.height / 2),
      e.clientX - (rect.left + rect.width / 2)
    )
    isDragging.current = true
    ;(target as HTMLElement).setPointerCapture(e.pointerId)
  }, [])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return
    const target = e.currentTarget
    const rect = target.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const angle = Math.atan2(e.clientY - cy, e.clientX - cx)
    let delta = angle - lastAngleRef.current
    if (delta > Math.PI) delta -= 2 * Math.PI
    if (delta < -Math.PI) delta += 2 * Math.PI
    lastAngleRef.current = angle
    setAmplitude((a) => clamp(a - delta * 1.5, 0.2, 4))
  }, [])

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    isDragging.current = false
    ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
  }, [])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    setAmplitude((a) => clamp(a - e.deltaY * 0.01, 0.2, 4))
  }, [])

  return (
    <div className={`design-card${compact ? ' design-card--compact' : ''}`}>
      <div className="design-header">
        <span className="design-number">{number}</span>
        <div>
          <h2 className="design-title">{title}</h2>
          <p className="design-subtitle">{subtitle}</p>
        </div>
      </div>
      <div
        className="design-canvas-area"
        style={{ width: resolvedSize, height: resolvedSize }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={handleWheel}
      >
        {children({ amplitude, containerSize: resolvedSize })}
      </div>
      <div className="design-controls">
        <label className="design-slider-label">
          Wave Intensity
          <input
            type="range"
            min={0.2}
            max={4}
            step={0.05}
            value={amplitude}
            onChange={(e) => setAmplitude(Number(e.target.value))}
          />
        </label>
        <span className="design-amplitude-value">{amplitude.toFixed(1)}</span>
      </div>
      {!compact && description && (
        <div className="design-description">
          {description}
        </div>
      )}
    </div>
  )
}
