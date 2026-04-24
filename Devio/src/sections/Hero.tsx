import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, ArrowRight, Code, BookOpen, MessageSquare, Brain } from 'lucide-react';
import { gsap } from 'gsap';

interface HeroProps {
  onGetStarted: () => void;
}

export function Hero({ onGetStarted }: HeroProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Text animation
      gsap.fromTo(
        '.hero-badge',
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.6, delay: 0.3, ease: 'back.out(1.7)' }
      );

      gsap.fromTo(
        '.hero-title span',
        { y: 100, opacity: 0, clipPath: 'inset(100% 0 0 0)' },
        { 
          y: 0, 
          opacity: 1, 
          clipPath: 'inset(0% 0 0 0)',
          duration: 1, 
          stagger: 0.1, 
          delay: 0.4,
          ease: 'power3.out' 
        }
      );

      gsap.fromTo(
        '.hero-description',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, delay: 0.8, ease: 'power2.out' }
      );

      gsap.fromTo(
        '.hero-cta',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, delay: 1, ease: 'power2.out' }
      );

      // Dashboard image animation
      gsap.fromTo(
        '.hero-image',
        { rotateX: 45, opacity: 0, y: 50 },
        { rotateX: 10, opacity: 1, y: 0, duration: 1.2, delay: 0.5, ease: 'power3.out' }
      );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  // Mouse move handler for 3D tilt effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      setMousePosition({ x, y });
    };

    const hero = heroRef.current;
    if (hero) {
      hero.addEventListener('mousemove', handleMouseMove, { passive: true });
    }

    return () => {
      if (hero) {
        hero.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, []);

  // Apply 3D tilt to image
  useEffect(() => {
    if (imageRef.current) {
      gsap.to(imageRef.current, {
        rotateY: mousePosition.x * 5,
        rotateX: 10 - mousePosition.y * 5,
        duration: 0.5,
        ease: 'power2.out',
      });
    }
  }, [mousePosition]);

  return (
    <section 
      ref={heroRef}
      className="relative min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden"
      style={{ perspective: '1000px' }}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 via-transparent to-amber-50/30 pointer-events-none" />
      
      {/* Floating decorative elements */}
      <div className="absolute top-40 left-10 w-20 h-20 bg-orange-200/30 rounded-full blur-xl animate-float" />
      <div className="absolute bottom-40 right-20 w-32 h-32 bg-amber-200/20 rounded-full blur-2xl animate-float" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-orange-300/20 rounded-full blur-lg animate-float" style={{ animationDelay: '2s' }} />

      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left: Text Content */}
          <div ref={textRef} className="relative z-10 space-y-8">
            <Badge 
              className="hero-badge inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 border-orange-200 rounded-full text-sm font-medium"
            >
              <Sparkles className="w-4 h-4" />
              AI Powered Learning
            </Badge>

            <h1 className="hero-title font-serif text-5xl sm:text-6xl lg:text-7xl font-bold text-black leading-[1.1]">
              <span className="inline-block">Ace</span>{' '}
              <span className="inline-block">Interviews</span>{' '}
              <span className="inline-block">with</span>
              <br />
              <span className="inline-block text-gradient">AI-Powered</span>{' '}
              <span className="inline-block">Learning</span>
            </h1>

            <p className="hero-description text-lg sm:text-xl text-gray-600 max-w-xl leading-relaxed">
              Get role-specific questions, expand answers when you need them, dive deeper into concepts, 
              and organize everything your way. From preparation to mastery — your ultimate interview toolkit is here.
            </p>

            <div className="hero-cta flex flex-wrap gap-4">
              <Button
                onClick={onGetStarted}
                size="lg"
                className="rounded-full bg-black hover:bg-gray-800 text-white px-8 py-6 text-base font-medium group"
              >
                Get Started
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="rounded-full border-gray-300 hover:bg-gray-100 px-8 py-6 text-base font-medium"
              >
                Learn More
              </Button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 pt-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Code className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-black">10K+</p>
                  <p className="text-sm text-gray-500">Interview Questions</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-black">50+</p>
                  <p className="text-sm text-gray-500">Tech Topics</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-black">5K+</p>
                  <p className="text-sm text-gray-500">Happy Users</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Dashboard Preview */}
          <div 
            ref={imageRef}
            className="hero-image relative lg:pl-8"
            style={{ 
              transformStyle: 'preserve-3d',
              transform: 'rotateX(10deg)',
            }}
          >
            <div className="relative">
              {/* Main dashboard mockup */}
              <div className="bg-white rounded-2xl shadow-card overflow-hidden border border-gray-200/50">
                {/* Browser chrome */}
                <div className="bg-gray-100 px-4 py-3 flex items-center gap-2 border-b border-gray-200">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="bg-white rounded-md px-3 py-1 text-xs text-gray-400 text-center">
                      devio.com/dashboard
                    </div>
                  </div>
                </div>
                
                {/* Dashboard content */}
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-black">Interview Prep AI</h3>
                      <p className="text-sm text-gray-500">Your personalized learning path</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full" />
                      <div className="text-right">
                        <p className="text-sm font-medium text-black">Mike William</p>
                        <p className="text-xs text-orange-500">Logout</p>
                      </div>
                    </div>
                  </div>

                  {/* Role Card */}
                  <div className="bg-gray-50 rounded-xl p-4 mb-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-xl font-bold text-black mb-1">Frontend Developer</h4>
                        <p className="text-sm text-gray-500 mb-3">React.js, DOM manipulation, CSS Flexbox</p>
                        <div className="flex gap-2">
                          <span className="px-3 py-1 bg-black text-white text-xs rounded-full">Experience: 2 Years</span>
                          <span className="px-3 py-1 bg-white border border-gray-200 text-xs rounded-full">10 Q&A</span>
                          <span className="px-3 py-1 bg-white border border-gray-200 text-xs rounded-full">Last Updated: 30th Apr 2025</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Q&A Section */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-sm font-semibold text-black mb-3">Interview Q & A</h5>
                      <div className="space-y-2">
                        {[
                          'What is JSX? Explain its role in React.',
                          'What is React.js and what are its main advantages?',
                          'Explain the difference between "props" and "state" in React.',
                        ].map((q, i) => (
                          <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                            <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex-shrink-0" />
                            <p className="text-xs text-gray-600 truncate">{q}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="text-sm font-semibold text-black">CSS Flexbox: A Beginner's Guide</h5>
                        <button className="text-gray-400 hover:text-gray-600">×</button>
                      </div>
                      <p className="text-xs text-gray-600 mb-3">
                        CSS Flexbox is a powerful layout model in CSS. It's designed to make it easier to design flexible and responsive web page layouts...
                      </p>
                      <div className="bg-black rounded-lg p-3">
                        <code className="text-xs text-green-400">
                          .container {'{'}
                          <br />
                          &nbsp;&nbsp;display: flex;
                          <br />
                          {'}'}
                        </code>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-3 border border-gray-100 animate-float">
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-orange-500" />
                  <span className="text-sm font-medium text-black">AI Generated</span>
                </div>
              </div>

              <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg p-3 border border-gray-100 animate-float" style={{ animationDelay: '1.5s' }}>
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    <div className="w-6 h-6 bg-blue-500 rounded-full border-2 border-white" />
                    <div className="w-6 h-6 bg-green-500 rounded-full border-2 border-white" />
                    <div className="w-6 h-6 bg-purple-500 rounded-full border-2 border-white" />
                  </div>
                  <span className="text-sm font-medium text-black">+2.5k learners</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
