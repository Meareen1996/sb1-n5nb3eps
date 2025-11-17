import { ChevronLeft } from 'lucide-react'
import { appBridge } from '../services/appBridge'

const SuccessPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="flex items-center px-4 py-3">
          <button
            onClick={() => appBridge.goBack()}
            className="flex items-center text-gray-900 font-medium"
          >
            <ChevronLeft className="w-6 h-6 mr-1" />
            Back
          </button>
        </div>
      </div>

      <div className="px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Submit a request</h1>

        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Request submitted!</h2>
          <p className="text-base text-gray-700 leading-relaxed">
            Thank you for your submission. A member of our Customer Support team is looking
            into it and will follow up at the email you provided, so keep an eye on your inbox!
          </p>
        </div>
      </div>
    </div>
  )
}

export default SuccessPage
