import { useState, useEffect } from 'react';
import { Navigation } from './sections/Navigation';
import { Hero } from './sections/Hero';
import { Features } from './sections/Features';
import { AuthModal } from './sections/AuthModal';
import { Dashboard } from './sections/Dashboard';
import { Footer } from './sections/Footer';
import { Toaster } from '@/components/ui/sonner';

export type User = {
  id: string;
  name: string;
  email: string;
} | null;

function App() {
  const [user, setUser] = useState<User>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [showDashboard, setShowDashboard] = useState(false);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('devio_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('devio_user', JSON.stringify(userData));
    setShowAuth(false);
    setShowDashboard(true);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('devio_user');
    setShowDashboard(false);
  };

  const openLogin = () => {
    setAuthMode('login');
    setShowAuth(true);
  };

  const openSignup = () => {
    setAuthMode('signup');
    setShowAuth(true);
  };

  return (
    <div className="min-h-screen bg-[#f2f2f2]">
      <Navigation 
        user={user} 
        onLogin={openLogin} 
        onLogout={handleLogout}
        onDashboard={() => setShowDashboard(true)}
        onHome={() => setShowDashboard(false)}
        isDashboard={showDashboard}
      />
      
      {showDashboard && user ? (
        <Dashboard user={user} />
      ) : (
        <main>
          <Hero onGetStarted={openSignup} />
          <Features />
          <Footer />
        </main>
      )}

      <AuthModal 
        isOpen={showAuth} 
        onClose={() => setShowAuth(false)} 
        mode={authMode}
        onLogin={handleLogin}
        onSwitchMode={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
      />
      
      <Toaster />
    </div>
  );
}

export default App;
