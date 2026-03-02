import { useState, useRef, useCallback } from 'react'
import { FluxWaveCanvas } from './FluxWaveCanvas'
import { CenterAuroraCanvas } from './CenterAuroraCanvas'
import './App.css'

function clamp(v: number, min: number, max: number) {
  return Math.min(Math.max(v, min), max)
}

export default function App() {
  const [waveAmplitude, setWaveAmplitude] = useState(1.0)
  const lastAngleRef = useRef(0)

  const onTabDrag = useCallback((delta: number) => {
    setWaveAmplitude((a) => clamp(a + delta, 0.2, 4))
  }, [])

  const onTabRotate = useCallback(
    (clientX: number, clientY: number, rect: DOMRect) => {
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const angle = Math.atan2(clientY - cy, clientX - cx)
      let delta = angle - lastAngleRef.current
      if (delta > Math.PI) delta -= 2 * Math.PI
      if (delta < -Math.PI) delta += 2 * Math.PI
      lastAngleRef.current = angle
      setWaveAmplitude((a) => clamp(a - delta * 2, 0.2, 4))
    },
    []
  )

  const handlePanStart = useCallback(
    (e: React.PointerEvent) => {
      const target = e.currentTarget
      const rect = target.getBoundingClientRect()
      lastAngleRef.current = Math.atan2(
        e.clientY - (rect.top + rect.height / 2),
        e.clientX - (rect.left + rect.width / 2)
      )
      ;(target as HTMLElement).setPointerCapture(e.pointerId)
    },
    []
  )

  const handlePanMove = useCallback(
    (e: React.PointerEvent) => {
      const target = e.currentTarget
      const rect = target.getBoundingClientRect()
      onTabRotate(e.clientX, e.clientY, rect)
    },
    [onTabRotate]
  )

  const handlePanEnd = useCallback((e: React.PointerEvent) => {
    ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
  }, [])

  return (
    <div className="app">
      <FluxWaveCanvas waveAmplitude={waveAmplitude} />

      <div
        className="center-circle"
        onPointerDown={handlePanStart}
        onPointerMove={handlePanMove}
        onPointerUp={handlePanEnd}
        onPointerCancel={handlePanEnd}
        onWheel={(e) => onTabDrag(-e.deltaY * 0.02)}
      >
        <CenterAuroraCanvas />
        <div className="center-label">
          <span className="center-number">03</span>
          <span className="center-title">Flux Ring</span>
        </div>
        <div className="tab-ring" aria-hidden />
      </div>

      <div className="slider-area">
        <label className="slider-label">ウェーブ</label>
        <input
          type="range"
          className="slider"
          min={0.2}
          max={4}
          step={0.05}
          value={waveAmplitude}
          onChange={(e) => setWaveAmplitude(Number(e.target.value))}
        />
      </div>
    </div>
  )
}
