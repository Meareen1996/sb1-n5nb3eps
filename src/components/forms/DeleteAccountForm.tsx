import { useState } from 'react'
import { X, Check } from 'lucide-react'
import FormLayout from './FormLayout'
import { appBridge } from '../../services/appBridge'
import { BaseFormFields, ImageUpload } from './BaseFormFields'
import { zendeskService } from '../../services/zendesk'

interface DeleteAccountFormProps {
  onSuccess: () => void
  formId?: number
  slug: string
}

const DeleteAccountForm = ({ onSuccess, formId, slug }: DeleteAccountFormProps) => {
  const [formData, setFormData] = useState({
    issue: 'I want to delete my account.',
    fullName: '',
    phoneNumber: '',
    phoneCode: '+1',
    email: '',
    reason: '',
    acknowledged: false,
    additionalDetails: '',
  })

  const [images, setImages] = useState<File[]>([])
  const [showReasonDropdown, setShowReasonDropdown] = useState(false)

  const reasons = [
    'Privacy concerns',
    'Not using the service',
    'Found alternative service',
    'Too expensive',
    'Other',
  ]

  const handleFieldChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleReasonSelect = (reason: string) => {
    handleFieldChange('reason', reason)
    setShowReasonDropdown(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const description = [
      `Issue: ${formData.issue}`,
      formData.reason && `Reason: ${formData.reason}`,
      formData.acknowledged ? 'Acknowledged: yes' : 'Acknowledged: no',
      images.length > 0 && `Attached images: ${images.map(f => f.name).join(', ')}`,
      formData.additionalDetails && `Details: ${formData.additionalDetails}`,
      `User: ${formData.fullName} | ${formData.phoneCode} ${formData.phoneNumber} | ${formData.email}`,
    ].filter(Boolean).join('\n')

    const result = await zendeskService.submitTicket({
      formId: formId,
      slug,
      fields: {
        subject: formData.issue,
        description,
      },
    })

    if (result.success) {
      onSuccess()
    } else {
      alert(result.error || 'Submit failed')
    }
  }

  return (
    <FormLayout onBack={() => appBridge.goBack()} onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-900">
          What is the issue?<span className="text-red-500">*</span>
        </label>
        <div className="flex items-center justify-between px-4 py-3 border border-gray-300 rounded-lg bg-white">
          <span className="text-sm text-gray-900">{formData.issue}</span>
          <button type="button" className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <BaseFormFields formData={formData} onFieldChange={handleFieldChange} />

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-900">
          Reason for deleting account<span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowReasonDropdown(!showReasonDropdown)}
            className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-lg bg-white text-left"
          >
            <span className={`text-sm ${formData.reason ? 'text-gray-900' : 'text-gray-500'}`}>
              {formData.reason || 'select a reason'}
            </span>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showReasonDropdown && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
              {reasons.map((reason, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleReasonSelect(reason)}
                  className="w-full px-4 py-3 text-left text-sm text-gray-900 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                >
                  {reason}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-900">
          Acknowledge that proceeding to delete your account will permanently delete any data associated with your account, and unused funds in your Veo wallet will be forfeited.<span className="text-red-500">*</span>
        </label>
        <button
          type="button"
          onClick={() => handleFieldChange('acknowledged', !formData.acknowledged)}
          className={`flex items-center gap-3 px-4 py-3 border rounded-lg transition-colors ${
            formData.acknowledged
              ? 'border-gray-900 bg-white'
              : 'border-gray-300 bg-white hover:border-gray-400'
          }`}
        >
          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
            formData.acknowledged ? 'bg-black border-black' : 'border-gray-300'
          }`}>
            {formData.acknowledged && <Check className="w-4 h-4 text-white" />}
          </div>
          <span className="text-sm text-gray-900">I acknowledge</span>
        </button>
      </div>

      <ImageUpload maxImages={5} onImagesChange={setImages} />

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-900">
          Tell us more about your issue
        </label>
        <textarea
          value={formData.additionalDetails}
          onChange={(e) => handleFieldChange('additionalDetails', e.target.value)}
          placeholder="Could you provide more details so we can better understand the issue?"
          rows={5}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-0 focus:border-black resize-none text-sm text-gray-600"
        />
      </div>
    </FormLayout>
  )
}

export default DeleteAccountForm
