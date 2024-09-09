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
      try {
        console.log('Generating URL for user:', user.uid);
        const newUniqueUrl = await generateUniqueUrl(user.uid);
        setUniqueUrl(newUniqueUrl);
        console.log('New Unique URL:', newUniqueUrl);
        
        // Fetch updated user data to ensure state is in sync
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
              <a href={uniqueUrl} onClick={(e) => {
                e.preventDefault();
                window.location.href = uniqueUrl;
              }}>{uniqueUrl}</a>
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