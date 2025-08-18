import React, { useState } from 'react';

export default function Start() {
  const [showLogin, setShowLogin] = useState(false);

  const handleAdventureClick = (e) => {
    e.preventDefault();
    setShowLogin(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-12 relative">
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500;600;700&display=swap');
        
        .hero-bg {
          background-image: url('/Assets/img/bgAdventure.jpg');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
        }
        
        .glassmorphism {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .glassmorphism-light {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .hero-text {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'SF Pro Display', system-ui, sans-serif;
          font-weight: 200;
          color: #131D4F;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
          letter-spacing: -0.02em;
          line-height: 1.2;
        }
        
        .nav-text {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'SF Pro Display', system-ui, sans-serif;
        }
        
        .form-text {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'SF Pro Display', system-ui, sans-serif;
          color: #131D4F;
        }
        
        .form-input {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(8px);
          color: #131D4F;
        }
        
        .form-input:focus {
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(255, 255, 255, 0.4);
          box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.1);
        }
        
        .form-input::placeholder {
          color: rgba(19, 29, 79, 0.6);
        }
        
        .shimmer-effect {
          position: relative;
          overflow: hidden;
        }
        
        .shimmer-effect::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.6s;
        }
        
        .shimmer-effect:hover::before {
          left: 100%;
        }
        
        .fade-transition {
          transition: opacity 0.6s ease-in-out;
        }
        
        .hero-container {
          box-shadow: 
            0 25px 50px -12px rgba(0, 0, 0, 0.8),
            0 0 0 1px rgba(255, 255, 255, 0.05),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }
        
        .hero-container::before {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          background: linear-gradient(45deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%, rgba(255, 255, 255, 0.05) 100%);
          border-radius: 14px;
          z-index: -1;
        }
        
        .login-form-shadow {
          box-shadow: 
            0 8px 32px rgba(0, 0, 0, 0.3),
            0 1px 0 rgba(255, 255, 255, 0.2) inset,
            0 -1px 0 rgba(0, 0, 0, 0.1) inset;
        }
        
        .button-shadow {
          box-shadow:
            0 8px 32px rgba(0, 0, 0, 0.3),
            0 1px 0 rgba(255, 255, 255, 0.2) inset,
            0 -1px 0 rgba(0, 0, 0, 0.1) inset;
        }
        
        .button-shadow:hover {
          box-shadow:
            0 12px 40px rgba(0, 0, 0, 0.4),
            0 1px 0 rgba(255, 255, 255, 0.3) inset,
            0 -1px 0 rgba(0, 0, 0, 0.1) inset;
        }
      `}</style>

      {/* Navigation */}
      <nav className="absolute top-0 left-12 right-12 h-12 flex items-center justify-between px-6 z-20">
        <a href="#" className="nav-text text-white/90 text-lg font-bold tracking-wider no-underline">
          ZENNOMA
        </a>
        <div className="flex items-center gap-8">
          <a href="#" className="nav-text text-white/70 no-underline text-sm font-normal tracking-wide hover:text-white/90 transition-colors duration-300">
            Home
          </a>
          <a href="#" className="nav-text text-white/70 no-underline text-sm font-normal tracking-wide hover:text-white/90 transition-colors duration-300">
            About
          </a>
          <a href="#" className="nav-text text-white/70 no-underline text-sm font-normal tracking-wide hover:text-white/90 transition-colors duration-300">
            Security
          </a>
          <a href="#" className="nav-text text-white/70 no-underline text-sm font-normal tracking-wide hover:text-white/90 transition-colors duration-300">
            Contact
          </a>
        </div>
      </nav>

      {/* Hero Container */}
      <div className="hero-container hero-bg h-[calc(100vh-6rem)] relative rounded-xl overflow-hidden border-2 border-white/10">
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/30"></div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-end h-full text-right pr-20 pl-6">
          <div className="max-w-lg relative min-h-[300px] flex flex-col justify-center">
            
            {/* Hero Text */}
            <h1 className={`hero-text text-4xl md:text-6xl mb-12 fade-transition ${showLogin ? 'opacity-0' : 'opacity-100'}`}>
              Grade Insight:<br />
              Simple.<br />
              Secure.<br />
              Yours.
            </h1>

            {/* Login Form */}
            <div className={`login-form-shadow glassmorphism absolute top-1/2 right-0 transform -translate-y-1/2 w-70 min-h-96 rounded-2xl p-10 flex flex-col justify-center fade-transition ${showLogin ? 'opacity-100' : 'opacity-0'}`}>
              <h2 className="form-text text-3xl font-light text-center mb-8 text-shadow">
                Secure Access
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="form-text block text-sm font-normal mb-2 tracking-wide" htmlFor="username">
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    className="form-input w-full rounded-lg px-4 py-3 text-base transition-all duration-300 focus:outline-none"
                    placeholder="Enter your username"
                  />
                </div>
                
                <div>
                  <label className="form-text block text-sm font-normal mb-2 tracking-wide" htmlFor="password">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    className="form-input w-full rounded-lg px-4 py-3 text-base transition-all duration-300 focus:outline-none"
                    placeholder="Enter your password"
                  />
                </div>
                
                <button
                  type="button"
                  className="glassmorphism-light form-text w-full py-4 px-6 text-base font-normal rounded-lg cursor-pointer transition-all duration-300 mb-4 mt-2 hover:bg-gradient-to-br hover:from-white/25 hover:to-white/10 hover:-translate-y-px"
                  style={{
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2), 0 1px 0 rgba(255, 255, 255, 0.2) inset'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.3), 0 1px 0 rgba(255, 255, 255, 0.3) inset';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.2), 0 1px 0 rgba(255, 255, 255, 0.2) inset';
                  }}
                >
                  Sign In
                </button>
                
                <div className="form-text text-center text-sm">
                  Don't have an account?{' '}
                  <a href="#" className="form-text no-underline font-normal transition-colors duration-300 hover:opacity-80">
                    Sign up
                  </a>
                </div>
              </div>
            </div>

            {/* Adventure Button */}
            <a
              href="#"
              onClick={handleAdventureClick}
              className={`button-shadow glassmorphism-light form-text shimmer-effect inline-block w-fit py-2 px-4 text-lg font-normal rounded-lg cursor-pointer no-underline tracking-wide transition-all duration-500 hover:bg-gradient-to-br hover:from-white/25 hover:to-white/10 hover:-translate-y-1 hover:scale-105 fade-transition ${showLogin ? 'opacity-0' : 'opacity-100'}`}
            >
              Begin your Adventure
            </a>

          </div>
        </div>
      </div>
    </div>
  );
}
