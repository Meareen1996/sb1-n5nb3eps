import { useState } from 'react'
import { X } from 'lucide-react'
import FormLayout from './FormLayout'
import { appBridge } from '../../services/appBridge'
import { BaseFormFields, RadioGroup, ImageUpload } from './BaseFormFields'
import { zendeskService } from '../../services/zendesk'

interface RideNotMoveFormProps {
  onSuccess: () => void
  formId?: number
  slug: string
}

const RideNotMoveForm = ({ onSuccess, formId, slug }: RideNotMoveFormProps) => {
  const [formData, setFormData] = useState({
    issue: "The vehicle didn't move or was damaged.",
    fullName: '',
    phoneNumber: '',
    phoneCode: '+1',
    email: '',
    vehicleIssue: '',
    unlocked: '',
    additionalDetails: '',
  })

  const [images, setImages] = useState<File[]>([])

  const handleFieldChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const description = [
      `Issue: ${formData.issue}`,
      `Vehicle issue: ${formData.vehicleIssue}`,
      images.length > 0 && `Attached images: ${images.map(f => f.name).join(', ')}`,
      formData.additionalDetails && `Details: ${formData.additionalDetails}`,
      `Unlocked: ${formData.unlocked}`,
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

      <RadioGroup
        label="What issue are you experiencing?"
        required
        options={[
          { value: 'throttle', label: "Ride didn't move or was slow after using the throttle." },
          { value: 'kickstand', label: 'Kickstand issue.' },
          { value: 'seat', label: 'Seat issue.' },
          { value: 'light', label: 'Light issue.' },
          { value: 'other', label: 'Other' },
        ]}
        selectedValue={formData.vehicleIssue}
        onChange={(value) => handleFieldChange('vehicleIssue', value)}
      />

      {formData.vehicleIssue === 'other' && (
        <div className="space-y-2">
          <textarea
            value={formData.additionalDetails}
            onChange={(e) => handleFieldChange('additionalDetails', e.target.value)}
            placeholder="Enter message"
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-0 focus:border-black resize-none"
          />
        </div>
      )}

      <RadioGroup
        label="Is this a vehicle you successfully unlocked in the app?"
        options={[
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' },
        ]}
        selectedValue={formData.unlocked}
        onChange={(value) => handleFieldChange('unlocked', value)}
      />

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

export default RideNotMoveForm
