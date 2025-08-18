import React from 'react';

// Design System Constants
export const DESIGN_TOKENS = {
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
    primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'SF Pro Display', system-ui, sans-serif",
  },
  shadows: {
    glass: '0 8px 32px rgba(0, 0, 0, 0.3), 0 1px 0 rgba(255, 255, 255, 0.2) inset, 0 -1px 0 rgba(0, 0, 0, 0.1) inset',
    hero: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
    text: '0 2px 4px rgba(0, 0, 0, 0.5)',
  }
};

// Global Styles Component
export const GlobalStyles = () => (
  <style jsx global>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500;600;700&display=swap');
    
    .glassmorphism {
      background: ${DESIGN_TOKENS.colors.gradients.glass};
      backdrop-filter: blur(12px);
      border: 1px solid ${DESIGN_TOKENS.colors.glass.border};
    }
    
    .glassmorphism-light {
      background: ${DESIGN_TOKENS.colors.gradients.glassLight};
      backdrop-filter: blur(12px);
      border: 1px solid ${DESIGN_TOKENS.colors.glass.border};
    }
    
    .hero-text {
      font-family: ${DESIGN_TOKENS.fonts.primary};
      font-weight: 200;
      color: ${DESIGN_TOKENS.colors.primary};
      text-shadow: ${DESIGN_TOKENS.shadows.text};
      letter-spacing: -0.02em;
      line-height: 1.2;
    }
    
    .form-text {
      font-family: ${DESIGN_TOKENS.fonts.primary};
      color: ${DESIGN_TOKENS.colors.primary};
    }
    
    .form-input {
      background: ${DESIGN_TOKENS.colors.glass.primary};
      border: 1px solid ${DESIGN_TOKENS.colors.glass.border};
      backdrop-filter: blur(8px);
      color: ${DESIGN_TOKENS.colors.primary};
      font-family: ${DESIGN_TOKENS.fonts.primary};
    }
    
    .form-input:focus {
      background: ${DESIGN_TOKENS.colors.glass.light};
      border-color: rgba(255, 255, 255, 0.4);
      box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.1);
    }
    
    .form-input::placeholder {
      color: ${DESIGN_TOKENS.colors.primaryAlpha};
    }
    
    .nav-text {
      font-family: ${DESIGN_TOKENS.fonts.primary};
    }
  `}</style>
);

// Reusable Glass Button Component
export const GlassButton = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  onClick, 
  className = '',
  ...props 
}) => {
  const sizeClasses = {
    sm: 'py-2 px-4 text-sm',
    md: 'py-3 px-6 text-base',
    lg: 'py-4 px-8 text-lg',
  };

  const variantClasses = {
    primary: 'glassmorphism',
    light: 'glassmorphism-light',
  };

  return (
    <button
      className={`${variantClasses[variant]} form-text ${sizeClasses[size]} font-normal rounded-lg cursor-pointer transition-all duration-300 hover:bg-gradient-to-br hover:from-white/25 hover:to-white/10 hover:-translate-y-1 ${className}`}
      onClick={onClick}
      style={{
        boxShadow: DESIGN_TOKENS.shadows.glass,
      }}
      {...props}
    >
      {children}
    </button>
  );
};

// Reusable Glass Input Component
export const GlassInput = ({ 
  label, 
  type = 'text', 
  placeholder, 
  id, 
  className = '',
  ...props 
}) => {
  return (
    <div className={className}>
      {label && (
        <label className="form-text block text-sm font-normal mb-2 tracking-wide" htmlFor={id}>
          {label}
        </label>
      )}
      <input
        type={type}
        id={id}
        className="form-input w-full rounded-lg px-4 py-3 text-base transition-all duration-300 focus:outline-none"
        placeholder={placeholder}
        {...props}
      />
    </div>
  );
};

// Reusable Glass Container Component
export const GlassContainer = ({ 
  children, 
  variant = 'primary', 
  className = '',
  ...props 
}) => {
  const variantClasses = {
    primary: 'glassmorphism',
    light: 'glassmorphism-light',
  };

  return (
    <div
      className={`${variantClasses[variant]} rounded-2xl ${className}`}
      style={{
        boxShadow: DESIGN_TOKENS.shadows.glass,
      }}
      {...props}
    >
      {children}
    </div>
  );
};

// Navigation Component
export const Navigation = ({ logo = "ZENNOMA", links = [] }) => {
  return (
    <nav className="absolute top-0 left-12 right-12 h-12 flex items-center justify-between px-6 z-20">
      <a href="#" className="nav-text text-white/90 text-lg font-bold tracking-wider no-underline">
        {logo}
      </a>
      <div className="flex items-center gap-8">
        {links.map((link, index) => (
          <a 
            key={index}
            href={link.href || "#"} 
            className="nav-text text-white/70 no-underline text-sm font-normal tracking-wide hover:text-white/90 transition-colors duration-300"
          >
            {link.label}
          </a>
        ))}
      </div>
    </nav>
  );
};

// Example usage component
export default function DesignSystemExample() {
  const navLinks = [
    { label: 'Home', href: '#' },
    { label: 'About', href: '#' },
    { label: 'Security', href: '#' },
    { label: 'Contact', href: '#' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-12 relative">
      <GlobalStyles />
      
      <Navigation logo="ZENNOMA" links={navLinks} />
      
      <div className="flex flex-col items-center justify-center min-h-screen space-y-8">
        <h1 className="hero-text text-6xl text-center">
          Design System<br />
          Components
        </h1>
        
        <GlassContainer variant="light" className="p-8 max-w-md w-full space-y-6">
          <h2 className="form-text text-2xl font-light text-center mb-6">
            Example Form
          </h2>
          
          <GlassInput 
            label="Username" 
            id="username" 
            placeholder="Enter your username" 
          />
          
          <GlassInput 
            label="Email" 
            type="email" 
            id="email" 
            placeholder="Enter your email" 
          />
          
          <GlassButton variant="light" size="lg" className="w-full">
            Submit
          </GlassButton>
        </GlassContainer>
        
        <div className="flex gap-4">
          <GlassButton variant="primary" size="sm">
            Small Button
          </GlassButton>
          <GlassButton variant="light" size="md">
            Medium Button
          </GlassButton>
          <GlassButton variant="primary" size="lg">
            Large Button
          </GlassButton>
        </div>
      </div>
    </div>
  );
}
