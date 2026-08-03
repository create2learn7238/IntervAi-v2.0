import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

/**
 * StatCard - Production-ready statistics card with WCAG AA compliance.
 *
 * @param {string} title - Card header label
 * @param {string|number} value - Main statistic value
 * @param {string} [subtitle] - Secondary descriptive text
 * @param {React.ElementType} [icon] - Lucide icon component
 * @param {'up'|'down'} [trend] - Direction of change
 * @param {string} [trendValue] - Percentage or text indicator of change
 */
export default function StatCard({ title, value, subtitle, icon: Icon, trend, trendValue }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {title}
          </p>
          <h3 className="text-2xl font-semibold tracking-tight text-slate-900">
            {value}
          </h3>
        </div>

        {Icon && (
          <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {(subtitle || trendValue) && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          {subtitle && (
            <span className="text-xs font-normal leading-relaxed text-slate-500 truncate">
              {subtitle}
            </span>
          )}
          
          {trendValue && (
            <div
              className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border shrink-0 ${
                trend === 'up'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}
            >
              {trend === 'up' ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
              <span>{trendValue}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
