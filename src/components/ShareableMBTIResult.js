import React from 'react';

function ShareableMBTIResult({ mbtiResult, mbtiDistribution, getMbtiEmoji, getMbtiDescription, userName, testTakerCount }) {
  const renderDistributionBar = (leftLabel, rightLabel, percentage, leftLetter, rightLetter) => {
    const leftPercentage = parseFloat(percentage).toFixed(1);
    const rightPercentage = (100 - parseFloat(percentage)).toFixed(1);
    const isLeftDominant = parseFloat(leftPercentage) > 50;
    const dominantPercentage = isLeftDominant ? leftPercentage : rightPercentage;

    return (
      <div className="mb-3">
        <div className="flex justify-between text-sm mb-1">
          <span className="font-bold">{leftLetter} - {leftLabel}</span>
          <span className="font-bold">{rightLabel} - {rightLetter}</span>
        </div>
        <div className="flex h-6 rounded-full overflow-hidden relative">
          <div 
            className="bg-indigo-400 transition-all duration-500 ease-out flex items-center justify-center"
            style={{width: `${leftPercentage}%`}}
          >
            {isLeftDominant && (
              <span className="absolute text-xs font-bold text-white z-10">{dominantPercentage}%</span>
            )}
          </div>
          <div 
            className="bg-purple-400 transition-all duration-500 ease-out flex items-center justify-center"
            style={{width: `${rightPercentage}%`}}
          >
            {!isLeftDominant && (
              <span className="absolute text-xs font-bold text-white z-10">{dominantPercentage}%</span>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Extract first name
  const firstName = userName.split(' ')[0];

  return (
    <div className="flex items-center justify-center" style={{ width: '400px', height: '700px', backgroundColor: '#F0E6FA' }}>
      <div className="bg-white rounded-lg overflow-hidden shadow-lg" style={{ width: '360px', height: '680px' }}>
        <div className="bg-indigo-600 px-4 py-3">
          <h1 className="text-xl font-bold text-white text-center">{firstName}'s True MBTI</h1>
        </div>
        <div className="p-4 flex flex-col justify-between" style={{ height: 'calc(680px - 3rem)' }}>
          <div>
            <div className="flex flex-col items-center justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-indigo-200 flex items-center justify-center mb-2">
                <span className="text-3xl">{getMbtiEmoji(mbtiResult)}</span>
              </div>
              <div className="text-3xl font-bold text-indigo-800 mt-2">{mbtiResult}</div>
              <p className="text-sm text-gray-600 mt-2 text-center">
                According to {testTakerCount} {testTakerCount === 1 ? 'individual' : 'individuals'} who took the MBTI test on behalf of {firstName}
              </p>
            </div>
            <p className="text-center text-indigo-600 mb-6 text-sm font-bold">
              {getMbtiDescription(mbtiResult)}
            </p>
            {renderDistributionBar('Extroverted', 'Introverted', mbtiDistribution.EI, 'E', 'I')}
            {renderDistributionBar('Intuitive', 'Observant', mbtiDistribution.NS, 'N', 'S')}
            {renderDistributionBar('Thinking', 'Feeling', mbtiDistribution.TF, 'T', 'F')}
            {renderDistributionBar('Judging', 'Prospecting', mbtiDistribution.JP, 'J', 'P')}
          </div>
          <p className="text-center text-indigo-600 mt-4 text-base">
            Find out your true MBTI at <span className="font-bold">truembti.com</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ShareableMBTIResult;