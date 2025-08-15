import React from 'react';

/**
 * Universal Video Protection System
 * This component ensures ALL YouTube embeds have consistent blocking functionality
 * Applied automatically to any video embed component
 */
interface VideoProtectionSystemProps {
  className?: string;
}

export default function VideoProtectionSystem({ className = "" }: VideoProtectionSystemProps) {
  return (
    <>
      {/* Interactive blocking area for top-left YouTube logo - transparent with hover visibility */}
      <div 
        className={`youtube-logo-blocker absolute top-0 left-0 w-full h-12 sm:h-14 md:h-16 bg-transparent hover:bg-black hover:bg-opacity-80 z-[999] pointer-events-auto transition-all duration-300 cursor-pointer ${className}`}
        onClick={(e) => { 
          e.preventDefault(); 
          e.stopPropagation(); 
        }}
        onMouseDown={(e) => { 
          e.preventDefault(); 
          e.stopPropagation(); 
        }}
        onMouseUp={(e) => { 
          e.preventDefault(); 
          e.stopPropagation(); 
        }}
        onContextMenu={(e) => { 
          e.preventDefault(); 
          e.stopPropagation(); 
        }}
        title="Protected YouTube branding area"
      />
      
      {/* Hide bottom video ID area - black patch over video ID numbers */}
      <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-8 sm:w-32 sm:h-10 md:w-40 md:h-12 bg-black rounded z-20 pointer-events-none ${className}`} />
      
      {/* Bottom-left YouTube text blocker - transparent with hover visibility - extended 3cm wider */}
      <div 
        className={`absolute bottom-0 left-0 w-44 h-16 sm:w-48 sm:h-18 md:w-52 md:h-20 bg-transparent hover:bg-black hover:bg-opacity-80 z-[999] pointer-events-auto cursor-pointer transition-all duration-300 ${className}`}
        onClick={(e) => { 
          e.preventDefault(); 
          e.stopPropagation(); 
        }}
        onContextMenu={(e) => { 
          e.preventDefault(); 
          e.stopPropagation(); 
        }}
        title="YouTube branding blocked"
      />

      {/* Bottom-right corner YouTube logo blocker - transparent with hover visibility */}
      <div 
        className={`absolute bottom-0 right-0 w-20 h-12 bg-transparent hover:bg-black hover:bg-opacity-80 z-[999] pointer-events-auto cursor-pointer transition-all duration-300 ${className}`}
        onClick={(e) => { 
          e.preventDefault(); 
          e.stopPropagation(); 
        }}
        onContextMenu={(e) => { 
          e.preventDefault(); 
          e.stopPropagation(); 
        }}
        title="YouTube branding blocked"
      />
    </>
  );
}

/**
 * Hook to automatically apply video protection
 * Use this in any component that embeds YouTube videos
 */
export function useVideoProtection() {
  return {
    ProtectionOverlay: VideoProtectionSystem,
    protectionProps: {
      className: "video-protection-system"
    }
  };
}