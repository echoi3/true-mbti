import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { generateUniqueUrl } from '../utils/urlGenerator';

function Dashboard() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [uniqueUrl, setUniqueUrl] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserData(data);
          setUniqueUrl(data.uniqueUrl || null);
        }
      }
    };
    fetchUserData();
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
      const newUniqueUrl = await generateUniqueUrl(user.uid);
      setUniqueUrl(newUniqueUrl);
      console.log('Unique URL:', newUniqueUrl);
    }
  };

  return (
    <div>
      <h1>Dashboard</h1>
      {userData && (
        <div>
          <p>Welcome, {userData.name}!</p>
          <p>Email: {userData.email}</p>
          {uniqueUrl ? (
            <div>
              <p>Your unique MBTI test URL:</p>
              <a href={uniqueUrl} target="_blank" rel="noopener noreferrer">{uniqueUrl}</a>
            </div>
          ) : (
            <button onClick={handleGenerateUrl}>Generate Unique URL</button>
          )}
        </div>
      )}
      <button onClick={handleSignOut}>Sign Out</button>
    </div>
  );
}

export default Dashboard;