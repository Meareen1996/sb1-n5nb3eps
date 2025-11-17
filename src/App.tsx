import { useState } from 'react'
import IssueSelector from './components/IssueSelector'
import FormContainer from './components/FormContainer'
import SuccessPage from './components/SuccessPage'

type View = 'issue-selector' | 'form' | 'success'

function App() {
  const [currentView, setCurrentView] = useState<View>('issue-selector')
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null)

  const handleSelectIssue = (issue: string) => {
    setSelectedIssue(issue)
    setCurrentView('form')
  }

  const handleBackToSelector = () => {
    setCurrentView('issue-selector')
    setSelectedIssue(null)
  }

  const handleBackFromSuccess = () => {
    setCurrentView('issue-selector')
    setSelectedIssue(null)
  }

  const handleSubmitSuccess = () => {
    setCurrentView('success')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {currentView === 'issue-selector' && (
        <IssueSelector
          onSelectIssue={handleSelectIssue}
          onBack={() => window.history.back()}
        />
      )}
      {currentView === 'form' && selectedIssue && (
        <FormContainer
          issueType={selectedIssue}
          onBack={handleBackToSelector}
          onSuccess={handleSubmitSuccess}
        />
      )}
      {currentView === 'success' && (
        <SuccessPage onBack={handleBackFromSuccess} />
      )}
    </div>
  )
}

export default App
