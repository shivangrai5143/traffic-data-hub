import React, { useState } from 'react'

const NAV_LINKS = ['Dashboard', 'Analytics', 'Insights']

export default function Navbar({ active, onNav, backendOnline }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header style={{
      background: 'rgba(10,13,20,0.85)',
      borderBottom: '1px solid var(--border)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{
        maxWidth: 1400,
        margin: '0 auto',
        padding: '0 24px',
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 24,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div style={{
            width: 36, height: 36,
            background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
            borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18,
          }}>🚦</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1rem', lineHeight: 1.2 }}>
              <span className="gradient-text">Traffic</span> Intelligence
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
              ANALYTICS SYSTEM
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav style={{ display: 'flex', gap: 4 }}>
          {NAV_LINKS.map(link => (
            <button
              key={link}
              onClick={() => onNav(link)}
              className={`nav-link${active === link ? ' active' : ''}`}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              {link}
            </button>
          ))}
        </nav>

        {/* Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <div
            className={backendOnline ? 'pulse' : ''}
            style={{
              width: 8, height: 8,
              borderRadius: '50%',
              background: backendOnline ? 'var(--accent-green)' : 'var(--accent-red)',
              boxShadow: backendOnline ? '0 0 8px var(--accent-green)' : '0 0 8px var(--accent-red)',
            }}
          />
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
            {backendOnline ? 'API Online' : 'API Offline'}
          </span>
        </div>
      </div>
    </header>
  )
}
