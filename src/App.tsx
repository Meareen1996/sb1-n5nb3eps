import { useState, useEffect, Component, ReactNode } from 'react'
import IssueSelector from './components/IssueSelector'
import FormContainer from './components/FormContainer'
import SuccessPage from './components/SuccessPage'

type View = 'issue-selector' | 'form' | 'success'

function App() {
  const [currentView, setCurrentView] = useState<View>('issue-selector')
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null)
  const [selectedFormId, setSelectedFormId] = useState<number | null>(null)

  useEffect(() => {
    window.history.replaceState({ view: 'issue-selector' }, '')

    const onPopState = (e: PopStateEvent) => {
      const state = (e.state || {}) as { view?: View; issue?: string; issueId?: number }
      const view = state.view || 'issue-selector'
      setCurrentView(view)
      if (view === 'form') {
        setSelectedIssue(state.issue ?? null)
        setSelectedFormId(state.issueId ?? null)
      } else {
        setSelectedIssue(null)
        setSelectedFormId(null)
      }
    }

    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const handleSelectIssue = (slug: string, formId?: number) => {
    setSelectedIssue(slug)
    setSelectedFormId(formId ?? null)
    window.history.pushState({ view: 'form', issue: slug, issueId: formId ?? null }, '')
    setCurrentView('form')
  }

  

  const handleSubmitSuccess = () => {
    window.history.pushState({ view: 'success' }, '')
    setCurrentView('success')
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        {currentView === 'issue-selector' && (
          <IssueSelector
            onSelectIssue={handleSelectIssue}
          />
        )}
        {currentView === 'form' && selectedIssue && (
          <FormContainer
            issueType={selectedIssue}
            formId={selectedFormId ?? undefined}
            onSuccess={handleSubmitSuccess}
          />
        )}
        {currentView === 'success' && (
          <SuccessPage />
        )}
      </div>
    </ErrorBoundary>
  )
}

export default App

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error?: any }> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error }
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('Unhandled error:', error, errorInfo)
  }

  handleReload = () => {
    location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-white flex flex-col">
          <div className="px-6 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h1>
            <p className="text-gray-700 mb-6">Please try going back or reloading the page.</p>
            <div className="flex gap-3">
              <button
                onClick={() => window.history.back()}
                className="px-4 py-2 border rounded-lg"
              >
                Back
              </button>
              <button
                onClick={this.handleReload}
                className="px-4 py-2 bg-black text-white rounded-lg"
              >
                Reload
              </button>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
