import { useState } from 'react'
import { X } from 'lucide-react'
import FormLayout from './FormLayout'
import { BaseFormFields, RadioGroup, ImageUpload } from './BaseFormFields'

interface RideNotEndedFormProps {
  onSuccess: () => void
}

const RideNotEndedForm = ({ onSuccess }: RideNotEndedFormProps) => {
  const [formData, setFormData] = useState({
    issue: "My ride hasn't ended.",
    fullName: '',
    phoneNumber: '',
    phoneCode: '+1',
    email: '',
    tripTime: '',
    vehicleNumber: '',
    rideMinutes: '',
    vehicleParked: '',
    experiencingIssues: '',
    tookEndRidePhoto: '',
    errorMessage: '',
    additionalDetails: '',
  })

  const [images, setImages] = useState<File[]>([])
  const [showTripDropdown, setShowTripDropdown] = useState(false)

  const mockTrips = [
    '03/11 8:16AM - 03/11 8:19AM (0.523 mi)',
    '03/10 5:30PM - 03/10 5:45PM (1.2 mi)',
    'My trip is not on the list',
  ]

  const handleFieldChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleTripSelect = (trip: string) => {
    handleFieldChange('tripTime', trip)
    setShowTripDropdown(false)
  }

  const handleRemoveTrip = () => {
    handleFieldChange('tripTime', '')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted:', formData, images)
    onSuccess()
  }

  const showConditionalFields = formData.experiencingIssues === 'didnt-end'

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
          Which trip did this happen in?<span className="text-red-500">*</span>
        </label>
        {formData.tripTime ? (
          <div className="flex items-center justify-between px-4 py-3 border border-gray-300 rounded-lg bg-white">
            <span className="text-sm text-gray-900">{formData.tripTime}</span>
            <button
              type="button"
              onClick={handleRemoveTrip}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowTripDropdown(!showTripDropdown)}
              className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-lg bg-white text-left"
            >
              <span className="text-sm text-gray-500">Select a trip</span>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showTripDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                {mockTrips.map((trip, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleTripSelect(trip)}
                    className="w-full px-4 py-3 text-left text-sm text-gray-900 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                  >
                    {trip}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-900">
          Vehicle number<span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.vehicleNumber}
          onChange={(e) => handleFieldChange('vehicleNumber', e.target.value)}
          placeholder="1234567788998"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent bg-gray-50"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-900">
          How long did you ride for? (in minutes)<span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          value={formData.rideMinutes}
          onChange={(e) => handleFieldChange('rideMinutes', e.target.value)}
          placeholder="6"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
        />
      </div>

      <RadioGroup
        label="Is the vehicle properly parked, in a safe to park zone and is locked as required?"
        required
        options={[
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' },
        ]}
        selectedValue={formData.vehicleParked}
        onChange={(value) => handleFieldChange('vehicleParked', value)}
      />

      <RadioGroup
        label="Are you experiencing any of the following issues?"
        required
        options={[
          { value: 'cant-tap', label: 'I can\'t tap "End Ride" in parking zone(s).' },
          { value: 'didnt-end', label: 'Ride didn\'t end after tapping "End Ride".' },
          { value: 'other', label: 'Other' },
        ]}
        selectedValue={formData.experiencingIssues}
        onChange={(value) => handleFieldChange('experiencingIssues', value)}
      />

      {showConditionalFields && (
        <>
          <RadioGroup
            label="Did you take an end ride photo and keep the app open until you saw the Trip Summary screen?"
            options={[
              { value: 'yes', label: 'Yes' },
              { value: 'no', label: 'No' },
            ]}
            selectedValue={formData.tookEndRidePhoto}
            onChange={(value) => handleFieldChange('tookEndRidePhoto', value)}
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-900">
              Did you receive an error message and if so, what was that error message?
            </label>
            <input
              type="text"
              value={formData.errorMessage}
              onChange={(e) => handleFieldChange('errorMessage', e.target.value)}
              placeholder="Enter error message"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>
        </>
      )}

      {formData.experiencingIssues === 'other' && (
        <div className="space-y-2">
          <textarea
            value={formData.additionalDetails}
            onChange={(e) => handleFieldChange('additionalDetails', e.target.value)}
            placeholder="Enter message"
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent resize-none"
          />
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

export default RideNotEndedForm
