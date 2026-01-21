'use client'

/**
 * WORKFLOW GUIDE COMPONENT
 * Shows users where they are in the research workflow
 * Appears on all main pages to provide context
 */

import { usePathname } from 'next/navigation'
import Link from 'next/link'

const WORKFLOW_STEPS = [
  {
    id: 'discover',
    path: '/emerging',
    label: '1. Discover',
    description: 'Find trending games',
    icon: '🔍'
  },
  {
    id: 'analyze',
    path: '/analyze',
    label: '2. Analyze',
    description: 'Research patterns',
    icon: '📊'
  },
  {
    id: 'create',
    path: '/idea',
    label: '3. Create',
    description: 'Build your idea',
    icon: '💡'
  }
]

export default function WorkflowGuide() {
  const pathname = usePathname()

  // Determine current step
  const getCurrentStep = () => {
    if (pathname === '/emerging') return 'discover'
    if (pathname === '/analyze') return 'analyze'
    if (pathname === '/idea') return 'create'
    return null
  }

  const currentStep = getCurrentStep()

  // Don't show on homepage or non-workflow pages
  if (!currentStep) return null

  const currentIndex = WORKFLOW_STEPS.findIndex(s => s.id === currentStep)

  return (
    <div className="mb-6 bg-[#0a0a0a] border border-gray-800/50 rounded-xl p-4">
      {/* Progress Bar */}
      <div className="flex items-center gap-2 mb-3">
        {WORKFLOW_STEPS.map((step, index) => {
          const isActive = step.id === currentStep
          const isCompleted = index < currentIndex
          const isFuture = index > currentIndex

          return (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step Indicator */}
              <Link
                href={step.path}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                  isActive
                    ? 'bg-green-900/30 border border-green-700/50 text-green-400'
                    : isCompleted
                    ? 'bg-gray-800/50 text-gray-400 hover:bg-gray-800'
                    : 'text-gray-600 hover:text-gray-400'
                }`}
              >
                <span className="text-lg">{step.icon}</span>
                <div className="hidden sm:block">
                  <div className={`text-sm font-medium ${isActive ? 'text-green-400' : ''}`}>
                    {step.label}
                  </div>
                  <div className="text-xs text-gray-500">{step.description}</div>
                </div>
              </Link>

              {/* Connector Line */}
              {index < WORKFLOW_STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${
                  isCompleted ? 'bg-green-700/50' : 'bg-gray-800'
                }`} />
              )}
            </div>
          )
        })}
      </div>

      {/* Contextual Help */}
      <div className="text-xs text-gray-500 text-center">
        {currentStep === 'discover' && 'Find games gaining traction, then click "Analyze" to research their patterns'}
        {currentStep === 'analyze' && 'AI extracts what makes these games work. Save to use in Idea Lab.'}
        {currentStep === 'create' && 'Use your research to build a validated game concept'}
      </div>
    </div>
  )
}
