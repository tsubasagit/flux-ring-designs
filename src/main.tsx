import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter, Routes, Route } from 'react-router-dom'
import LP from './designs/LP'
import Playground from './designs/Playground'
import DesignLab from './designs/DesignLab'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<LP />} />
        <Route path="/playground" element={<Playground />} />
        <Route path="/lab" element={<DesignLab />} />
      </Routes>
    </HashRouter>
  </React.StrictMode>,
)
