import React, { useState } from 'react'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import Analytics from './pages/Analytics'
import Insights from './pages/Insights'
import { useTrafficData } from './hooks/useTrafficData'

export default function App() {
  const [activePage, setActivePage] = useState('Dashboard')
  const trafficData = useTrafficData()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <Navbar
        active={activePage}
        onNav={setActivePage}
        backendOnline={trafficData.backendOnline}
      />
      {activePage === 'Dashboard' && <Dashboard data={trafficData} />}
      {activePage === 'Analytics'  && <Analytics  data={trafficData} />}
      {activePage === 'Insights'   && <Insights />}
    </div>
  )
}
