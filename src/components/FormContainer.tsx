import RideNotEndedForm from './forms/RideNotEndedForm'
import ChargedIncorrectlyForm from './forms/ChargedIncorrectlyForm'
import RideNotMoveForm from './forms/RideNotMoveForm'
import IssueNotListedForm from './forms/IssueNotListedForm'
import DeleteAccountForm from './forms/DeleteAccountForm'
import UnableToRideForm from './forms/UnableToRideForm'

interface FormContainerProps {
  issueType: string
  onBack: () => void
  onSuccess: () => void
}

const FormContainer = ({ issueType, onSuccess }: FormContainerProps) => {
  const renderForm = () => {
    switch (issueType) {
      case 'ride-not-ended':
        return <RideNotEndedForm onSuccess={onSuccess} />
      case 'charged-incorrectly':
        return <ChargedIncorrectlyForm onSuccess={onSuccess} />
      case 'ride-not-move':
        return <RideNotMoveForm onSuccess={onSuccess} />
      case 'delete-account':
        return <DeleteAccountForm onSuccess={onSuccess} />
      case 'unable-to-ride':
        return <UnableToRideForm onSuccess={onSuccess} />
      case 'issue-not-listed':
        return <IssueNotListedForm onSuccess={onSuccess} />
      default:
        return null
    }
  }

  return (
    <div className="max-w-md mx-auto">
      {renderForm()}
    </div>
  )
}

export default FormContainer
