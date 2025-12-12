import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ThemeType } from '../types';

interface ThemeLayoutProps {
  theme: ThemeType;
  children: React.ReactNode;
  className?: string;
}

const VIDEO_URLS: Record<ThemeType, string> = {
  clean: 'https://assets.mixkit.co/videos/preview/mixkit-white-curtains-moving-in-the-wind-1969-large.mp4',
  neon: 'https://assets.mixkit.co/videos/preview/mixkit-abstract-neon-lights-in-motion-12059-large.mp4',
  sunset: 'https://assets.mixkit.co/videos/preview/mixkit-silhouettes-of-palm-trees-during-a-sunset-4355-large.mp4',
  black: 'https://assets.mixkit.co/videos/preview/mixkit-light-particles-loop-on-black-background-3363-large.mp4',
  heavie: 'https://assets.mixkit.co/videos/preview/mixkit-red-smoke-rising-on-a-black-background-4235-large.mp4'
};

const ThemeLayout: React.FC<ThemeLayoutProps> = ({ theme, children, className = '' }) => {
  const [styles, setStyles] = useState<React.CSSProperties>({});
  const location = useLocation();

  // Show video only on Guest App or Login page, not Admin/Kitchen
  const showVideo = location.pathname === '/' || location.pathname.startsWith('/app');

  useEffect(() => {
    let newStyles: React.CSSProperties = {};
    const root = document.documentElement;

    switch (theme) {
      case 'neon':
        newStyles = {
          '--bg-color': '#0f0f0f',
          '--card-bg': 'rgba(26, 26, 26, 0.8)', 
          '--text-color': '#ffffff',
          '--accent-color': '#ff00ff', // Pink
          '--border-color': '#00ffff', // Cyan
        } as React.CSSProperties;
        break;
      case 'sunset':
        newStyles = {
          '--bg-color': '#2c003e',
          '--card-bg': 'rgba(76, 26, 87, 0.8)',
          '--text-color': '#ffd6a5',
          '--accent-color': '#ff4d4d',
          '--border-color': '#ffa600',
        } as React.CSSProperties;
        break;
      case 'black':
        // Interactive Black: Gold accents, deep black, transparent glass
        newStyles = {
          '--bg-color': '#000000',
          '--card-bg': 'rgba(10, 10, 10, 0.6)',
          '--text-color': '#f8f9fa',
          '--accent-color': '#FFD700', // Gold
          '--border-color': 'rgba(255, 215, 0, 0.3)', // Gold transparent
        } as React.CSSProperties;
        break;
      case 'heavie':
        newStyles = {
          '--bg-color': '#1f2937',
          '--card-bg': 'rgba(55, 65, 81, 0.9)',
          '--text-color': '#d1d5db',
          '--accent-color': '#f87171', // Red rustic
          '--border-color': '#4b5563',
        } as React.CSSProperties;
        break;
      case 'clean':
      default:
        newStyles = {
          '--bg-color': '#f3f4f6',
          '--card-bg': 'rgba(255, 255, 255, 0.9)',
          '--text-color': '#1f2937',
          '--accent-color': '#3b82f6',
          '--border-color': '#e5e7eb',
        } as React.CSSProperties;
        break;
    }

    setStyles(newStyles);
    
    // Apply to body for global scrollbar/bg
    Object.entries(newStyles).forEach(([key, value]) => {
      root.style.setProperty(key, value as string);
    });

  }, [theme]);

  const getBaseClasses = () => {
    switch (theme) {
      case 'neon': return 'bg-gray-950 text-white font-mono';
      case 'sunset': return 'bg-purple-950 text-orange-100 font-sans';
      case 'black': return 'bg-black text-gray-100 font-sans tracking-wide';
      case 'heavie': return 'bg-gray-800 text-gray-200 font-bold tracking-wide';
      default: return 'bg-gray-100 text-gray-900 font-sans';
    }
  };

  return (
    <div 
      className={`min-h-screen transition-colors duration-500 relative overflow-hidden ${getBaseClasses()} ${className}`}
      style={styles}
    >
      {/* Background Video Layer */}
      {showVideo && (
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-[var(--bg-color)] opacity-60 z-10 mix-blend-multiply transition-opacity duration-1000"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-color)] via-transparent to-[var(--bg-color)] z-10 opacity-90"></div>
          <video
            key={theme} // Force reload on theme change
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover transition-opacity duration-1000 opacity-60"
            src={VIDEO_URLS[theme]}
          />
        </div>
      )}

      {/* Decorative Overlays (Theme specific) */}
      {theme === 'neon' && <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,0,255,0.1),transparent_50%)]" />}
      {theme === 'sunset' && <div className="fixed inset-0 pointer-events-none z-0 bg-[linear-gradient(to_bottom,rgba(255,77,77,0.1),rgba(44,0,62,0.8))]" />}
      
      {/* Specific Interactive Overlay for 'black' theme */}
      {theme === 'black' && showVideo && (
        <>
          <div className="fixed inset-0 pointer-events-none z-0 interactive-grid" />
          <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(circle_at_center,rgba(255,215,0,0.05),transparent_70%)]" />
        </>
      )}

      {/* Content Layer */}
      <div className={`relative z-20 w-full h-full ${theme === 'black' ? 'backdrop-blur-[2px]' : ''}`}>
        {children}
      </div>
    </div>
  );
};

export default ThemeLayout;