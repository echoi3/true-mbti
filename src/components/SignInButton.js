// src/components/SignInButton.js
import React from 'react';
import { GoogleLogin } from '@react-oauth/google';

function SignInButton() {
  return (
    <div className="flex items-center">
      <span className="text-white mr-4">Sign In</span>
      <GoogleLogin
        onSuccess={credentialResponse => {
          console.log(credentialResponse);
        }}
        onError={() => {
          console.log('Login Failed');
        }}
        useOneTap
      />
    </div>
  );
}

export default SignInButton;