import { useEffect, useState } from 'react'

const useMock = import.meta.env.VITE_USE_MOCK === 'true'

export function MockModeBadge() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(useMock)
  }, [])

  if (!visible) return null

  return (
    <div className="fixed bottom-2 left-2 z-50 bg-surface border border-border-soft rounded px-2 py-1 font-mono text-xs text-accent-amber">
      MOCK MODE
    </div>
  )
}