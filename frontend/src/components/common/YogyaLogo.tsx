import React from 'react';

interface YogyaLogoProps {
  /**
   * 'full': Icon + YOGYA wordmark
   * 'icon': Icon emblem only
   */
  variant?: 'full' | 'icon';
  /**
   * 'light': Dark navy text/elements on light background
   * 'dark': White/light elements for dark navy background
   */
  theme?: 'light' | 'dark';
  /**
   * Size presets or custom dimension
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showSubtitle?: boolean;
  subtitleText?: string;
}

export const YogyaIcon: React.FC<{ size?: number | string; className?: string; theme?: 'light' | 'dark' }> = ({
  size = 28,
  className = '',
  theme = 'light',
}) => {
  const isDark = theme === 'dark';
  const navyColor = isDark ? '#FFFFFF' : '#071A33';
  const blueColor = '#2563A6';
  const lightBlueColor = '#4B88CC';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-label="Yogya Logo"
    >
      {/* Outer Shield Left & Bottom Navy Arc */}
      <path
        d="M20 22 C 34 20, 48 14, 52 10 L 52 18 C 42 22, 28 27, 28 27 L 24 54 C 24 67, 36 78, 48 83 L 48 93 C 30 87, 15 73, 15 54 Z"
        fill={navyColor}
      />
      
      {/* Upper Left Cyan/Sky Blue Facet */}
      <path
        d="M32 30 C 44 26, 52 22, 52 18 L 52 26 C 44 29, 36 34, 36 34 Z"
        fill={lightBlueColor}
      />

      {/* Central Y Left Branch (Light/Secondary Blue) */}
      <path
        d="M30 38 L 47 62 L 40 62 L 24 38 Z"
        fill={blueColor}
      />

      {/* Central Y / Shield Lower Vertex Core (Navy / Deep Blue) */}
      <path
        d="M40 62 L 48 74 L 56 62 L 48 50 Z"
        fill={navyColor}
      />

      {/* Isometric Bottom Right Shield Facet */}
      <path
        d="M48 74 L 48 93 C 58 89, 68 81, 74 71 L 64 65 C 59 71, 54 74, 48 74 Z"
        fill={navyColor}
      />

      {/* Dynamic Rising Checkmark / Y-Arm (Vibrant Secondary Blue) */}
      <path
        d="M40 62 L 48 74 L 56 62 L 85 24 L 75 14 L 48 50 Z"
        fill={blueColor}
      />

      {/* Top Right Tip Highlight */}
      <path
        d="M75 14 L 85 24 L 89 20 L 79 10 Z"
        fill={lightBlueColor}
      />
    </svg>
  );
};

export const YogyaLogo: React.FC<YogyaLogoProps> = ({
  variant = 'full',
  theme = 'light',
  size = 'md',
  className = '',
  showSubtitle = false,
  subtitleText = 'LEGAL METROLOGY',
}) => {
  const isDark = theme === 'dark';
  const navyColor = isDark ? 'text-[#FFFFFF]' : 'text-[#071A33]';
  const subColor = isDark ? 'text-[#94A3B8]' : 'text-[#667085]';

  const iconSizes = {
    xs: 20,
    sm: 24,
    md: 30,
    lg: 38,
    xl: 48,
  };

  const textSizes = {
    xs: 'text-sm font-bold tracking-tight',
    sm: 'text-base font-bold tracking-tight',
    md: 'text-lg font-bold tracking-tight',
    lg: 'text-xl font-bold tracking-tight',
    xl: 'text-2xl font-bold tracking-tight',
  };

  const currentIconSize = iconSizes[size];

  if (variant === 'icon') {
    return <YogyaIcon size={currentIconSize} theme={theme} className={className} />;
  }

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <YogyaIcon size={currentIconSize} theme={theme} />
      <div className="flex flex-col">
        <span className={`font-sans ${textSizes[size]} ${navyColor} leading-none tracking-normal font-extrabold`}>
          YOGYA
        </span>
        {showSubtitle && (
          <span className={`text-[9px] sm:text-[10px] uppercase font-mono tracking-widest ${subColor} mt-1 leading-none`}>
            {subtitleText}
          </span>
        )}
      </div>
    </div>
  );
};

export default YogyaLogo;
