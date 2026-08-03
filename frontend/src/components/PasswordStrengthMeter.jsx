import React from 'react';
import { ShieldCheck, ShieldAlert, AlertCircle } from 'lucide-react';

export function calculatePasswordStrength(password) {
  if (!password) {
    return {
      score: 0,
      label: 'Too Short',
      color: 'bg-[#E2E8F0]',
      textClass: 'text-[#94A3B8]',
      segments: 0,
      tip: 'Start typing to check password security level.',
      checks: { length: false, lengthTwelve: false, upper: false, lower: false, number: false, symbol: false },
    };
  }

  const checks = {
    length: password.length >= 8,
    lengthTwelve: password.length >= 12,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    symbol: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  // Length calculation: gradual scaling up to 12 characters (50% max)
  const lengthCap = Math.min(password.length, 12);
  const lengthScore = Math.round((lengthCap / 12) * 50);

  // Character variety bonuses (50% max)
  let varietyScore = 0;
  if (checks.upper) varietyScore += 12.5;
  if (checks.lower) varietyScore += 12.5;
  if (checks.number) varietyScore += 12.5;
  if (checks.symbol) varietyScore += 12.5;

  const rawScore = Math.round(lengthScore + varietyScore);
  const score = Math.min(100, Math.max(10, rawScore));

  let label, color, textClass, segments, tip;

  if (score <= 30) {
    label = 'Weak';
    color = 'bg-gradient-to-r from-[#EF4444] to-[#F87171]';
    textClass = 'text-[#EF4444]';
    segments = 1;
    tip = `Length: ${password.length}/12 chars. Add uppercase, numbers, or symbols.`;
  } else if (score <= 55) {
    label = 'Fair';
    color = 'bg-gradient-to-r from-[#F97316] to-[#FB923C]';
    textClass = 'text-[#F97316]';
    segments = 2;
    tip = `Length: ${password.length}/12 chars. Extend length towards 12 for high rating.`;
  } else if (score <= 80) {
    label = 'Good';
    color = 'bg-gradient-to-r from-[#F59E0B] to-[#FBBF24]';
    textClass = 'text-[#D97706]';
    segments = 3;
    tip = `Length: ${password.length}/12 chars. Almost there! Reach 12 chars for top strength.`;
  } else if (score <= 95) {
    label = 'Strong';
    color = 'bg-gradient-to-r from-[#10B981] to-[#34D399]';
    textClass = 'text-[#059669]';
    segments = 4;
    tip = `Length: ${password.length}/12 chars. Strong password! Meets top security standards.`;
  } else {
    label = 'Unbreakable';
    color = 'bg-gradient-to-r from-[#7C3AED] via-[#6366F1] to-[#3B82F6]';
    textClass = 'text-[#7C3AED]';
    segments = 4;
    tip = `Length: ${password.length}/12 chars. Maximum 100% security rating unlocked!`;
  }

  return { score, label, color, textClass, segments, tip, checks };
}

export default function PasswordStrengthMeter({ password }) {
  if (!password) return null;

  const strength = calculatePasswordStrength(password);

  return (
    <div className="mt-3 p-3.5 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] space-y-2.5 shadow-sm transition-all duration-300 animate-in fade-in">
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#0F172A]">
          {strength.score >= 80 ? (
            <ShieldCheck className="w-4 h-4 text-[#7C3AED]" />
          ) : strength.score >= 50 ? (
            <ShieldCheck className="w-4 h-4 text-[#10B981]" />
          ) : (
            <ShieldAlert className="w-4 h-4 text-[#F59E0B]" />
          )}
          <span>Password Strength</span>
        </div>

        <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-white border border-[#E2E8F0] shadow-xs ${strength.textClass}`}>
          {strength.label} ({strength.score}%)
        </span>
      </div>

      {/* 4 Segmented Visual Progress Bar */}
      <div className="grid grid-cols-4 gap-1.5">
        {[1, 2, 3, 4].map((step) => {
          const isActive = step <= strength.segments;
          return (
            <div
              key={step}
              className="h-2 rounded-full bg-[#E2E8F0] overflow-hidden relative"
            >
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  isActive ? strength.color : 'w-0'
                }`}
                style={{ width: isActive ? '100%' : '0%' }}
              />
            </div>
          );
        })}
      </div>

      {/* Smart Tip Alert */}
      <p className="text-[11px] font-medium text-[#64748B] flex items-center gap-1.5 leading-tight">
        <AlertCircle className="w-3.5 h-3.5 shrink-0 text-[#7C3AED]" />
        <span>{strength.tip}</span>
      </p>

      {/* Criteria Grid */}
      <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-[#E2E8F0] text-[11px]">
        <div className={`flex items-center gap-1.5 font-semibold ${strength.checks.lengthTwelve ? 'text-[#059669]' : strength.checks.length ? 'text-[#D97706]' : 'text-[#94A3B8]'}`}>
          <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${strength.checks.lengthTwelve ? 'bg-[#D1FAE5] text-[#059669]' : 'bg-[#E2E8F0] text-[#94A3B8]'}`}>
            {strength.checks.lengthTwelve ? '✓' : '•'}
          </div>
          <span>Length ({password.length}/12 chars)</span>
        </div>

        <div className={`flex items-center gap-1.5 font-semibold ${strength.checks.upper ? 'text-[#059669]' : 'text-[#94A3B8]'}`}>
          <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${strength.checks.upper ? 'bg-[#D1FAE5] text-[#059669]' : 'bg-[#E2E8F0] text-[#94A3B8]'}`}>
            {strength.checks.upper ? '✓' : '•'}
          </div>
          <span>Uppercase (A-Z)</span>
        </div>

        <div className={`flex items-center gap-1.5 font-semibold ${strength.checks.number ? 'text-[#059669]' : 'text-[#94A3B8]'}`}>
          <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${strength.checks.number ? 'bg-[#D1FAE5] text-[#059669]' : 'bg-[#E2E8F0] text-[#94A3B8]'}`}>
            {strength.checks.number ? '✓' : '•'}
          </div>
          <span>Number (0-9)</span>
        </div>

        <div className={`flex items-center gap-1.5 font-semibold ${strength.checks.symbol ? 'text-[#059669]' : 'text-[#94A3B8]'}`}>
          <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${strength.checks.symbol ? 'bg-[#D1FAE5] text-[#059669]' : 'bg-[#E2E8F0] text-[#94A3B8]'}`}>
            {strength.checks.symbol ? '✓' : '•'}
          </div>
          <span>Symbol (!@#$)</span>
        </div>
      </div>
    </div>
  );
}
