import { ChevronLeft } from 'lucide-react'
import { ReactNode } from 'react'

interface FormLayoutProps {
  onBack: () => void
  onSubmit: (e: React.FormEvent) => void
  children: ReactNode
  isSubmitDisabled?: boolean
}

const FormLayout = ({ onBack, onSubmit, children, isSubmitDisabled }: FormLayoutProps) => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="flex items-center px-4 py-3">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center text-gray-900 font-medium"
          >
            <ChevronLeft className="w-6 h-6 mr-1" />
            Back
          </button>
        </div>
      </div>

      <form onSubmit={onSubmit} className="flex-1 flex flex-col">
        <div className="flex-1 px-4 py-6 space-y-6">
          <h1 className="text-3xl font-bold text-gray-900">Submit a request</h1>
          {children}
        </div>

        <div className="sticky bottom-0 bg-white px-4 py-4 border-t border-gray-100">
          <button
            type="submit"
            disabled={isSubmitDisabled}
            className="w-full bg-black text-white py-4 rounded-full font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  )
}

export default FormLayout
