import React from 'react';

const ShareableMBTIResult = ({ mbtiResult, mbtiDistribution, getMbtiEmoji, getMbtiDescription }) => {
  if (!mbtiResult || !mbtiDistribution) {
    return <div>Loading MBTI result...</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg" style={{ width: '100%', maxWidth: '500px' }}>
      <h3 className="text-2xl font-semibold text-indigo-800 mb-6 text-center">Your Average MBTI:</h3>
      <div className="flex flex-col items-center justify-center mb-6">
        <div className="w-24 h-24 rounded-full bg-indigo-200 flex items-center justify-center mb-4">
          <span className="text-4xl">{getMbtiEmoji(mbtiResult)}</span>
        </div>
        <span className="text-4xl font-bold text-indigo-800 mb-2">{mbtiResult}</span>
        <p className="text-lg text-center text-indigo-600 font-medium mb-6">
          {getMbtiDescription(mbtiResult)}
        </p>
      </div>
      {/* ... distribution bars ... */}
    </div>
  );
};

export default ShareableMBTIResult;