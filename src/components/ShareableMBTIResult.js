import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

function ShareableMBTIResult({ mbtiResult, mbtiDistribution, getMbtiEmoji, getMbtiDescription, userName, testTakerCount }) {
  const intl = useIntl();

  const renderDistributionBar = (leftLabel, rightLabel, percentage, leftLetter, rightLetter) => {
    const leftPercentage = parseFloat(percentage).toFixed(1);
    const rightPercentage = (100 - parseFloat(percentage)).toFixed(1);
    const isLeftDominant = parseFloat(leftPercentage) > 50;
    const dominantPercentage = isLeftDominant ? leftPercentage : rightPercentage;

    return (
      <div className="mb-3">
        <div className="flex justify-between text-sm mb-1">
          <span className="font-bold">{leftLetter} - {leftLabel}</span>
          <span className="font-bold">{rightLetter} - {rightLabel}</span>
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
    <div className="flex items-center justify-center" style={{ width: '400px', height: '700px' }}>
      <div className="bg-white rounded-lg overflow-hidden" style={{ width: '360px', height: '680px' }}>
        <div className="bg-indigo-600 px-4 py-3">
          <h1 className="text-xl font-bold text-white text-center">
            <FormattedMessage id="shareableMBTI.yourTrueMBTI" values={{ name: firstName }} />
          </h1>
        </div>
        <div className="p-4 flex flex-col justify-between" style={{ height: 'calc(680px - 3rem)' }}>
          <div>
            <div className="flex flex-col items-center justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-indigo-200 flex items-center justify-center mb-2">
                <span className="text-3xl">{getMbtiEmoji(mbtiResult)}</span>
              </div>
              <div className="text-3xl font-bold text-indigo-800 mt-2">{mbtiResult}</div>
              <p className="text-sm text-gray-600 mt-2">
                <FormattedMessage 
                  id="result.description" 
                  values={{ name: firstName, count: testTakerCount }}
                />
              </p>
            </div>
            <p className="text-indigo-600 mb-6 text-sm font-bold">
              <FormattedMessage id={`mbti.description.${mbtiResult}`} />
            </p>
            {renderDistributionBar(
              intl.formatMessage({id: 'mbti.trait.extroverted'}),
              intl.formatMessage({id: 'mbti.trait.introverted'}),
              mbtiDistribution.EI, 'E', 'I'
            )}
            {renderDistributionBar(
              intl.formatMessage({id: 'mbti.trait.intuitive'}),
              intl.formatMessage({id: 'mbti.trait.observant'}),
              mbtiDistribution.NS, 'N', 'S'
            )}
            {renderDistributionBar(
              intl.formatMessage({id: 'mbti.trait.thinking'}),
              intl.formatMessage({id: 'mbti.trait.feeling'}),
              mbtiDistribution.TF, 'T', 'F'
            )}
            {renderDistributionBar(
              intl.formatMessage({id: 'mbti.trait.judging'}),
              intl.formatMessage({id: 'mbti.trait.prospecting'}),
              mbtiDistribution.JP, 'J', 'P'
            )}
          </div>
          <p className="text-center text-indigo-600 mt-4 text-base">
            {intl.formatMessage({ id: "shareable.findOutMore" })}
          </p>
        </div>
      </div>
    </div>
  );
}

export default ShareableMBTIResult;