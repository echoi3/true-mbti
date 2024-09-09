import React from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  const login = useGoogleLogin({
    onSuccess: (codeResponse) => {
      console.log(codeResponse);
      navigate('/dashboard');
    },
    onError: (error) => console.log('Login Failed:', error)
  });

  return (
    <div className="flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Welcome to TrueMBTI</h2>
        <p className="mb-6 text-center">Sign in with Google to get started:</p>
        <button
          onClick={() => login()}
          className="w-full bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}

export default Home;