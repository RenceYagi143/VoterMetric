import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './lib/firebase';
import SplashScreen from './components/SplashScreen';
import Onboarding from './components/Onboarding';
import AuthScreen from './components/AuthScreen';
import Dashboard from './components/Dashboard';

enum View {
  SPLASH = 'splash',
  ONBOARDING = 'onboarding',
  AUTH = 'auth',
  DASHBOARD = 'dashboard'
}

export default function App() {
  const [view, setView] = useState<View>(View.SPLASH);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (view === View.SPLASH) {
      const timer = setTimeout(() => {
        const hasSeen = localStorage.getItem('hasSeenOnboarding') === 'true';
        setView(hasSeen ? View.AUTH : View.ONBOARDING);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [view]);

  const handleOnboardingComplete = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    // Only transition to Auth/Dashboard after onboarding
    setView(View.AUTH);
  };

  const handleLogin = () => {
    setView(View.DASHBOARD);
  };

  if (view === View.SPLASH) return <SplashScreen />;
  if (view === View.ONBOARDING) return <Onboarding onComplete={handleOnboardingComplete} />;
  
  if (!user || view === View.AUTH) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  return <Dashboard />;
}
