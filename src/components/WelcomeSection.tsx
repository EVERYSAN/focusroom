import { useState, useEffect, useCallback } from 'react'
import { ja } from '../lib/i18n'

interface Props {
  pickWelcomeName: () => string | null
}

const ROTATE_INTERVAL = 12_000  // 12 seconds between rotations
const FADE_DURATION = 600       // 600ms fade transition

export function WelcomeSection({ pickWelcomeName }: Props) {
  const [currentName, setCurrentName] = useState<string | null>(null)
  const [fading, setFading] = useState(false)

  const rotateName = useCallback(() => {
    setFading(true)
    setTimeout(() => {
      setCurrentName(pickWelcomeName())
      setFading(false)
    }, FADE_DURATION)
  }, [pickWelcomeName])

  // Initial pick + rotation interval
  useEffect(() => {
    setCurrentName(pickWelcomeName())

    const interval = setInterval(rotateName, ROTATE_INTERVAL)
    return () => clearInterval(interval)
  }, [pickWelcomeName, rotateName])

  const secondaryText = currentName
    ? ja.welcome.personFocusing(currentName)
    : ja.welcome.someoneFocusing

  return (
    <div className="welcome-section">
      <p className="welcome-section__primary">
        {ja.welcome.primary}
      </p>
      <p className={`welcome-section__secondary ${fading ? 'welcome-section__secondary--fading' : ''}`}>
        {secondaryText}
      </p>
    </div>
  )
}
