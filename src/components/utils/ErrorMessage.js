import { Alert } from 'reactstrap';

// generic error message
export const ErrorMessage = ({ message }) => {
    return (
      <div className="text-center ">
        <Alert color='danger' className="text-center my-3">
          <h5><strong>{message}</strong> </h5>
        </Alert>
      </div>
    );
  };