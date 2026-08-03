import React from 'react';

export default function AiBackgroundAnimation() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none">
      {/* Soft, ultra-subtle top ambient glow */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[1000px] h-[350px] bg-gradient-to-b from-[#F5F3FF] via-[#FAFAFC] dark:from-[#7C3AED]/15 dark:via-transparent to-transparent rounded-full opacity-60 filter blur-[80px]" />
    </div>
  );
}
