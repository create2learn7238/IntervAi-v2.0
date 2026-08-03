import React, { useState } from 'react';
import { BookOpen, Search, Filter, Bot, ChevronRight } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';

const CATEGORIES = [
  { label: 'Data Structures & Algorithms', questions: ['What is a linked list vs dynamic array?', 'Explain Binary Search Tree balancing', 'How does a Hash Table resolve collisions?'] },
  { label: 'System Design & Scalability', questions: ['How would you design a URL shortener service like TinyURL?', 'Design a real-time chat application architecture', 'How do you handle database sharding and replication?'] },
  { label: 'JavaScript & Web Core', questions: ['What is a closure in JavaScript and when to use it?', 'Explain the event loop and microtask queue', 'What is the exact difference between == and ===?'] },
  { label: 'React.js & State Management', questions: ['What are custom hooks and how do they work?', 'Explain virtual DOM reconciliation algorithm', 'When to use useEffect vs useLayoutEffect?'] },
];

export default function Questions() {
  const [activeCategory, setActiveCategory] = useState(0);
  const [search, setSearch] = useState('');

  const currentQuestions = CATEGORIES[activeCategory].questions.filter((q) =>
    q.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="pb-2 border-b border-[#E2E8F0]">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#EEF2FF] border border-[#6366F1]/20 text-[11px] font-bold text-[#4F46E5] mb-1">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Curated Interview Repository</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
          Categorized Question Bank
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
          Browse technical and system design questions curated from top tech company campus drives.
        </p>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search question bank by keyword..."
          className="w-full h-10 pl-10 pr-4 bg-white border border-[#E2E8F0] rounded-input text-xs font-medium focus:outline-none focus:border-[#4F46E5]"
        />
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat, i) => (
          <button
            key={i}
            onClick={() => setActiveCategory(i)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeCategory === i
                ? 'bg-gradient-primary text-white shadow-saas-glow'
                : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Questions Cards List */}
      <div className="space-y-3">
        {currentQuestions.map((q, i) => (
          <div key={i} className="saas-card saas-card-hover p-4 sm:p-5 bg-white flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center font-bold text-xs flex-shrink-0">
                Q{i + 1}
              </div>
              <p className="text-xs sm:text-sm font-bold text-[#0F172A]">{q}</p>
            </div>
            <button className="px-3 py-1.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-[11px] font-semibold text-[#4F46E5] hover:bg-[#EEF2FF] transition-colors flex-shrink-0">
              Practice Answer
            </button>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
