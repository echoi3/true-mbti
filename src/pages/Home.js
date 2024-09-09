import React from 'react';
import SignUpButton from '../components/SignUpButton';

function Home() {
  return (
    <div className="flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Welcome to TrueMBTI</h2>
        <p className="mb-6 text-center">Get started with your MBTI journey today!</p>
        <SignUpButton />
      </div>
    </div>
  );
}

export default Home;