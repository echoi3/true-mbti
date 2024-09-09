import React from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

function SignUpButton() {
  const navigate = useNavigate();

  const login = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Store user data in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        google_id: user.uid,
        email: user.email,
        name: user.displayName,
        avatar_url: user.photoURL,
        created_at: new Date().toISOString(),
      }, { merge: true });

      console.log('User data stored successfully');
      navigate('/dashboard');
    } catch (error) {
      if (error.code === 'auth/popup-blocked') {
        console.error('Popup blocked. Please allow popups for this site.');
      } else {
        console.error('Error signing in:', error);
      }
    }
  };

  return (
    <button
      onClick={login}
      className="w-full bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
    >
      Sign up with Google
    </button>
  );
}
export default SignUpButton;