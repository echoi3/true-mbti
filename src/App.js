import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { IntlProvider } from 'react-intl';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import SignUp from './pages/SignUp';
import MbtiTest from './components/MbtiTest';
import { AuthProvider } from './contexts/AuthContext';
import { getIntl } from './i18n';

const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

function App() {
  const [locale, setLocale] = useState(() => {
    const userLanguage = navigator.language.split('-')[0];
    return userLanguage === 'ko' ? 'ko' : 'en';
  });
  const intl = getIntl(locale);

  useEffect(() => {
    const handleLanguageChange = () => {
      const userLanguage = navigator.language.split('-')[0];
      setLocale(userLanguage === 'ko' ? 'ko' : 'en');
    };

    window.addEventListener('languagechange', handleLanguageChange);

    return () => {
      window.removeEventListener('languagechange', handleLanguageChange);
    };
  }, []);

  return (
    <IntlProvider messages={intl.messages} locale={locale}>
      <AuthProvider>
        <GoogleOAuthProvider clientId={CLIENT_ID}>
          <Router>
            <div className="flex flex-col min-h-screen bg-gray-100">
              <Header setLocale={setLocale} />
              <main className="flex-grow container mx-auto p-4">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/signup" element={<SignUp />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/mbti-test/:uniqueId" element={<MbtiTest />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </GoogleOAuthProvider>
      </AuthProvider>
    </IntlProvider>
  );
}

export default App;