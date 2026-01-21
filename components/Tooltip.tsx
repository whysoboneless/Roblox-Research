'use client'

/**
 * TOOLTIP COMPONENT
 * Provides explanations for jargon/technical terms
 * Hover to see what terms mean
 */

import { useState, ReactNode } from 'react'

interface TooltipProps {
  children: ReactNode
  content: string
  position?: 'top' | 'bottom' | 'left' | 'right'
}

export default function Tooltip({ children, content, position = 'top' }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  }

  return (
    <span
      className="relative inline-flex items-center cursor-help"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <span className="ml-0.5 text-gray-500 text-xs">(?)</span>

      {isVisible && (
        <div
          className={`absolute z-50 px-3 py-2 text-xs bg-gray-900 border border-gray-700 rounded-lg shadow-xl whitespace-normal max-w-[200px] ${positionClasses[position]}`}
        >
          <div className="text-gray-300">{content}</div>
        </div>
      )}
    </span>
  )
}

/**
 * Common terms dictionary for the app
 * Use with: <Term id="ccu" /> or <Term id="emerging" />
 */
export const TERMS = {
  ccu: 'Concurrent Users - how many players are online right now',
  emerging: 'Games less than 6 months old showing rapid growth',
  vertical: 'Game category like Simulator, Tycoon, Tower Defense',
  coreLoop: 'The main repeating action players do (e.g., click → collect → upgrade)',
  prestige: 'Reset progress for permanent bonuses - keeps players engaged',
  likeRatio: 'Percentage of players who liked vs disliked the game',
  qualificationScore: 'How proven this pattern is (higher = more verified by real games)',
  revenueEstimate: 'Estimated monthly earnings based on player count and engagement',
  pattern: 'A game mechanic or feature that successful games share',
  retention: 'Features that keep players coming back',
  monetization: 'How the game makes money (gamepasses, etc)',
  viral: 'Features that help the game spread (codes, flexing, etc)',
}

interface TermProps {
  id: keyof typeof TERMS
  children?: ReactNode
}

export function Term({ id, children }: TermProps) {
  return (
    <Tooltip content={TERMS[id]}>
      {children || id.toUpperCase()}
    </Tooltip>
  )
}
