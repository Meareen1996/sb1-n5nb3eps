import { useState } from 'react'
import { X } from 'lucide-react'
import FormLayout from './FormLayout'
import { BaseFormFields, RadioGroup, ImageUpload } from './BaseFormFields'

interface ChargedIncorrectlyFormProps {
  onSuccess: () => void
}

const ChargedIncorrectlyForm = ({ onSuccess }: ChargedIncorrectlyFormProps) => {
  const [formData, setFormData] = useState({
    issue: 'I was charged incorrectly.',
    fullName: '',
    phoneNumber: '',
    phoneCode: '+1',
    email: '',
    issueExperience: '',
    chargeDate: '',
    chargeAmount: '',
    additionalDetails: '',
  })

  const [images, setImages] = useState<File[]>([])

  const handleFieldChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted:', formData, images)
    onSuccess()
  }

  const showChargeFields = ['fare-incorrect', 'membership-incorrect', 'pass-incorrect', 'topup-didnt-go', 'overcharged-topup', 'fine-violation'].includes(formData.issueExperience)

  return (
    <FormLayout onBack={() => window.history.back()} onSubmit={handleSubmit}>
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

      <RadioGroup
        label="What issue are you experiencing?"
        required
        options={[
          { value: 'fare-incorrect', label: 'The fare charged for my ride was incorrect.' },
          { value: 'membership-incorrect', label: 'I was charged incorrectly for my membership.' },
          { value: 'pass-incorrect', label: 'I was charged incorrectly for my pass.' },
          { value: 'topup-didnt-go', label: "My top-up didn't go through." },
          { value: 'overcharged-topup', label: 'I was overcharged for my top-up.' },
          { value: 'fine-violation', label: 'I received a fine/violation.' },
          { value: 'other', label: 'Other' },
        ]}
        selectedValue={formData.issueExperience}
        onChange={(value) => handleFieldChange('issueExperience', value)}
      />

      {showChargeFields && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-900">
            Date and amount of charge<span className="text-red-500">*</span>
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={formData.chargeDate}
              onChange={(e) => handleFieldChange('chargeDate', e.target.value)}
              placeholder="02/07/2024"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            />
            <input
              type="text"
              value={formData.chargeAmount}
              onChange={(e) => handleFieldChange('chargeAmount', e.target.value)}
              placeholder="$10.00"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>
        </div>
      )}

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
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent resize-none text-sm text-gray-600"
        />
      </div>
    </FormLayout>
  )
}

export default ChargedIncorrectlyForm
