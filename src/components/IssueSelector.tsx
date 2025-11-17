import { useState, useEffect } from 'react'
import { ChevronLeft } from 'lucide-react'
import { Button } from './ui/button'
import { RadioGroup, RadioGroupItem } from './ui/radio-group'
import { Label } from './ui/label'
import { zendeskService, type ZendeskTicketForm } from '../services/zendesk'
import { appBridge } from '../services/appBridge'

interface IssueSelectorProps {
  onSelectIssue: (issue: string) => void
  onBack: () => void
}

const IssueSelector = ({ onSelectIssue, onBack }: IssueSelectorProps) => {
  const [selectedIssue, setSelectedIssue] = useState<string>('')
  const [issues, setIssues] = useState<ZendeskTicketForm[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadIssues()
  }, [])

  const loadIssues = async () => {
    try {
      const forms = await zendeskService.getTicketForms()
      setIssues(forms)
    } catch (error) {
      console.error('Failed to load issues:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = () => {
    if (selectedIssue) {
      onSelectIssue(selectedIssue)
    }
  }

  const handleBack = () => {
    appBridge.goBack()
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="flex items-center px-4 py-3">
          <button
            onClick={handleBack}
            className="flex items-center text-gray-900 font-medium"
          >
            <ChevronLeft className="w-6 h-6 mr-1" />
            Back
          </button>
        </div>
      </div>

      <div className="flex-1 px-4 py-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Submit a request</h1>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500">Loading...</div>
          </div>
        ) : (
          <div className="space-y-4 mb-6">
            <Label required>What is the issue?</Label>
            <RadioGroup value={selectedIssue} onValueChange={setSelectedIssue}>
              {issues.map((issue) => (
                <RadioGroupItem key={issue.id} value={issue.id}>
                  {issue.name}
                </RadioGroupItem>
              ))}
            </RadioGroup>
          </div>
        )}
      </div>

      <div className="sticky bottom-0 bg-white px-4 py-4 border-t border-gray-100">
        <Button
          onClick={handleSubmit}
          disabled={!selectedIssue || loading}
          className="w-full"
        >
          Submit
        </Button>
      </div>
    </div>
  )
}

export default IssueSelector
