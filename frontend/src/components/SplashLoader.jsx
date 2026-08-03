import React, { useState, useEffect } from 'react';
import { Zap } from 'lucide-react';

export default function SplashLoader({ onComplete, duration = 1800 }) {
  const [visible, setVisible] = useState(true);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadingOut(true);
      const hideTimer = setTimeout(() => {
        setVisible(false);
        if (onComplete) onComplete();
      }, 400); // 400ms fade transition
      return () => clearTimeout(hideTimer);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] backdrop-blur-xl bg-[#0F172A]/75 flex flex-col items-center justify-center transition-opacity duration-500 ${
        fadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Ambient Radial Glow */}
      <div className="absolute w-[300px] h-[300px] rounded-full bg-[#7C3AED]/20 blur-3xl animate-pulse" />

      <div className="relative z-10 flex flex-col items-center text-center space-y-5 p-8 bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl max-w-sm w-[90%] mx-auto">
        {/* Animated Perfect Circular Logo Badge */}
        <div className="relative flex items-center justify-center">
          <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-[#7C3AED] via-[#6366F1] to-[#3B82F6] opacity-75 blur-md animate-pulse" />
          <div className="relative w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center text-white shadow-royal-glow ring-4 ring-white/20">
            <Zap className="w-8 h-8 fill-white text-white animate-pulse" />
          </div>
        </div>

        {/* Brand Name & Typography */}
        <div className="space-y-1">
          <div className="flex items-center justify-center text-3xl font-extrabold tracking-tight text-white font-sans">
            <span>Interv</span>
            <span className="text-[#818CF8]">A</span>
            <span className="relative inline-flex items-center justify-center text-[#818CF8]">
              i
              {/* Animated Glowing Emerald Dot over 'i' */}
              <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#10B981] animate-ping opacity-75" />
              <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#10B981] shadow-[0_0_12px_#10B981]" />
            </span>
          </div>

          <p className="text-[11px] font-bold text-[#94A3B8] tracking-widest uppercase">
            AI Interview Studio
          </p>
        </div>

        {/* Smooth Loader Progress Line */}
        <div className="w-36 h-1.5 bg-white/10 rounded-full overflow-hidden relative border border-white/10">
          <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#7C3AED] via-[#6366F1] to-[#10B981] animate-[splashProgress_1.8s_ease-in-out_infinite] w-full rounded-full" />
        </div>
      </div>
    </div>
  );
}
