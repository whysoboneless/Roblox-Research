'use client'

/**
 * FIRST TIME HINT COMPONENT
 * Shows helpful hints to new users
 * Dismissible and stored in localStorage
 */

import { useState, useEffect } from 'react'

interface FirstTimeHintProps {
  id: string
  title?: string
  children: React.ReactNode
  showArrow?: 'up' | 'down' | 'left' | 'right' | null
}

export default function FirstTimeHint({
  id,
  title,
  children,
  showArrow = null
}: FirstTimeHintProps) {
  const [dismissed, setDismissed] = useState(true)

  useEffect(() => {
    // Check if user has dismissed this hint before
    const dismissedHints = JSON.parse(localStorage.getItem('dismissedHints') || '[]')
    setDismissed(dismissedHints.includes(id))
  }, [id])

  const dismiss = () => {
    const dismissedHints = JSON.parse(localStorage.getItem('dismissedHints') || '[]')
    dismissedHints.push(id)
    localStorage.setItem('dismissedHints', JSON.stringify(dismissedHints))
    setDismissed(true)
  }

  if (dismissed) return null

  const arrowClasses = {
    up: 'before:content-[""] before:absolute before:top-0 before:left-1/2 before:-translate-x-1/2 before:-translate-y-full before:border-8 before:border-transparent before:border-b-blue-900/80',
    down: 'after:content-[""] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:translate-y-full after:border-8 after:border-transparent after:border-t-blue-900/80',
    left: 'before:content-[""] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:-translate-x-full before:border-8 before:border-transparent before:border-r-blue-900/80',
    right: 'after:content-[""] after:absolute after:right-0 after:top-1/2 after:-translate-y-1/2 after:translate-x-full after:border-8 after:border-transparent after:border-l-blue-900/80',
  }

  return (
    <div
      className={`relative bg-blue-900/30 border border-blue-700/50 rounded-xl p-4 mb-4 ${
        showArrow ? arrowClasses[showArrow] : ''
      }`}
    >
      <button
        onClick={dismiss}
        className="absolute top-2 right-2 text-gray-500 hover:text-white text-lg leading-none p-1"
        aria-label="Dismiss hint"
      >
        &times;
      </button>

      {title && (
        <div className="flex items-center gap-2 mb-2">
          <span className="text-blue-400">💡</span>
          <span className="font-semibold text-blue-300">{title}</span>
        </div>
      )}

      <div className="text-sm text-gray-300 pr-6">{children}</div>
    </div>
  )
}

/**
 * Reset all hints (for testing)
 */
export function resetAllHints() {
  localStorage.removeItem('dismissedHints')
}
