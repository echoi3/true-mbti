import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { collection, query, where, getDocs, limit, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const questions = [
  { id: 1, text: "You prefer to spend time in large groups rather than one-on-one.", category: "E" },
  { id: 2, text: "You often think about abstract concepts and theories.", category: "N" },
  { id: 3, text: "You make decisions based on logic rather than emotions.", category: "T" },
  { id: 4, text: "You prefer to have a structured and planned approach to life.", category: "J" },
  // Add more questions here, ensuring a balance for each MBTI dimension
];

function MbtiTest() {
  const { uniqueId } = useParams();
  const [userId, setUserId] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [testCompleted, setTestCompleted] = useState(false);
  const [mbtiResult, setMbtiResult] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        console.log('Fetching user with uniqueId:', uniqueId);
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('uniqueId', '==', uniqueId), limit(1));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          const userData = userDoc.data();
          console.log('User data:', userData);
          setUserId(userDoc.id);
        } else {
          console.error('No user found with uniqueId:', uniqueId);
          setError('Invalid or expired test link. Please request a new link.');
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        console.error('Error details:', error.code, error.message);
        setError('An error occurred while loading the test. Please try again later.');
      }
    };
    fetchUserId();
  }, [uniqueId]);

  if (error) {
    return <div>{error}</div>;
  }

  const handleAnswer = (value) => {
    setAnswers({ ...answers, [questions[currentQuestion].id]: value });
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateMBTI();
    }
  };

  const calculateMBTI = () => {
    const scores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
    questions.forEach(q => {
      const answer = answers[q.id];
      if (answer > 3) {
        scores[q.category]++;
      } else {
        scores[q.category === 'E' ? 'I' : q.category === 'N' ? 'S' : q.category === 'T' ? 'F' : 'P']++;
      }
    });
    const result = `${scores.E > scores.I ? 'E' : 'I'}${scores.N > scores.S ? 'N' : 'S'}${scores.T > scores.F ? 'T' : 'F'}${scores.J > scores.P ? 'J' : 'P'}`;
    setMbtiResult(result);
    updateUserMBTI(result);
  };

  const updateUserMBTI = async (result) => {
    if (userId) {
      await updateDoc(doc(db, 'users', userId), {
        mbtiResults: result,
      });
      setTestCompleted(true);
    }
  };

  if (!userId) {
    return <div>Loading...</div>;
  }

  if (testCompleted) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">Your MBTI Result</h1>
        <p className="text-4xl font-bold text-indigo-600">{mbtiResult}</p>
        <p className="mt-4 text-center">Thank you for completing the test!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-6">MBTI Test</h1>
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <p className="mb-4 text-lg">{questions[currentQuestion].text}</p>
        <div className="flex flex-col space-y-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              onClick={() => handleAnswer(value)}
              className="bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 transition duration-200"
            >
              {value === 1 ? 'Strongly Disagree' : value === 5 ? 'Strongly Agree' : value}
            </button>
          ))}
        </div>
        <div className="mt-4 text-sm text-gray-600">
          Question {currentQuestion + 1} of {questions.length}
        </div>
      </div>
    </div>
  );
}

export default MbtiTest;