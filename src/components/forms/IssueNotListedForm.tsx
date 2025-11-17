import { useState } from 'react'
import { X } from 'lucide-react'
import FormLayout from './FormLayout'
import { BaseFormFields, ImageUpload } from './BaseFormFields'

interface IssueNotListedFormProps {
  onSuccess: () => void
}

const IssueNotListedForm = ({ onSuccess }: IssueNotListedFormProps) => {
  const [formData, setFormData] = useState({
    issue: 'I have an issue not on this list',
    fullName: '',
    phoneNumber: '',
    phoneCode: '+1',
    email: '',
    description: '',
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

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-900">
          Describe your issue<span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleFieldChange('description', e.target.value)}
          placeholder="My issue is........"
          rows={6}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent resize-none"
        />
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
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent resize-none text-sm text-gray-600"
        />
      </div>
    </FormLayout>
  )
}

export default IssueNotListedForm
