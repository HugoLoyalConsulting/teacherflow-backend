/**
 * Global Error Boundary Component
 * Catches errors in React component tree and shows fallback UI
 */

import React, { ReactNode, ReactElement } from 'react'
import { AlertCircle } from 'lucide-react'
import { createLogger } from '../utils/logger'

const logger = createLogger('ErrorBoundary')

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: string
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: '',
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any): void {
    logger.error('React Error:', { error, errorInfo })
    this.setState({
      errorInfo: errorInfo.componentStack,
    })

    // Send to Sentry (when available)
    // Sentry.captureException(error, { contexts: { react: errorInfo } })
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: '',
    })
    window.location.href = '/'
  }

  render(): ReactElement {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h1 className="text-lg font-bold text-red-900 dark:text-red-300 mb-2">
                    Oops! Something went wrong
                  </h1>
                  <p className="text-sm text-red-800 dark:text-red-400 mb-4">
                    {this.state.error?.message || 'An unexpected error occurred'}
                  </p>
                  
                  {/* @ts-ignore - DEV flag injected at build time */}
                  {(globalThis.import?.meta?.env?.DEV || false) && this.state.errorInfo && (
                    <details className="text-xs text-red-700 dark:text-red-500 mb-4 max-h-32 overflow-auto">
                      <summary className="cursor-pointer font-mono">Stack Trace</summary>
                      <pre className="mt-2 whitespace-pre-wrap">{this.state.errorInfo}</pre>
                    </details>
                  )}

                  <button
                    onClick={this.handleReset}
                    className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Return to Dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children as ReactElement
  }
}
