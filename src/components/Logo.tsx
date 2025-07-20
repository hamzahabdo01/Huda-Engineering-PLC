
import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'icon' | 'compact' | 'horizontal';
}

const Logo: React.FC<LogoProps> = ({ className = '', size = 'md', variant = 'compact' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  // Icon variant - square with teal background
  const IconLogo = () => (
    <svg viewBox="0 0 64 64" className="w-full h-full">
      {/* Teal background */}
      <rect width="64" height="64" fill="#00555b"/>
      
      {/* White H shape */}
      {/* Left vertical bar */}
      <rect x="12" y="12" width="12" height="40" fill="white"/>
      
      {/* Right vertical bar */}
      <rect x="40" y="12" width="12" height="40" fill="white"/>
      
      {/* Top horizontal bar */}
      <rect x="24" y="12" width="16" height="12" fill="white"/>
      
      {/* Middle horizontal bar */}
      <rect x="24" y="26" width="16" height="12" fill="white"/>
      
      {/* Bottom horizontal bar */}
      <rect x="24" y="40" width="16" height="12" fill="white"/>
      
      {/* Yellow accent */}
      <rect x="28" y="16" width="8" height="8" fill="#fbce18"/>
      <rect x="28" y="44" width="8" height="8" fill="#fbce18"/>
    </svg>
  );

  // Compact variant - square with white background
  const CompactLogo = () => (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      {/* White background */}
      <rect width="100" height="100" fill="white"/>
      
      {/* Teal H shape */}
      {/* Left vertical bar */}
      <rect x="15" y="15" width="20" height="70" fill="#00555b"/>
      
      {/* Right vertical bar */}
      <rect x="65" y="15" width="20" height="70" fill="#00555b"/>
      
      {/* Top horizontal bar */}
      <rect x="35" y="15" width="30" height="20" fill="#00555b"/>
      
      {/* Middle horizontal bar */}
      <rect x="35" y="40" width="30" height="20" fill="#00555b"/>
      
      {/* Bottom horizontal bar */}
      <rect x="35" y="65" width="30" height="20" fill="#00555b"/>
      
      {/* Yellow accent bars */}
      {/* Top yellow accent */}
      <rect x="42" y="22" width="16" height="13" fill="#fbce18"/>
      
      {/* Bottom yellow accent */}
      <rect x="42" y="72" width="16" height="13" fill="#fbce18"/>
    </svg>
  );

  // Horizontal variant - wider format
  const HorizontalLogo = () => (
    <svg viewBox="0 0 200 120" className="w-full h-full">
      {/* Teal background */}
      <rect width="200" height="120" fill="#00555b"/>
      
      {/* White H shape */}
      {/* Left vertical bar */}
      <rect x="30" y="20" width="30" height="80" fill="white"/>
      
      {/* Right vertical bar with angled elements */}
      <rect x="140" y="20" width="30" height="80" fill="white"/>
      
      {/* Top horizontal connector */}
      <rect x="60" y="20" width="80" height="25" fill="white"/>
      
      {/* Middle horizontal bar */}
      <rect x="60" y="47.5" width="80" height="25" fill="white"/>
      
      {/* Bottom horizontal connector */}
      <rect x="60" y="75" width="80" height="25" fill="white"/>
      
      {/* Yellow accent bars */}
      {/* Top yellow bar */}
      <rect x="100" y="35" width="20" height="37.5" fill="#fbce18"/>
      
      {/* Bottom yellow bar */}
      <rect x="100" y="87.5" width="20" height="12.5" fill="#fbce18"/>
    </svg>
  );

  const renderLogo = () => {
    switch (variant) {
      case 'icon':
        return <IconLogo />;
      case 'horizontal':
        return <HorizontalLogo />;
      case 'compact':
      default:
        return <CompactLogo />;
    }
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      {renderLogo()}
    </div>
  );
};

export default Logo;
