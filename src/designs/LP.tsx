import { useEffect } from 'react'
import { preloadAssets } from './assetLoader'
import { Design1_SilkOrbit } from './Design1_SilkOrbit'
import { Design2_FrostVeil } from './Design2_FrostVeil'
import { Design3_EchoRing } from './Design3_EchoRing'
import { Design4_NebulaSpin } from './Design4_NebulaSpin'
import { Design5_PulseWave } from './Design5_PulseWave'
import { Design6_HazeDrift } from './Design6_HazeDrift'
import { Design7_TwinShell } from './Design7_TwinShell'
import { Design8_LumenCascade } from './Design8_LumenCascade'
import './LP.css'

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

      <footer className="lp-footer">
        <p>AppTalentHub - Flux Ring Prototype</p>
      </footer>
    </div>
  )
}
