/**
 * DeskBackground — photo-based desk scene replacing Three.js DeskScene.
 *
 * Renders the AI-generated desk composite as a CSS background image
 * with a warm vignette overlay and subtle dust-particle CSS animation.
 * ~46 KB image vs ~300 KB+ Three.js bundle — dramatically lighter.
 */

import { useEffect, useState } from 'react'

interface DeskBackgroundProps {
  memberCount: number
  isHome: boolean
}

export function DeskBackground({ isHome }: DeskBackgroundProps) {
  const [loaded, setLoaded] = useState(false)

  // Preload the image
  useEffect(() => {
    const img = new Image()
    img.onload = () => setLoaded(true)
    img.src = '/assets/desk_composite.webp'
  }, [])

  return (
    <>
      {/* Desk photo layer */}
      <div
        className={`desk-bg ${loaded ? 'desk-bg--loaded' : ''}`}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          backgroundImage: 'url(/assets/desk_composite.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* Warm vignette overlay */}
      <div
        className="desk-bg__vignette"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      {/* Ambient dust particles — pure CSS, no JS overhead */}
      <div className="desk-bg__dust" aria-hidden="true">
        {Array.from({ length: 12 }, (_, i) => (
          <span key={i} className="desk-dust-mote" style={{
            '--i': i,
            '--x': `${15 + (i * 7.3) % 70}%`,
            '--y': `${10 + (i * 11.7) % 80}%`,
            '--delay': `${(i * 1.7) % 8}s`,
            '--dur': `${6 + (i % 5) * 2}s`,
          } as React.CSSProperties} />
        ))}
      </div>

      {/* Subtle steam hint — CSS only, positioned near coffee cup */}
      {isHome && (
        <div className="desk-bg__steam" aria-hidden="true">
          <span className="desk-steam-wisp desk-steam-wisp--1" />
          <span className="desk-steam-wisp desk-steam-wisp--2" />
          <span className="desk-steam-wisp desk-steam-wisp--3" />
        </div>
      )}
    </>
  )
}
