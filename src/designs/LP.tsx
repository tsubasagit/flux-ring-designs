import { useEffect, useRef, useCallback, useState } from 'react'
import { preloadAssets } from './assetLoader'
import { Design1_SilkOrbit } from './Design1_SilkOrbit'
import { Design2_FrostVeil } from './Design2_FrostVeil'
import { Design3_EchoRing, EchoRingVariation } from './Design3_EchoRing'
import { Design4_NebulaSpin, NebulaSpinVariation } from './Design4_NebulaSpin'
import { Design5_PulseWave } from './Design5_PulseWave'
import { Design6_HazeDrift } from './Design6_HazeDrift'
import { Design7_TwinShell } from './Design7_TwinShell'
import { Design8_LumenCascade, LumenCascadeVariation } from './Design8_LumenCascade'
import { echoRingVariations } from './Design3_variations'
import { nebulaSpinVariations } from './Design4_variations'
import { lumenCascadeVariations, violetTorrentSubVariations } from './Design8_variations'
import './LP.css'

/** IntersectionObserver wrapper — pauses animation when off-screen */
function VisibilityWrapper({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  const handleIntersect = useCallback((entries: IntersectionObserverEntry[]) => {
    entries.forEach((entry) => setVisible(entry.isIntersecting))
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(handleIntersect, { rootMargin: '100px' })
    observer.observe(el)
    return () => observer.disconnect()
  }, [handleIntersect])

  return (
    <div ref={ref} style={{ minHeight: visible ? undefined : 200 }}>
      {visible ? children : null}
    </div>
  )
}

export default function LP() {
  useEffect(() => { preloadAssets() }, [])

  return (
    <div className="lp">
      <header className="lp-header">
        <h1 className="lp-title">Flux Ring Designs</h1>
        <p className="lp-description">
          円をドラッグ（回転）またはスクロールでウェーブの層が変化します
        </p>
      </header>

      {/* === 08-1 Violet Torrent Sub-Variations === */}
      <section className="lp-section">
        <h2 className="lp-section-title">08-1 Violet Torrent Variations</h2>
        {/* 8-1 を中心に大きく表示 */}
        <div className="lp-hero-design">
          <VisibilityWrapper>
            <LumenCascadeVariation config={lumenCascadeVariations[0]} />
          </VisibilityWrapper>
        </div>
        {/* 8-1-1 ~ 8-1-5 のグリッド */}
        <div className="lp-variation-grid">
          {violetTorrentSubVariations.map((config) => (
            <VisibilityWrapper key={config.id}>
              <LumenCascadeVariation config={config} compact />
            </VisibilityWrapper>
          ))}
        </div>
      </section>

      {/* === Lumen Cascade Variations === */}
      <section className="lp-section">
        <h2 className="lp-section-title">Lumen Cascade Variations</h2>
        <div className="lp-variation-grid">
          {lumenCascadeVariations.map((config) => (
            <VisibilityWrapper key={config.id}>
              <LumenCascadeVariation config={config} compact />
            </VisibilityWrapper>
          ))}
        </div>
      </section>

      {/* === Echo Ring Variations === */}
      <section className="lp-section">
        <h2 className="lp-section-title">Echo Ring Variations</h2>
        <div className="lp-variation-grid">
          {echoRingVariations.map((config) => (
            <VisibilityWrapper key={config.id}>
              <EchoRingVariation config={config} compact />
            </VisibilityWrapper>
          ))}
        </div>
      </section>

      {/* === Nebula Spin Variations === */}
      <section className="lp-section">
        <h2 className="lp-section-title">Nebula Spin Variations</h2>
        <div className="lp-variation-grid">
          {nebulaSpinVariations.map((config) => (
            <VisibilityWrapper key={config.id}>
              <NebulaSpinVariation config={config} compact />
            </VisibilityWrapper>
          ))}
        </div>
      </section>

      {/* === Separator === */}
      <div className="lp-separator">
        <span className="lp-separator-line" />
        <span className="lp-separator-label">Original Designs</span>
        <span className="lp-separator-line" />
      </div>

      {/* === Original Designs === */}
      <section className="lp-section">
        <div className="lp-grid">
          <Design1_SilkOrbit />
          <Design2_FrostVeil />
          <Design3_EchoRing />
          <Design4_NebulaSpin />
          <Design5_PulseWave />
          <Design6_HazeDrift />
          <Design7_TwinShell />
          <Design8_LumenCascade />
        </div>
      </section>

      <footer className="lp-footer">
        <p>AppTalentHub - Flux Ring Prototype</p>
      </footer>
    </div>
  )
}
