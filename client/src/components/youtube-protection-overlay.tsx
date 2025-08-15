import { useEffect, useRef } from 'react';

interface YouTubeProtectionOverlayProps {
  containerRef: React.RefObject<HTMLDivElement>;
}

export default function YouTubeProtectionOverlay({ containerRef }: YouTubeProtectionOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const preventCopyOperations = (e: ClipboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    const preventKeyboardShortcuts = (e: KeyboardEvent) => {
      // Only block copy-related shortcuts, not all interactions
      if (
        (e.ctrlKey && (e.key === 'c' || e.key === 'C')) ||
        (e.metaKey && (e.key === 'c' || e.key === 'C'))
      ) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    const preventContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Only add targeted event blocking, not comprehensive blocking
    document.addEventListener('copy', preventCopyOperations, true);
    document.addEventListener('cut', preventCopyOperations, true);
    document.addEventListener('keydown', preventKeyboardShortcuts, true);
    document.addEventListener('contextmenu', preventContextMenu, true);

    return () => {
      document.removeEventListener('copy', preventCopyOperations, true);
      document.removeEventListener('cut', preventCopyOperations, true);
      document.removeEventListener('keydown', preventKeyboardShortcuts, true);
      document.removeEventListener('contextmenu', preventContextMenu, true);
    };
  }, [containerRef]);

  return (
    <div
      ref={overlayRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 50 }}
    >
      {/* Responsive extended coverage area - 2cm around copy link functionality */}
      
      {/* Large blocking area covering entire copy link region - responsive sizing */}
      <div className="absolute top-0 right-0 w-48 h-32 sm:w-64 sm:h-40 md:w-80 md:h-48 bg-transparent pointer-events-auto" 
           onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
           onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}
           onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
           onMouseUp={(e) => { e.preventDefault(); e.stopPropagation(); }}
           onDoubleClick={(e) => { e.preventDefault(); e.stopPropagation(); }} />
      
      {/* Additional coverage for notification area - responsive positioning */}
      <div className="absolute top-8 right-4 w-48 h-20 sm:top-12 sm:right-6 sm:w-56 sm:h-24 md:top-16 md:right-8 md:w-72 md:h-32 bg-transparent pointer-events-auto"
           onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
           onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}
           onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
           onMouseUp={(e) => { e.preventDefault(); e.stopPropagation(); }} />
    </div>
  );
}