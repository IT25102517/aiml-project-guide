'use client';

import React, { useState } from 'react';

interface VivaSectionProps {
  questions: { question: string; answer: string }[];
}

export default function VivaSection({ questions }: VivaSectionProps) {
  const [openIndex, setOpenIndex] = useState<number>(0);

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl overflow-hidden mt-8">
      <div className="bg-emerald-900/40 px-4 py-3 border-b border-emerald-500/30">
        <h3 className="text-lg font-bold text-emerald-400 flex items-center">
          <span className="mr-2 text-xl">🗣️</span> Viva Preparation Q&A
        </h3>
      </div>
      
      <div className="divide-y divide-emerald-500/20">
        {questions.map((q, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div key={idx} className="p-4">
              <button
                onClick={() => toggleQuestion(idx)}
                className="w-full flex justify-between items-center text-left focus:outline-none"
              >
                <span className="font-semibold text-slate-100 pr-4">{q.question}</span>
                <span className="text-emerald-400 text-sm shrink-0">
                  {isOpen ? '▼' : '▶'}
                </span>
              </button>
              
              {isOpen && (
                <div className="mt-3 text-slate-300 text-sm leading-relaxed bg-emerald-900/20 p-3 rounded-lg">
                  {q.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
