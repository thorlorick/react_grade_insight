import React, { useState } from 'react';

// Design System with Style Objects
const designSystem = {
  colors: {
    primary: '#131D4F',
    primaryAlpha: 'rgba(19, 29, 79, 0.6)',
    glass: {
      primary: 'rgba(255, 255, 255, 0.1)',
      light: 'rgba(255, 255, 255, 0.15)',
      border: 'rgba(255, 255, 255, 0.2)',
    },
    gradients: {
      background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 50%, #0a0a0a 100%)',
      glass: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
      glassLight: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%)',
    }
  },
  fonts: {
    primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  shadows: {
    glass: '0 8px 32px rgba(0, 0, 0, 0.3), 0 1px 0 rgba(255, 255, 255, 0.2) inset',
    hero: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05)',
    text: '0 2px 4px rgba(0, 0, 0, 0.5)',
  },
  borderRadius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
  }
};

// Style Objects for Components
const styles = {
  // Base styles
  body: {
    fontFamily: designSystem.fonts.primary,
    background: designSystem.colors.gradients.background,
    padding: '48px',
    margin: 0,
    minHeight: '100vh',
    position: 'relative',
  },

  // Navigation styles
  navbar: {
    position: 'absolute',
    top: 0,
    left: '48px',
    right: '48px',
    height: '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `0 ${designSystem.spacing.lg}`,
    zIndex: 20,
  },

  navLogo: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: '1.125rem',
    fontWeight: 700,
    textDecoration: 'none',
    letterSpacing: '0.1em',
    fontFamily: designSystem.fonts.primary,
  },

  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: designSystem.spacing.xl,
  },

  navLink: {
    color: 'rgba(255, 255, 255, 0.7)',
    textDecoration: 'none',
    fontSize: '0.875rem',
    fontWeight: 400,
    transition: 'color 0.3s ease',
    letterSpacing: '0.02em',
    fontFamily: designSystem.fonts.primary,
  },

  // Glass components
  glassContainer: {
    background: designSystem.colors.gradients.glass,
    backdropFilter: 'blur(12px)',
    border: `1px solid ${designSystem.colors.glass.border}`,
    borderRadius: designSystem.borderRadius.lg,
    boxShadow: designSystem.shadows.glass,
  },

  glassContainerLight: {
    background: designSystem.colors.gradients.glassLight,
    backdropFilter: 'blur(12px)',
    border: `1px solid ${designSystem.colors.glass.border}`,
    borderRadius: designSystem.borderRadius.lg,
    boxShadow: designSystem.shadows.glass,
  },

  glassButton: {
    background: designSystem.colors.gradients.glassLight,
    backdropFilter: 'blur(12px)',
    border: `1px solid ${designSystem.colors.glass.border}`,
    color: designSystem.colors.primary,
    padding: `${designSystem.spacing.md} ${designSystem.spacing.lg}`,
    fontSize: '1rem',
    fontWeight: 400,
    borderRadius: designSystem.borderRadius.sm,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontFamily: designSystem.fonts.primary,
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
    textDecoration: 'none',
    display: 'inline-block',
  },

  glassInput: {
    width: '100%',
    background: designSystem.colors.glass.primary,
    border: `1px solid ${designSystem.colors.glass.border}`,
    borderRadius: designSystem.borderRadius.sm,
    padding: `${designSystem.spacing.md} ${designSystem.spacing.md}`,
    color: designSystem.colors.primary,
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(8px)',
    fontFamily: designSystem.fonts.primary,
    outline: 'none',
  },

  // Typography
  heroText: {
    fontSize: '3.5rem',
    fontWeight: 200,
    color: designSystem.colors.primary,
    lineHeight: 1.2,
    marginBottom: designSystem.spacing.xxl,
    textShadow: designSystem.shadows.text,
    letterSpacing: '-0.02em',
    fontFamily: designSystem.fonts.primary,
  },

  formText: {
    fontFamily: designSystem.fonts.primary,
    color: designSystem.colors.primary,
  },

  // Layout
  heroContainer: {
    height: 'calc(100vh - 96px)',
    backgroundImage: 'url("/Assets/img/bgAdventure.jpg")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    position: 'relative',
    borderRadius: designSystem.borderRadius.md,
    overflow: 'hidden',
    boxShadow: designSystem.shadows.hero,
    border: `2px solid ${designSystem.colors.glass.border}`,
  },

  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },

  content: {
    position: 'relative',
    zIndex: 10,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-end',
    height: '100%',
    textAlign: 'right',
    padding: `0 80px 0 ${designSystem.spacing.lg}`,
  },
};

// Reusable Components
const GlassButton = ({ children, onClick, style = {}, variant = 'primary' }) => {
  const [isHovered, setIsHovered] = useState(false);

  const buttonStyle = {
    ...styles.glassButton,
    ...style,
    transform: isHovered ? 'translateY(-2px) scale(1.02)' : 'translateY(0) scale(1)',
    boxShadow: isHovered 
      ? '0 12px 40px rgba(0, 0, 0, 0.4), 0 1px 0 rgba(255, 255, 255, 0.3) inset'
      : '0 4px 16px rgba(0, 0, 0, 0.2), 0 1px 0 rgba(255, 255, 255, 0.2) inset',
  };

  return (
    <button
      style={buttonStyle}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </button>
  );
};

const GlassInput = ({ label, type = 'text', placeholder, id, style = {} }) => {
  const [isFocused, setIsFocused] = useState(false);

  const inputStyle = {
    ...styles.glassInput,
    ...style,
    background: isFocused 
      ? 'rgba(255, 255, 255, 0.15)' 
      : designSystem.colors.glass.primary,
    borderColor: isFocused 
      ? 'rgba(255, 255, 255, 0.4)' 
      : designSystem.colors.glass.border,
    boxShadow: isFocused ? '0 0 0 2px rgba(255, 255, 255, 0.1)' : 'none',
  };

  return (
    <div style={{ marginBottom: designSystem.spacing.lg }}>
      {label && (
        <label 
          htmlFor={id}
          style={{
            ...styles.formText,
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: 400,
            marginBottom: designSystem.spacing.sm,
            letterSpacing: '0.02em',
          }}
        >
          {label}
        </label>
      )}
      <input
        type={type}
        id={id}
        placeholder={placeholder}
        style={inputStyle}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
    </div>
  );
};

const Navigation = ({ logo = "ZENNOMA", links = [] }) => {
  return (
    <nav style={styles.navbar}>
      <a href="#" style={styles.navLogo}>
        {logo}
      </a>
      <div style={styles.navLinks}>
        {links.map((link, index) => (
          <a 
            key={index}
            href={link.href || "#"} 
            style={styles.navLink}
            onMouseEnter={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.9)'}
            onMouseLeave={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.7)'}
          >
            {link.label}
          </a>
        ))}
      </div>
    </nav>
  );
};

// Main Component
export default function StyleObjectsExample() {
  const [showLogin, setShowLogin] = useState(false);

  const navLinks = [
    { label: 'Home', href: '#' },
    { label: 'About', href: '#' },
    { label: 'Security', href: '#' },
    { label: 'Contact', href: '#' },
  ];

  const handleAdventureClick = (e) => {
    e.preventDefault();
    setShowLogin(true);
  };

  return (
    <div style={styles.body}>
      <Navigation logo="ZENNOMA" links={navLinks} />
      
      <div style={styles.heroContainer}>
        <div style={styles.overlay}></div>
        
        <div style={styles.content}>
          <div style={{ maxWidth: '500px', position: 'relative', minHeight: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            
            {/* Hero Text */}
            <h1 style={{
              ...styles.heroText,
              opacity: showLogin ? 0 : 1,
              transition: 'opacity 0.6s ease-in-out',
            }}>
              Zennoma.<br />
              Secure.<br />
              Anonymous.<br />
              Yours.
            </h1>

            {/* Login Form */}
            <div style={{
              ...styles.glassContainer,
              opacity: showLogin ? 1 : 0,
              transition: 'opacity 0.6s ease-in-out',
              position: 'absolute',
              top: '50%',
              right: 0,
              transform: 'translateY(-50%)',
              width: '280px',
              minHeight: '400px',
              padding: `${designSystem.spacing.xl} ${designSystem.spacing.lg}`,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}>
              <h2 style={{
                ...styles.formText,
                fontSize: '1.75rem',
                fontWeight: 200,
                textAlign: 'center',
                marginBottom: designSystem.spacing.xl,
                textShadow: designSystem.shadows.text,
                letterSpacing: '-0.01em',
              }}>
                Secure Access
              </h2>
              
              <div>
                <GlassInput 
                  label="Username" 
                  id="username" 
                  placeholder="Enter your username" 
                />
                
                <GlassInput 
                  label="Password" 
                  type="password" 
                  id="password" 
                  placeholder="Enter your password" 
                />
                
                <GlassButton style={{ width: '100%', marginBottom: designSystem.spacing.md, marginTop: designSystem.spacing.sm }}>
                  Sign In
                </GlassButton>
                
                <div style={{
                  ...styles.formText,
                  textAlign: 'center',
                  fontSize: '0.875rem',
                }}>
                  Don't have an account?{' '}
                  <a href="#" style={{
                    ...styles.formText,
                    textDecoration: 'none',
                    fontWeight: 400,
                    transition: 'opacity 0.3s ease',
                  }}>
                    Sign up
                  </a>
                </div>
              </div>
            </div>

            {/* Adventure Button */}
            <GlassButton 
              onClick={handleAdventureClick}
              style={{
                opacity: showLogin ? 0 : 1,
                transition: 'opacity 0.6s ease-in-out',
                fontSize: '1.125rem',
                letterSpacing: '0.02em',
                width: 'fit-content',
              }}
            >
              Begin your Adventure
            </GlassButton>

          </div>
        </div>
      </div>
    </div>
  );
}
