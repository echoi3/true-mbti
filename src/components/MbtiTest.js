import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { collection, query, where, getDocs, limit, doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { motion, AnimatePresence } from 'framer-motion';
import { httpsCallable, getFunctions } from 'firebase/functions';

const questions = [
  // E/I questions
  { id: 1, text: "[FIRST_NAME] prefers to spend time in large groups rather than one-on-one.", category: "E" },
  { id: 2, text: "[FIRST_NAME] enjoys being the center of attention.", category: "E" },
  { id: 3, text: "[FIRST_NAME] initiates conversations with strangers easily.", category: "E" },
  { id: 4, text: "[FIRST_NAME] prefers to work in teams rather than independently.", category: "E" },
  { id: 5, text: "[FIRST_NAME] feels energized after social interactions.", category: "E" },
  { id: 6, text: "[FIRST_NAME] prefers to recharge by spending time alone.", category: "I" },
  { id: 7, text: "[FIRST_NAME] is usually quiet and reserved in social situations.", category: "I" },
  { id: 8, text: "[FIRST_NAME] finds it draining to be in social situations for extended periods.", category: "I" },
  { id: 9, text: "[FIRST_NAME] prefers written communication over verbal.", category: "I" },
  { id: 10, text: "[FIRST_NAME] needs quiet time to concentrate and do their best work.", category: "I" },

  // N/S questions
  { id: 11, text: "[FIRST_NAME] often thinks about abstract concepts and theories.", category: "N" },
  { id: 12, text: "[FIRST_NAME] is more interested in future possibilities than present realities.", category: "N" },
  { id: 13, text: "[FIRST_NAME] enjoys exploring new ideas and possibilities.", category: "N" },
  { id: 14, text: "[FIRST_NAME] enjoys engaging in deep, meaningful conversations.", category: "N" },
  { id: 15, text: "[FIRST_NAME] often sees connections between seemingly unrelated things.", category: "N" },
  { id: 16, text: "[FIRST_NAME] focuses more on details and facts than on big picture concepts.", category: "S" },
  { id: 17, text: "[FIRST_NAME] prefers practical, hands-on experiences over theoretical discussions.", category: "S" },
  { id: 18, text: "[FIRST_NAME] prefers to focus on concrete facts and details.", category: "S" },
  { id: 19, text: "[FIRST_NAME] is often described as a practical and down-to-earth person.", category: "S" },
  { id: 20, text: "[FIRST_NAME] prefers to learn through step-by-step instructions rather than figuring things out on their own.", category: "S" },

  // T/F questions
  { id: 21, text: "[FIRST_NAME] makes decisions based on logic rather than emotions.", category: "T" },
  { id: 22, text: "[FIRST_NAME] values objectivity over personal feelings when making decisions.", category: "T" },
  { id: 23, text: "[FIRST_NAME] prefers to analyze problems logically.", category: "T" },
  { id: 24, text: "[FIRST_NAME] tends to prioritize fairness over harmony in conflicts.", category: "T" },
  { id: 25, text: "[FIRST_NAME] is more convinced by rational arguments than emotional appeals.", category: "T" },
  { id: 26, text: "[FIRST_NAME] considers how decisions will affect others' feelings.", category: "F" },
  { id: 27, text: "[FIRST_NAME] values harmony and avoiding conflict in relationships.", category: "F" },
  { id: 28, text: "[FIRST_NAME] often makes decisions based on gut feelings.", category: "F" },
  { id: 29, text: "[FIRST_NAME] tends to be empathetic and sensitive to others' emotions.", category: "F" },
  { id: 30, text: "[FIRST_NAME] believes that considering people's feelings is as important as considering facts.", category: "F" },

  // J/P questions
  { id: 31, text: "[FIRST_NAME] prefers to have a structured and planned approach to life.", category: "J" },
  { id: 32, text: "[FIRST_NAME] likes to have a detailed plan before starting a project.", category: "J" },
  { id: 33, text: "[FIRST_NAME] likes to have things settled and decided.", category: "J" },
  { id: 34, text: "[FIRST_NAME] prefers to finish one project before starting another.", category: "J" },
  { id: 35, text: "[FIRST_NAME] finds comfort in routines and schedules.", category: "J" },
  { id: 36, text: "[FIRST_NAME] prefers to keep options open and be flexible.", category: "P" },
  { id: 37, text: "[FIRST_NAME] prefers to go with the flow rather than stick to a rigid schedule.", category: "P" },
  { id: 38, text: "[FIRST_NAME] enjoys spontaneity and last-minute plans.", category: "P" },
  { id: 39, text: "[FIRST_NAME] often starts projects without detailed planning.", category: "P" },
  { id: 40, text: "[FIRST_NAME] finds too much structure and planning limiting and constraining.", category: "P" }
];

const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

function MbtiTest() {
  const { uniqueId } = useParams();
  const [userId, setUserId] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [testCompleted, setTestCompleted] = useState(false);
  const [mbtiResult, setMbtiResult] = useState('');
  const [mbtiDistribution, setMbtiDistribution] = useState(null);
  const [error, setError] = useState(null);
  const [userName, setUserName] = useState('User');
  const [direction, setDirection] = useState(1);
  const [shuffledQuestions, setShuffledQuestions] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('uniqueId', '==', uniqueId), limit(1));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          const userData = userDoc.data();
          setUserId(userDoc.id);
          setUserName(userData.name ? userData.name.split(' ')[0] : 'User');
        } else {
          console.error('No user found with uniqueId:', uniqueId);
          setError('Invalid or expired test link. Please request a new link.');
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        setError('An error occurred while loading the test. Please try again later.');
      }
    };
    fetchUserData();
  }, [uniqueId]);

  useEffect(() => {
    setShuffledQuestions(shuffleArray([...questions]));
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="bg-white rounded-lg shadow-md p-6 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700">{error}</p>
        </div>
      </div>
    );
  }

  const handleAnswer = (value) => {
    const newAnswers = { ...answers, [shuffledQuestions[currentQuestion].id]: value };
    setAnswers(newAnswers);

    if (currentQuestion === shuffledQuestions.length - 1) {
      calculateMBTI(newAnswers);
    } else {
      setDirection(1);
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const goToNextQuestion = () => {
    if (currentQuestion < shuffledQuestions.length - 1) {
      setDirection(1);
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateMBTI();
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestion > 0) {
      setDirection(-1);
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateMBTI = (finalAnswers) => {
    const scores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
    
    shuffledQuestions.forEach(q => {
      const answer = finalAnswers[q.id];
      const category = q.category;
      const oppositeCategory = category === 'E' ? 'I' : category === 'S' ? 'N' : category === 'T' ? 'F' : 'P';
      
      if (answer === 7) {
        scores[category] += 2;
      } else if (answer === 6) {
        scores[category] += 1;
      } else if (answer === 3) {
        scores[oppositeCategory] += 1;
      } else if (answer === 2 || answer === 1) {
        scores[oppositeCategory] += 2;
      }
      // Note: answer === 4 (neutral) doesn't contribute to either category
    });

    const calculatePreference = (a, b) => {
      const totalPoints = scores[a] + scores[b];
      const difference = Math.abs(scores[a] - scores[b]);
      const preference = scores[a] > scores[b] ? a : b;
      const strength = Math.round((difference / totalPoints) * 100);
      return { preference, strength };
    };

    const ei = calculatePreference('E', 'I');
    const sn = calculatePreference('S', 'N');
    const tf = calculatePreference('T', 'F');
    const jp = calculatePreference('J', 'P');

    const result = ei.preference + sn.preference + tf.preference + jp.preference;
    const distribution = {
      EI: ei.strength,
      NS: sn.strength,
      TF: tf.strength,
      JP: jp.strength
    };

    setMbtiResult(result);
    setMbtiDistribution(distribution);
    setTestCompleted(true);

    // Update user's MBTI results in the database
    updateUserMBTI(result, distribution);
  };

  const updateUserMBTI = async (result, distribution) => {
    if (userId) {
      const testResult = {
        result: result,
        distribution: distribution,
        takenAt: new Date().toISOString(),
        takenBy: uniqueId
      };

      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();
      
      let newAverageMBTI = result;
      let newAverageDistribution = distribution;

      if (userData.averageMBTI) {
        const totalTests = (userData.mbtiResults?.length || 0) + 1;
        newAverageDistribution = {
          EI: (userData.averageDistribution.EI * (totalTests - 1) + distribution.EI) / totalTests,
          NS: (userData.averageDistribution.NS * (totalTests - 1) + distribution.NS) / totalTests,
          TF: (userData.averageDistribution.TF * (totalTests - 1) + distribution.TF) / totalTests,
          JP: (userData.averageDistribution.JP * (totalTests - 1) + distribution.JP) / totalTests
        };
        newAverageMBTI = 
          (newAverageDistribution.EI > 50 ? 'E' : 'I') +
          (newAverageDistribution.NS > 50 ? 'N' : 'S') +
          (newAverageDistribution.TF > 50 ? 'T' : 'F') +
          (newAverageDistribution.JP > 50 ? 'J' : 'P');
      }

      await updateDoc(userRef, {
        mbtiResults: arrayUnion(testResult),
        averageMBTI: newAverageMBTI,
        averageDistribution: newAverageDistribution
      });

      await sendEmailNotification(userId, userName);
    }
  };

  const sendEmailNotification = async (userId, testTakerName) => {
    try {
      const functions = getFunctions();
      const sendEmail = httpsCallable(functions, 'sendEmailNotification');
      const result = await sendEmail({ userId, testTakerName });
      console.log('Email notification sent successfully', result.data);
    } catch (error) {
      console.error('Error sending email notification:', error);
    }
  };

  if (!userId) {
    return <div>Loading...</div>;
  }

  if (!testCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-100 to-purple-100 px-4 py-8">
        <div className="w-full max-w-lg bg-white rounded-lg shadow-xl p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-bold text-indigo-600 mb-6 text-center">MBTI Test for {userName}</h1>
          <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
            <span>Question {currentQuestion + 1} of {shuffledQuestions.length}</span>
            <span>{Math.round(((currentQuestion + 1) / shuffledQuestions.length) * 100)}% complete</span>
          </div>
          <div className="mb-4 bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300 ease-out" 
              style={{ width: `${((currentQuestion + 1) / shuffledQuestions.length) * 100}%` }}
            ></div>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              initial={{ x: direction * 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: direction * -50, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-8"
            >
              <div className="bg-indigo-50 rounded-lg p-6 mb-8">
                <p className="text-xl font-semibold text-indigo-800 mb-6">
                  {shuffledQuestions[currentQuestion].text.replace('[FIRST_NAME]', userName)}
                </p>
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5, 6, 7].map((value) => (
                    <button
                      key={value}
                      onClick={() => handleAnswer(value)}
                      className={`w-full py-3 px-4 rounded-lg text-lg transition-colors duration-200 flex justify-between items-center ${
                        answers[shuffledQuestions[currentQuestion].id] === value
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white text-gray-800 hover:bg-indigo-100'
                      }`}
                    >
                      <span>{getAnswerLabel(value)}</span>
                      <span className="text-sm opacity-70">{value}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
          <div className="flex justify-between mt-6">
            <button
              onClick={goToPreviousQuestion}
              disabled={currentQuestion === 0}
              className={`px-4 py-2 rounded-lg ${
                currentQuestion === 0 ? 'bg-gray-300 text-gray-500' : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              Previous
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (testCompleted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-indigo-100 to-purple-100">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-lg shadow-xl p-6 md:p-8 max-w-md w-full"
        >
          <h1 className="text-3xl font-bold text-center mb-6">{userName}'s MBTI</h1>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex flex-col items-center mb-6"
          >
            <div className="w-32 h-32 bg-teal-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-6xl">🧠</span>
            </div>
            <h2 className="text-3xl font-semibold text-teal-600 mb-2">{getMbtiName(mbtiResult)}</h2>
            <p className="text-2xl font-bold">{mbtiResult}</p>
          </motion.div>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="space-y-4 mb-8"
          >
            {renderDistributionBar('Extroverted', 'Introverted', mbtiDistribution.EI, 'E', 'I')}
            {renderDistributionBar('Intuitive', 'Observant', mbtiDistribution.NS, 'N', 'S')}
            {renderDistributionBar('Thinking', 'Feeling', mbtiDistribution.TF, 'T', 'F')}
            {renderDistributionBar('Judging', 'Prospecting', mbtiDistribution.JP, 'J', 'P')}
          </motion.div>
          <p className="text-center text-gray-600 mb-6">
            Thank you for taking the test for {userName}! Your results have been saved and shared.
          </p>
          <div className="flex justify-center">
            <a
              href="/signup"
              className="bg-indigo-600 text-white rounded-md px-6 py-2 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200"
            >
              Sign Up to Know My True MBTI
            </a>
          </div>
        </motion.div>
      </div>
    );
  }

  function getMbtiName(result) {
    const names = {
      'INFJ': 'Advocate',
      'INTJ': 'Architect',
      'INFP': 'Mediator',
      'INTP': 'Logician',
      'ENFJ': 'Protagonist',
      'ENTJ': 'Commander',
      'ENFP': 'Campaigner',
      'ENTP': 'Debater',
      'ISFJ': 'Defender',
      'ISTJ': 'Logistician',
      'ISFP': 'Adventurer',
      'ISTP': 'Virtuoso',
      'ESFJ': 'Consul',
      'ESTJ': 'Executive',
      'ESFP': 'Entertainer',
      'ESTP': 'Entrepreneur'
    };
    return names[result] || 'Unknown';
  }

  function renderDistributionBar(leftLabel, rightLabel, percentage, leftLetter, rightLetter) {
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
  }

  function getAnswerLabel(value) {
    switch (value) {
      case 1: return "Strongly Disagree";
      case 2: return "Disagree";
      case 3: return "Slightly Disagree";
      case 4: return "Neutral";
      case 5: return "Slightly Agree";
      case 6: return "Agree";
      case 7: return "Strongly Agree";
      default: return "";
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-6">MBTI Test for {userName}</h1>
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <p className="mb-4 text-lg">{shuffledQuestions[currentQuestion].text.replace('[FIRST_NAME]', userName)}</p>
        <div className="flex justify-between items-center">
          <span>Strongly Disagree</span>
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5, 6, 7].map((value) => (
              <button
                key={value}
                onClick={() => handleAnswer(value)}
                className={`w-8 h-8 rounded-full ${
                  answers[shuffledQuestions[currentQuestion].id] === value
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 hover:bg-indigo-200'
                }`}
              >
                {value}
              </button>
            ))}
          </div>
          <span>Strongly Agree</span>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          Question {currentQuestion + 1} of {shuffledQuestions.length}
        </div>
      </div>
    </div>
  );
}

export default MbtiTest;