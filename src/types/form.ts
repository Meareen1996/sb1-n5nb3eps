export interface BaseFormData {
  fullName: string
  phoneNumber: string
  phoneCode: string
  email: string
}

export interface RideNotEndedFormData extends BaseFormData {
  issue: string
  tripTime: string
  vehicleNumber: string
  rideMinutes: string
  vehicleParked: string
  experiencingIssues: string
  tookEndRidePhoto: string
  errorMessage: string
}

export interface ChargedIncorrectlyFormData extends BaseFormData {
  issue: string
  issueExperience: string
  chargeRelated: string
  depositAmount: string
  fineAmount: string
  vehicleNumber: string
  errorMessage: string
}

export interface RideNotMoveFormData extends BaseFormData {
  issue: string
  vehicleNumber: string
  accountLocked: string
  tripTime: string
  vehicleIssue: string
  damageDescription: string
}

export interface IssueNotListedFormData extends BaseFormData {
  issue: string
  description: string
}

export interface ZendeskSubmission {
  formType: string
  formData: BaseFormData | RideNotEndedFormData | ChargedIncorrectlyFormData | RideNotMoveFormData | IssueNotListedFormData
  images: File[]
  timestamp: string
}
