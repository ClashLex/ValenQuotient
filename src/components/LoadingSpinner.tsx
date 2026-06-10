import React from 'react';

/**
 * Premium glassmorphic loading spinner matching the ValenQuotient cyberpunk aesthetic.
 */
export default function LoadingSpinner() {
  return (
    <div className="w-full min-h-[300px] flex-grow flex flex-col items-center justify-center gap-4 relative">
      <div className="relative w-16 h-16">
        {/* Outer glowing pulsing ring */}
        <div className="absolute inset-0 rounded-full border border-neon/10 animate-ping opacity-70" />
        
        {/* Inner rotating gradient spinner */}
        <div className="absolute inset-0 rounded-full border-[3px] border-white/5 border-t-neon animate-spin" />
        
        {/* Center glowing dot */}
        <div className="absolute inset-[24px] rounded-full bg-neon shadow-[0_0_12px_#6FFF00] animate-pulse" />
      </div>
      
      <div className="flex flex-col items-center gap-1">
        <span className="font-mono text-[9px] text-neon uppercase tracking-[0.25em] animate-pulse">
          Loading Carbon Module
        </span>
        <span className="font-mono text-[7px] text-cream/40 uppercase tracking-widest">
          Syncing with regional grid
        </span>
      </div>
    </div>
  );
}
