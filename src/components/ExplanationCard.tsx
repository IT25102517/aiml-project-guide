'use client';

import React, { useState } from 'react';

interface ExplanationCardProps {
  approach: string;
  whatToLookFor: string[];
  technicalNotes: string;
  commonMistakes: string[];
  screenshotInstructions: string;
}

export default function ExplanationCard({
  approach,
  whatToLookFor,
  technicalNotes,
  commonMistakes,
  screenshotInstructions,
}: ExplanationCardProps) {
  const [openSection, setOpenSection] = useState({
    approach: true,
    lookFor: true,
    technical: false,
    mistakes: false,
  });

  const toggleSection = (section: keyof typeof openSection) => {
    setOpenSection((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden flex flex-col space-y-2 p-4">
      {/* Approach */}
      <div>
        <button
          onClick={() => toggleSection('approach')}
          className="flex w-full items-center justify-between py-2 text-left text-slate-200 font-semibold focus:outline-none"
        >
          <span>🎯 Approach & Purpose</span>
          <span className="text-slate-400 text-sm">
            {openSection.approach ? '▼' : '▶'}
          </span>
        </button>
        {openSection.approach && (
          <div className="pb-3 text-slate-400 text-sm pl-2">
            {approach}
          </div>
        )}
      </div>

      {/* What to Look For */}
      <div>
        <button
          onClick={() => toggleSection('lookFor')}
          className="flex w-full items-center justify-between py-2 text-left text-slate-200 font-semibold focus:outline-none border-t border-slate-700/50"
        >
          <span>👀 What to Look For in Output</span>
          <span className="text-slate-400 text-sm">
            {openSection.lookFor ? '▼' : '▶'}
          </span>
        </button>
        {openSection.lookFor && (
          <ul className="pb-3 list-disc list-inside text-slate-400 text-sm pl-2">
            {whatToLookFor.map((item, idx) => (
              <li key={idx} className="mb-1">{item}</li>
            ))}
          </ul>
        )}
      </div>

      {/* Technical Notes */}
      <div>
        <button
          onClick={() => toggleSection('technical')}
          className="flex w-full items-center justify-between py-2 text-left text-slate-200 font-semibold focus:outline-none border-t border-slate-700/50"
        >
          <span>🔬 Technical Deep Dive</span>
          <span className="text-slate-400 text-sm">
            {openSection.technical ? '▼' : '▶'}
          </span>
        </button>
        {openSection.technical && (
          <div className="pb-3 text-slate-400 text-sm pl-2">
            {technicalNotes}
          </div>
        )}
      </div>

      {/* Common Mistakes */}
      <div>
        <button
          onClick={() => toggleSection('mistakes')}
          className="flex w-full items-center justify-between py-2 text-left text-slate-200 font-semibold focus:outline-none border-t border-slate-700/50"
        >
          <span>⚠️ Common Mistakes to Avoid</span>
          <span className="text-slate-400 text-sm">
            {openSection.mistakes ? '▼' : '▶'}
          </span>
        </button>
        {openSection.mistakes && (
          <ul className="pb-3 list-disc list-inside text-slate-400 text-sm pl-2">
            {commonMistakes.map((item, idx) => (
              <li key={idx} className="mb-1">{item}</li>
            ))}
          </ul>
        )}
      </div>

      {/* Screenshot Instructions */}
      <div className="mt-4 bg-blue-900/30 border border-blue-800/50 rounded-lg p-3 flex items-start space-x-3">
        <span className="text-xl">📸</span>
        <p className="text-sm text-blue-200 font-medium">{screenshotInstructions}</p>
      </div>
    </div>
  );
}
