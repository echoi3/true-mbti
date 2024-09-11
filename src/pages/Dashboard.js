import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { generateUniqueUrl } from '../utils/urlGenerator';
import { motion } from 'framer-motion';

function Dashboard() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [uniqueUrl, setUniqueUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mbtiResult, setMbtiResult] = useState(null);
  const [mbtiDistribution, setMbtiDistribution] = useState(null);
  const [submissionCount, setSubmissionCount] = useState(0);

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

  const handleGenerateUrl = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        const newUniqueUrl = await generateUniqueUrl(user.uid);
        setUniqueUrl(newUniqueUrl);
        
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        }
      } catch (error) {
        console.error('Error generating unique URL:', error);
      }
    } else {
      console.error('No authenticated user found');
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
      ISTJ: "Quiet, serious, earn success by thoroughness and dependability.",
      ISFJ: "Quiet, friendly, responsible, and conscientious.",
      INFJ: "Seek meaning and connection in ideas, relationships, and material possessions.",
      INTJ: "Have original minds and great drive for implementing their ideas and achieving their goals.",
      ISTP: "Tolerant and flexible, quiet observers until a problem appears, then act quickly to find workable solutions.",
      ISFP: "Quiet, friendly, sensitive, and kind. Enjoy the present moment, what's going on around them.",
      INFP: "Idealistic, loyal to their values and to people who are important to them.",
      INTP: "Seek to develop logical explanations for everything that interests them.",
      ESTP: "Flexible and tolerant, they take a pragmatic approach focused on immediate results.",
      ESFP: "Outgoing, friendly, and accepting. Exuberant lovers of life, people, and material comforts.",
      ENFP: "Warmly enthusiastic and imaginative. See life as full of possibilities.",
      ENTP: "Quick, ingenious, stimulating, alert, and outspoken.",
      ESTJ: "Practical, realistic, matter-of-fact. Decisive, quickly move to implement decisions.",
      ESFJ: "Warmhearted, conscientious, and cooperative. Want harmony in their environment.",
      ENFJ: "Warm, empathetic, responsive, and responsible.",
      ENTJ: "Frank, decisive, assume leadership readily."
    };
    return descriptions[mbti] || "A unique combination of personality traits.";
  };

  const renderDistributionBar = (leftLabel, rightLabel, percentage, leftLetter, rightLetter) => {
    const leftPercentage = percentage;
    const rightPercentage = 100 - percentage;

    return (
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="font-semibold">{leftLetter} - {leftLabel}</span>
          <span className="font-semibold">{rightLetter} - {rightLabel}</span>
        </div>
        <div className="flex h-4 rounded-full overflow-hidden">
          <div 
            className="bg-indigo-400 transition-all duration-500 ease-out"
            style={{width: `${leftPercentage}%`}}
          >
            <span className="px-2 text-xs font-bold flex items-center h-full text-indigo-800">{leftPercentage}%</span>
          </div>
          <div 
            className="bg-purple-400 transition-all duration-500 ease-out"
            style={{width: `${rightPercentage}%`}}
          >
            <span className="px-2 text-xs font-bold flex items-center h-full justify-end text-purple-800">{rightPercentage}%</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-100 to-purple-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white shadow-xl rounded-lg overflow-hidden"
        >
          <div className="bg-indigo-600 px-6 py-4">
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          </div>
          <div className="p-6">
            {isLoading ? (
              <div className="text-center">
                <p className="text-gray-600">Loading...</p>
              </div>
            ) : !isAuthenticated ? (
              <div className="text-center">
                <p className="text-gray-600 mb-4">Please sign in to view your dashboard.</p>
                <button
                  onClick={() => navigate('/')}
                  className="bg-indigo-600 text-white rounded-md px-4 py-2 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Go to Home
                </button>
              </div>
            ) : (
              <>
                {userData && (
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-2">Welcome, {userData.name.split(' ')[0]}!</h2>
                    <p className="text-gray-600">Email: {userData.email}</p>
                    <p className="text-lg font-semibold text-indigo-600 mt-4">
                      {submissionCount === 1 
                        ? "1 sweetheart has submitted a test for you" 
                        : `${submissionCount} sweethearts have submitted tests for you`}
                    </p>
                  </div>
                )}
                {mbtiResult && mbtiDistribution && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="bg-indigo-50 rounded-lg p-6 mb-8"
                  >
                    <h3 className="text-xl font-semibold text-indigo-800 mb-4">Your Average MBTI:</h3>
                    <div className="flex items-center justify-center mb-6">
                      <div className="w-24 h-24 bg-indigo-200 rounded-full flex items-center justify-center">
                        <span className="text-3xl font-bold text-indigo-800">{mbtiResult}</span>
                      </div>
                    </div>
                    <p className="text-center text-indigo-600 font-medium mb-6">
                      {getMbtiDescription(mbtiResult)}
                    </p>
                    <div className="space-y-4">
                      {renderDistributionBar('Extroverted', 'Introverted', mbtiDistribution.EI, 'E', 'I')}
                      {renderDistributionBar('Intuitive', 'Observant', mbtiDistribution.NS, 'N', 'S')}
                      {renderDistributionBar('Thinking', 'Feeling', mbtiDistribution.TF, 'T', 'F')}
                      {renderDistributionBar('Judging', 'Prospecting', mbtiDistribution.JP, 'J', 'P')}
                    </div>
                  </motion.div>
                )}
                {uniqueUrl ? (
                  <div className="bg-indigo-50 rounded-lg p-4 mb-6">
                    <h3 className="text-lg font-medium text-indigo-800 mb-2">Your unique MBTI test URL:</h3>
                    <div className="flex items-center">
                      <input
                        type="text"
                        value={uniqueUrl}
                        readOnly
                        className="flex-grow bg-white border border-gray-300 rounded-l-md py-2 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <button
                        onClick={() => navigator.clipboard.writeText(uniqueUrl)}
                        className="bg-indigo-600 text-white rounded-r-md px-4 py-2 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handleGenerateUrl}
                    className="w-full bg-indigo-600 text-white rounded-md px-4 py-2 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 mb-6"
                  >
                    Generate Unique URL
                  </button>
                )}
                <button
                  onClick={handleSignOut}
                  className="w-full bg-red-600 text-white rounded-md px-4 py-2 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  Sign Out
                </button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Dashboard;