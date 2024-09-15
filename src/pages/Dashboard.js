import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { generateUniqueUrl } from '../utils/urlGenerator';
import { motion } from 'framer-motion';
import { toPng } from 'html-to-image';
import ShareableMBTIResult from '../components/ShareableMBTIResult';

function Dashboard() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [uniqueUrl, setUniqueUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mbtiResult, setMbtiResult] = useState(null);
  const [mbtiDistribution, setMbtiDistribution] = useState(null);
  const [submissionCount, setSubmissionCount] = useState(0);
  const [urlGenerated, setUrlGenerated] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const mbtiResultRef = useRef(null);
  const shareableRef = useRef(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setIsAuthenticated(true);
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserData(data);
            setUniqueUrl(data.uniqueUrl || null);

            // Calculate average MBTI results
            if (data.mbtiResults && data.mbtiResults.length > 0) {
              const averageResult = calculateAverageMBTI(data.mbtiResults);
              setMbtiResult(averageResult.result);
              setMbtiDistribution(averageResult.distribution);
            } else {
              setMbtiResult(null);
              setMbtiDistribution(null);
            }

            if (data.mbtiResults) {
              setSubmissionCount(data.mbtiResults.length);
            }

            if (!data.uniqueUrl) {
              const newUniqueUrl = await generateUniqueUrl(user.uid);
              setUniqueUrl(newUniqueUrl);
            }
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setMbtiResult('Error');
        }
      } else {
        setIsAuthenticated(false);
        setUserData(null);
        setUniqueUrl(null);
        setMbtiResult(null);
        setMbtiDistribution(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const calculateAverageMBTI = (results) => {
    const totalTests = results.length;
    const distribution = {
      EI: 0,
      NS: 0,
      TF: 0,
      JP: 0
    };

    results.forEach(result => {
      distribution.EI += result.distribution.EI;
      distribution.NS += result.distribution.NS;
      distribution.TF += result.distribution.TF;
      distribution.JP += result.distribution.JP;
    });

    // Calculate averages
    for (let key in distribution) {
      distribution[key] /= totalTests;
    }

    const averageResult = 
      (distribution.EI > 50 ? 'E' : 'I') +
      (distribution.NS > 50 ? 'N' : 'S') +
      (distribution.TF > 50 ? 'T' : 'F') +
      (distribution.JP > 50 ? 'J' : 'P');

    return { result: averageResult, distribution };
  };

  const getMbtiDescription = (mbti) => {
    const descriptions = {
      ISTJ: "🏛️ Quiet, serious, earn success by thoroughness and dependability.",
      ISFJ: "🤝 Quiet, friendly, responsible, and conscientious.",
      INFJ: "🔮 Seek meaning and connection in ideas, relationships, and material possessions.",
      INTJ: "🧠 Have original minds and great drive for implementing their ideas and achieving their goals.",
      ISTP: "🛠️ Tolerant and flexible, quiet observers until a problem appears, then act quickly to find workable solutions.",
      ISFP: "🎨 Quiet, friendly, sensitive, and kind. Enjoy the present moment, what's going on around them.",
      INFP: "🌿 Idealistic, loyal to their values and to people who are important to them.",
      INTP: "💡 Seek to develop logical explanations for everything that interests them.",
      ESTP: "🏄 Flexible and tolerant, they take a pragmatic approach focused on immediate results.",
      ESFP: "🎉 Outgoing, friendly, and accepting. Exuberant lovers of life, people, and material comforts.",
      ENFP: "🌈 Warmly enthusiastic and imaginative. See life as full of possibilities.",
      ENTP: "🎭 Quick, ingenious, stimulating, alert, and outspoken.",
      ESTJ: "📊 Practical, realistic, matter-of-fact. Decisive, quickly move to implement decisions.",
      ESFJ: "🤗 Warmhearted, conscientious, and cooperative. Want harmony in their environment.",
      ENFJ: "🌻 Warm, empathetic, responsive, and responsible.",
      ENTJ: "👑 Frank, decisive, assume leadership readily."
    };
    return descriptions[mbti] || "A unique combination of personality traits.";
  };

  const getMbtiEmoji = (mbti) => {
    const emojis = {
      ISTJ: "⚖️", ISFJ: "🏠", INFJ: "🔮", INTJ: "🔬",
      ISTP: "🛠️", ISFP: "🎨", INFP: "🌿", INTP: "🧩",
      ESTP: "🏄‍♂️", ESFP: "🎭", ENFP: "🦋", ENTP: "💡",
      ESTJ: "📊", ESFJ: "🤗", ENFJ: "🌻", ENTJ: "🏆"
    };
    return emojis[mbti] || "🧠";
  };

  const renderDistributionBar = (leftLabel, rightLabel, percentage, leftLetter, rightLetter) => {
    const leftPercentage = parseFloat(percentage).toFixed(1);
    const rightPercentage = (100 - parseFloat(percentage)).toFixed(1);
    const isLeftDominant = parseFloat(leftPercentage) > 50;
    const dominantPercentage = isLeftDominant ? leftPercentage : rightPercentage;

    return (
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="font-semibold">{leftLetter} - {leftLabel}</span>
          <span className="font-semibold">{rightLetter} - {rightLabel}</span>
        </div>
        <div className="flex h-8 rounded-full overflow-hidden relative">
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

  const handleShareResult = async () => {
    console.log('Share button clicked');
    if (shareableRef.current && mbtiResult && mbtiDistribution && userData) {
      try {
        console.log('Attempting to generate image');
        
        // Add a small delay to ensure content is rendered
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const scale = 3; // Increase the scale for better quality on high-DPI screens
        const dataUrl = await toPng(shareableRef.current, {
          quality: 0.95, // Increase quality
          pixelRatio: scale,
          width: 360 * scale, // Match the width of ShareableMBTIResult
          height: 660 * scale, // Match the height of ShareableMBTIResult
          style: {
            backgroundColor: '#F0E6FA', // Match the background color of ShareableMBTIResult
          },
        });
        console.log('Image generated successfully');

        if (navigator.share) {
          console.log('Web Share API is available');
          try {
            const response = await fetch(dataUrl);
            const blob = await response.blob();
            const file = new File([blob], 'my-mbti-result.png', { type: 'image/png' });
            await navigator.share({
              files: [file],
              title: 'My MBTI Result',
              text: 'Check out my MBTI result!',
            });
            console.log('MBTI result shared successfully');
          } catch (error) {
            if (error.name === 'AbortError') {
              console.log('Share cancelled by user');
            } else {
              console.error('Error sharing MBTI result:', error);
              // Fallback to download for desktop
              const link = document.createElement('a');
              link.download = 'my-mbti-result.png';
              link.href = dataUrl;
              link.click();
            }
          }
        } else {
          console.log('Web Share API not available, falling back to download');
          const link = document.createElement('a');
          link.download = 'my-mbti-result.png';
          link.href = dataUrl;
          link.click();
        }
      } catch (error) {
        console.error('Error generating image:', error);
      }
    } else {
      console.error('MBTI result, distribution, or user data is not available, or shareableRef is null');
      console.log('shareableRef:', shareableRef.current);
      console.log('mbtiResult:', mbtiResult);
      console.log('mbtiDistribution:', mbtiDistribution);
      console.log('userData:', userData);
    }
  };

  const handleCopyUrl = async () => {
    if (uniqueUrl) {
      try {
        await navigator.clipboard.writeText(uniqueUrl);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 3000); // Hide message after 3 seconds
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-100 to-purple-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white shadow-xl rounded-lg overflow-hidden"
        >
          <div className="bg-indigo-600 px-4 py-3">
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          </div>
          {userData && (
            <div className="px-4 py-3">
              <h2 className="text-xl font-bold mb-2">Welcome, {userData.name.split(' ')[0]}!</h2>
              <p className="text-sm text-gray-600 mb-4">Email: {userData.email}</p>
              <p className="text-base font-semibold text-indigo-600 mb-2">
                {submissionCount === 0 
                  ? "Share your MBTI test link with others so that they can submit the test for you!"
                  : submissionCount === 1 
                    ? "1 amazing individual has submitted a test for you" 
                    : `${submissionCount} amazing individuals have submitted tests for you`}
              </p>
            </div>
          )}
          {mbtiResult && mbtiDistribution && (
            <div ref={mbtiResultRef} className="bg-indigo-50 rounded-lg p-6 mt-2 mb-6">
              <h3 className="text-xl font-semibold text-indigo-800 mb-4">Your True MBTI:</h3>
              <div className="flex flex-col items-center justify-center mb-6">
                <div className="w-20 h-20 rounded-full bg-indigo-200 flex items-center justify-center mb-2">
                  <span className="text-3xl">{getMbtiEmoji(mbtiResult)}</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-3xl font-bold text-indigo-800 mt-2">{mbtiResult}</span>
                </div>
              </div>
              <p className="text-center text-indigo-600 font-medium mb-6">
                {getMbtiDescription(mbtiResult)}
              </p>
              {renderDistributionBar('Extroverted', 'Introverted', mbtiDistribution.EI, 'E', 'I')}
              {renderDistributionBar('Intuitive', 'Observant', mbtiDistribution.NS, 'N', 'S')}
              {renderDistributionBar('Thinking', 'Feeling', mbtiDistribution.TF, 'T', 'F')}
              {renderDistributionBar('Judging', 'Prospecting', mbtiDistribution.JP, 'J', 'P')}
            </div>
          )}
          {uniqueUrl && (
            <div className="bg-indigo-50 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-medium text-indigo-800 mb-2">Your unique MBTI test URL:</h3>
              <div className="flex items-center mb-2">
                <input
                  type="text"
                  value={uniqueUrl || 'Generating URL...'}
                  readOnly
                  className="flex-grow bg-white border border-gray-300 rounded-l-md py-2 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-0"
                />
                <button
                  onClick={handleCopyUrl}
                  disabled={!uniqueUrl}
                  className="bg-indigo-600 text-white rounded-r-md px-4 py-2 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 whitespace-nowrap flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Copy
                </button>
              </div>
              {copySuccess && (
                <div className="mt-2 p-2 bg-green-100 border border-green-400 text-green-700 rounded-md flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">URL copied successfully!</span>
                </div>
              )}
            </div>
          )}
          <div className="px-4 py-3">
            {/* Hidden shareable component */}
            <div className="hidden">
              <div ref={shareableRef} className="flex items-center justify-center" style={{ width: '400px', height: '700px', backgroundColor: '#F0E6FA' }}>
                {mbtiResult && mbtiDistribution && userData && (
                  <ShareableMBTIResult
                    mbtiResult={mbtiResult}
                    mbtiDistribution={mbtiDistribution}
                    getMbtiEmoji={getMbtiEmoji}
                    getMbtiDescription={getMbtiDescription}
                    userName={userData.name}
                    testTakerCount={userData.mbtiResults ? userData.mbtiResults.length : 0}
                  />
                )}
              </div>
            </div>

            {/* Share button */}
            <button
              onClick={handleShareResult}
              disabled={!mbtiResult || !mbtiDistribution}
              className="w-full bg-green-600 text-white rounded-md px-4 py-2 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Share My Result
            </button>

            <button
              onClick={handleSignOut}
              className="w-full bg-red-600 text-white rounded-md px-4 py-2 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Sign Out
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Dashboard;