import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { User, LogOut, LayoutDashboard, Home } from 'lucide-react';
import type { User as UserType } from '@/App';

interface NavigationProps {
  user: UserType;
  onLogin: () => void;
  onLogout: () => void;
  onDashboard: () => void;
  onHome: () => void;
  isDashboard: boolean;
}

export function Navigation({ user, onLogin, onLogout, onDashboard, onHome, isDashboard }: NavigationProps) {
  const [scrolled, setScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show/hide based on scroll direction
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setScrolled(currentScrollY > 50);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <nav 
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ${
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      }`}
    >
      <div 
        className={`flex items-center gap-2 px-4 py-2.5 rounded-full transition-all duration-300 ${
          scrolled 
            ? 'bg-white/90 backdrop-blur-xl shadow-soft border border-gray-200/50' 
            : 'bg-white/50 backdrop-blur-md'
        }`}
      >
        {/* Logo */}
        <button 
          onClick={onHome}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-black/5 transition-colors"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">D</span>
          </div>
          <span className="font-serif font-semibold text-lg text-black">Devio</span>
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Navigation Links */}
        <div className="flex items-center gap-1">
          {user && (
            <Button
              variant="ghost"
              size="sm"
              onClick={isDashboard ? onHome : onDashboard}
              className="rounded-full text-sm font-medium hover:bg-black/5"
            >
              {isDashboard ? (
                <><Home className="w-4 h-4 mr-1.5" /> Home</>
              ) : (
                <><LayoutDashboard className="w-4 h-4 mr-1.5" /> Dashboard</>
              )}
            </Button>
          )}
          
          {!user && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="rounded-full text-sm font-medium hover:bg-black/5"
              >
                Features
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                className="rounded-full text-sm font-medium hover:bg-black/5"
              >
                How it Works
              </Button>
            </>
          )}
        </div>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Auth Buttons */}
        <div className="flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100">
                <div className="w-6 h-6 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700">{user.name}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onLogout}
                className="rounded-full hover:bg-red-50 hover:text-red-500"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Button
              onClick={onLogin}
              className="rounded-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-5"
            >
              Login / Sign Up
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
