
import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Logo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Left vertical bar */}
        <rect x="10" y="10" width="15" height="80" fill="currentColor" />
        
        {/* Right vertical bar */}
        <rect x="75" y="10" width="15" height="80" fill="currentColor" />
        
        {/* Top horizontal bar */}
        <rect x="25" y="10" width="50" height="15" fill="currentColor" />
        
        {/* Middle horizontal bar with accent color */}
        <rect x="25" y="42.5" width="50" height="15" fill="#fbce18" />
        
        {/* Bottom horizontal bar */}
        <rect x="25" y="75" width="50" height="15" fill="currentColor" />
      </svg>
    </div>
  );
};

export default Logo;
