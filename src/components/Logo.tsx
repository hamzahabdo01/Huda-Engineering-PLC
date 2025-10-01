import React from 'react';

// 1) Import each pre‑colored logo file
import logoWhite from '../assets/Huda Engineering Logo Transparent-11.png';
import logoYellow from '../assets/Huda Engineering Logo Display-09.jpg';
import logoTeal  from '../assets/Huda Engineering Logo Transparent-10.webp';
import logoWy  from '../assets/Enlarged.png';
// …and import any others you have

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  /** 
   * Choose which colored version of the logo to render.
   * Must match one of the imported files above.
   */
  variant?: 'white' | 'yellow' | 'teal' | 'wy';
}

const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  variant = 'white'
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  // 2) Map variant names to the imported images
  const variants: Record<LogoProps['variant'], string> = {
    white:  logoWhite,
    yellow: logoYellow,
    teal:   logoTeal,
    wy:     logoWy
  };

  const src = variants[variant];

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <img
        src={src}
        alt={`Logo (${variant})`}
        className="w-full h-full object-contain"
      />
    </div>
  );
};

export default Logo;
