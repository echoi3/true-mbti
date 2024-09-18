import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useIntl, FormattedMessage } from 'react-intl';

function Header({ setLocale }) {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const intl = useIntl();

  const handleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  const handleLanguageChange = (e) => {
    setLocale(e.target.value);
  };

  return (
    <header className="bg-indigo-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          <Link to="/">{intl.formatMessage({ id: 'app.title' })}</Link>
        </h1>
        <div className="flex items-center">
          <select
            onChange={handleLanguageChange}
            value={intl.locale}
            className="mr-4 bg-indigo-500 text-white px-2 py-1 rounded"
          >
            <option value="en">English</option>
            <option value="ko">한국어</option>
          </select>
          {currentUser ? (
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-bold rounded-md text-indigo-600 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <FormattedMessage id="header.dashboard" />
            </button>
          ) : (
            <button
              onClick={handleSignIn}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-bold rounded-md text-indigo-600 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <FormattedMessage id="header.signIn" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;