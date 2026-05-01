import React, { useState } from 'react'
import Navbar from './components/Navbar'
import StoryMode from './components/StoryMode'
import Dashboard from './pages/Dashboard'
import Analytics from './pages/Analytics'
import Insights from './pages/Insights'
import MapView from './pages/MapView'
import Compare from './pages/Compare'
import { useTrafficData } from './hooks/useTrafficData'

export default function App() {
  const [activePage, setActivePage] = useState('Dashboard')
  const [storyOpen, setStoryOpen]   = useState(false)
  const trafficData = useTrafficData()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <Navbar
        active={activePage}
        onNav={setActivePage}
        backendOnline={trafficData.backendOnline}
        onStory={() => setStoryOpen(true)}
      />

      {activePage === 'Dashboard' && <Dashboard data={trafficData} />}
      {activePage === 'Analytics'  && <Analytics  data={trafficData} />}
      {activePage === 'Insights'   && <Insights filterOptions={trafficData.filterOptions} />}
      {activePage === 'Compare'    && <Compare  filterOptions={trafficData.filterOptions} />}
      {activePage === 'Map'        && <MapView />}

      {storyOpen && (
        <StoryMode
          onClose={() => setStoryOpen(false)}
          onNavigate={page => { setActivePage(page); setStoryOpen(false) }}
          data={trafficData}
        />
      )}
    </div>
  )
}
