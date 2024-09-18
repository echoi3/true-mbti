import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { IntlProvider } from 'react-intl';
import { Helmet } from 'react-helmet';
import { AuthProvider } from './contexts/AuthContext';
import { getIntl } from './i18n';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Breadcrumbs from './components/Breadcrumbs';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const SignUp = lazy(() => import('./pages/SignUp'));
const MbtiTest = lazy(() => import('./components/MbtiTest'));
const NotFound = lazy(() => import('./pages/NotFound'));

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
            <Helmet>
              <html lang={locale} />
              <title>TrueMBTI - Discover Your True Personality</title>
              <meta name="description" content="Find out your true MBTI as seen by others. Invite friends to assess your personality traits!" />
            </Helmet>
            <div className="flex flex-col min-h-screen bg-gray-100">
              <Header setLocale={setLocale} />
              <main className="flex-grow container mx-auto p-4">
                <div className="sr-only">
                  <Breadcrumbs />
                </div>
                <Suspense fallback={<div>Loading...</div>}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/signup" element={<SignUp />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/mbti-test/:uniqueId" element={<MbtiTest />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
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