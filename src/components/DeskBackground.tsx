/**
 * DeskBackground — photo-based desk scene (喫茶店の机トップビュー).
 *
 * Renders the stylized desk image as CSS background with warm vignette.
 * Designed to feel like "sitting at a cafe desk", not a landing page.
 */

import { useEffect, useState } from 'react'

interface DeskBackgroundProps {
  memberCount: number
  isHome: boolean
}

const BG_SRC = '/assets/desk_bg.webp'

export function DeskBackground({ isHome }: DeskBackgroundProps) {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const img = new Image()
    img.onload = () => setLoaded(true)
    img.src = BG_SRC
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
          backgroundImage: `url(${BG_SRC})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 40%',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* Warm vignette overlay — subtle edge darkening */}
      <div
        className="desk-bg__vignette"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      {/* Dust motes — pure CSS, very subtle */}
      {isHome && (
        <div className="desk-bg__dust" aria-hidden="true">
          {Array.from({ length: 8 }, (_, i) => (
            <span key={i} className="desk-dust-mote" style={{
              '--x': `${18 + (i * 9.1) % 64}%`,
              '--y': `${12 + (i * 13.3) % 76}%`,
              '--delay': `${(i * 2.1) % 10}s`,
              '--dur': `${8 + (i % 4) * 3}s`,
            } as React.CSSProperties} />
          ))}
        </div>
      )}
    </>
  )
}
