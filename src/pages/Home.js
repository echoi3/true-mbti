import React from 'react';
import SignUpButton from '../components/SignUpButton';
import HowItWorks from '../components/HowItWorks';
import MBTIDistribution from '../components/MBTIDistribution';

function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-100 to-purple-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-extrabold text-gray-900 sm:text-6xl md:text-7xl mb-6">
            Discover Your True MBTI
          </h1>
          <p className="mt-3 text-xl text-gray-600 sm:mt-5 sm:text-2xl max-w-2xl mx-auto">
            Understand your personality by having your friends and family take the test for you.
          </p>
          <div className="mt-8 flex justify-center">
            <div className="inline-flex rounded-md shadow">
              <SignUpButton />
            </div>
          </div>
        </div>
        
        <HowItWorks />
        <MBTIDistribution />
      </div>
    </div>
  );
}

export default Home;