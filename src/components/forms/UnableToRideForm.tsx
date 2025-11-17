import { useState, useRef } from 'react'
import { X } from 'lucide-react'
import FormLayout from './FormLayout'
import { BaseFormFields, ImageUpload } from './BaseFormFields'

interface UnableToRideFormProps {
  onSuccess: () => void
}

const UnableToRideForm = ({ onSuccess }: UnableToRideFormProps) => {
  const [formData, setFormData] = useState({
    issue: "My ID won't verify.",
    fullName: '',
    phoneNumber: '',
    phoneCode: '+1',
    email: '',
    additionalDetails: '',
  })

  const [idFiles, setIdFiles] = useState<File[]>([])
  const [images, setImages] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFieldChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleIDFileSelect = (files: FileList | null) => {
    if (!files) return
    const newFiles = Array.from(files)
    setIdFiles((prev) => [...prev, ...newFiles])
  }

  const handleRemoveIDFile = (index: number) => {
    setIdFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted:', formData, idFiles, images)
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

      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-900">
          Attach a photo of the front and back of your ID<span className="text-red-500">*</span>
        </label>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full py-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
        >
          <span className="text-sm text-gray-600">
            Add files <span className="text-gray-500">here</span>
          </span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleIDFileSelect(e.target.files)}
          className="hidden"
        />
        {idFiles.length > 0 && (
          <div className="space-y-2">
            {idFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between px-4 py-3 border border-gray-300 rounded-lg bg-white"
              >
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  <span className="text-sm text-gray-900">{file.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveIDFile(index)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

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

export default UnableToRideForm
