import React from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';

function SignUp() {
  const navigate = useNavigate();

  const login = useGoogleLogin({
    onSuccess: (codeResponse) => {
      console.log(codeResponse);
      navigate('/dashboard');
    },
    onError: (error) => console.log('Login Failed:', error),
    flow: 'auth-code',
    ux_mode: 'popup',
  });

  return (
    <div className="flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Sign Up for TrueMBTI</h2>
        <p className="mb-6 text-center">Use your Google account to sign up and get started with TrueMBTI.</p>
        <button
          onClick={() => login()}
          className="w-full bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Sign up with Google
        </button>
      </div>
    </div>
  );
}

export default SignUp;