import React, { useState } from 'react';
import { confirmSignUp } from 'aws-amplify/auth';
import { useLocation, useNavigate } from 'react-router-dom';

const ConfirmSignup = () => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  if (!email) {
    navigate('/signup');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await confirmSignUp({
        username: email,
        confirmationCode: code
      });
      navigate('/login');
    } catch (err) {
      console.error('Error confirming sign up:', err);
      setError(err.message || 'Failed to confirm sign up');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      await confirmSignUp({
        username: email,
        confirmationCode: ''
      });
      alert('Confirmation code resent!');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Confirm your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please enter the confirmation code sent to {email}
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}
          <div>
            <label htmlFor="code" className="sr-only">
              Confirmation Code
            </label>
            <input
              id="code"
              name="code"
              type="text"
              required
              className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Enter confirmation code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {loading ? 'Confirming...' : 'Confirm'}
            </button>
          </div>

          <div className="text-sm text-center">
            <button
              type="button"
              onClick={handleResendCode}
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Didn't receive the code? Resend
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConfirmSignup; 