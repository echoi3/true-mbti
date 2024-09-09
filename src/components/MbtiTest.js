import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

function MbtiTest() {
  const { uniqueId } = useParams();
  const [userId, setUserId] = useState(null);
  const [testCompleted, setTestCompleted] = useState(false);

  useEffect(() => {
    const fetchUserId = async () => {
      const docRef = doc(db, 'uniqueUrls', uniqueId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUserId(docSnap.data().userId);
      }
    };
    fetchUserId();
  }, [uniqueId]);

  const handleTestSubmit = async (testResult) => {
    if (userId) {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        mbtiResults: testResult,
        // You can add more fields or logic here to update the user's MBTI
      });
      setTestCompleted(true);
    }
  };

  if (!userId) {
    return <div>Loading...</div>;
  }

  if (testCompleted) {
    return <div>Thank you for completing the test!</div>;
  }

  return (
    <div>
      <h1>MBTI Test</h1>
      {/* Add your MBTI test questions and logic here */}
      <button onClick={() => handleTestSubmit('INTJ')}>Submit Test</button>
    </div>
  );
}

export default MbtiTest;