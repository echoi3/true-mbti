import React from 'react';
import SignUpButton from '../components/SignUpButton';

function SignUp() {
  return (
    <div className="flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Sign Up for TrueMBTI</h2>
        <p className="mb-6 text-center">Use your Google account to sign up and get started with TrueMBTI.</p>
        <SignUpButton />
      </div>
    </div>
  );
}

export default SignUp;