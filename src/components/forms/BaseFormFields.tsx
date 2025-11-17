import { X, Camera, Image as ImageIcon } from 'lucide-react'
import { useState, useRef } from 'react'

interface BaseFormFieldsProps {
  formData: {
    fullName: string
    phoneNumber: string
    phoneCode: string
    email: string
  }
  onFieldChange: (field: string, value: string) => void
}

export const BaseFormFields = ({ formData, onFieldChange }: BaseFormFieldsProps) => {
  return (
    <>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-900">
          Full name<span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.fullName}
          onChange={(e) => onFieldChange('fullName', e.target.value)}
          placeholder="Enter your name"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-0 focus:border-black"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-900">
          Phone number<span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2">
          <select
            value={formData.phoneCode}
            onChange={(e) => onFieldChange('phoneCode', e.target.value)}
            className="w-24 px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-0 focus:border-black"
          >
            <option value="+1">🇺🇸 +1</option>
            <option value="+86">🇨🇳 +86</option>
            <option value="+44">🇬🇧 +44</option>
          </select>
          <input
            type="tel"
            value={formData.phoneNumber}
            onChange={(e) => onFieldChange('phoneNumber', e.target.value)}
            placeholder="Enter phone number"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-0 focus:border-black"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-900">
          Email<span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => onFieldChange('email', e.target.value)}
          placeholder="Enter your email"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-0 focus:border-black"
        />
      </div>
    </>
  )
}

 

interface RadioGroupProps {
  label: string
  required?: boolean
  options: { value: string; label: string }[]
  selectedValue: string
  onChange: (value: string) => void
}

export const RadioGroup = ({ label, required, options, selectedValue, onChange }: RadioGroupProps) => {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-900">
        {label}{required && <span className="text-red-500">*</span>}
      </label>
      <div className="space-y-2">
        {options.map((option) => (
          <div key={option.value} className="relative">
            <label
              className={`flex items-center gap-3 px-4 py-3 border rounded-lg cursor-pointer transition-colors ${
                selectedValue === option.value
                  ? 'border-gray-900 bg-white'
                  : 'border-gray-300 bg-white hover:border-gray-400'
              }`}
            >
              <input
                type="radio"
                value={option.value}
                checked={selectedValue === option.value}
                onChange={(e) => onChange(e.target.value)}
                className="sr-only"
              />
              <span
                className={`inline-flex items-center justify-center w-5 h-5 rounded-full border ${
                  selectedValue === option.value ? 'border-black' : 'border-gray-400'
                }`}
              >
                {selectedValue === option.value && (
                  <span className="w-2.5 h-2.5 rounded-full bg-black" />
                )}
              </span>
              <span className="text-sm text-gray-900">{option.label}</span>
              {selectedValue === option.value && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    onChange('')
                  }}
                  className="ml-auto text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </label>
          </div>
        ))}
      </div>
    </div>
  )
}

interface ImageUploadProps {
  maxImages?: number
  onImagesChange: (files: File[]) => void
}

export const ImageUpload = ({ maxImages = 5, onImagesChange }: ImageUploadProps) => {
  const [images, setImages] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return

    const newImages = Array.from(files).slice(0, maxImages - images.length)
    const updatedImages = [...images, ...newImages]
    setImages(updatedImages)
    onImagesChange(updatedImages)
  }

  const handleTakePhoto = () => {
    cameraInputRef.current?.click()
  }

  const handleImageLibrary = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-900">
        Upload up to {maxImages} images
      </label>
      <div className="flex gap-3 border-2 border-dashed border-gray-300 rounded-lg p-4">
        <button
          type="button"
          onClick={handleTakePhoto}
          className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <Camera className="w-5 h-5" />
          Take photo
        </button>
        <div className="w-px bg-gray-300" />
        <button
          type="button"
          onClick={handleImageLibrary}
          className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <ImageIcon className="w-5 h-5" />
          Image library
        </button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />
      {images.length > 0 && (
        <div className="text-sm text-gray-600">
          {images.length} image{images.length > 1 ? 's' : ''} selected
        </div>
      )}
    </div>
  )
}
