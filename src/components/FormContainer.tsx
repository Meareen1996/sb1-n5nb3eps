import RideNotEndedForm from './forms/RideNotEndedForm'
import ChargedIncorrectlyForm from './forms/ChargedIncorrectlyForm'
import RideNotMoveForm from './forms/RideNotMoveForm'
import IssueNotListedForm from './forms/IssueNotListedForm'
import DeleteAccountForm from './forms/DeleteAccountForm'
import UnableToRideForm from './forms/UnableToRideForm'

interface FormContainerProps {
  issueType: string
  formId?: number
  onSuccess: () => void
}

const FormContainer = ({ issueType, formId, onSuccess }: FormContainerProps) => {
  const renderForm = () => {
    switch (issueType) {
      case 'ride-not-ended':
        return <RideNotEndedForm slug={issueType} formId={formId} onSuccess={onSuccess} />
      case 'vehicle-damaged':
        return <RideNotMoveForm slug={issueType} formId={formId} onSuccess={onSuccess} />
      case 'charged-incorrectly':
        return <ChargedIncorrectlyForm slug={issueType} formId={formId} onSuccess={onSuccess} />
      case 'delete-account':
        return <DeleteAccountForm slug={issueType} formId={formId} onSuccess={onSuccess} />
      case 'id-verification':
        return <UnableToRideForm slug={issueType} formId={formId} onSuccess={onSuccess} />
      case 'other':
        return <IssueNotListedForm slug={issueType} formId={formId} onSuccess={onSuccess} />
      default:
        return <IssueNotListedForm formId={formId} onSuccess={onSuccess} />
    }
  }

  return (
    <div className="max-w-md mx-auto">
      {renderForm()}
    </div>
  )
}

export default FormContainer
