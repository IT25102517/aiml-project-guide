'use client';

import React from 'react';
import Link from 'next/link';

interface SidebarProps {
  currentStep: number;
  totalSteps: number;
  modelName: string;
  memberName: string;
  onStepClick: (step: number) => void;
  completedSteps: number[];
}

export default function Sidebar({
  currentStep,
  totalSteps,
  modelName,
  memberName,
  onStepClick,
  completedSteps,
}: SidebarProps) {
  
  const stepLabels = [
    'Setup & Data Loading',
    'Base Model Training',
    'Hyperparameter Tuning',
    'Final Evaluation',
    'Viva Prep'
  ];

  return (
    <div className="w-72 h-screen bg-slate-900 border-r border-slate-700 flex flex-col fixed left-0 top-0 text-slate-200">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-bold text-blue-500 mb-2">AIML Model Guide</h1>
        <div className="text-sm font-medium text-slate-300">{memberName}</div>
        <div className="text-xs text-slate-500 mt-1 uppercase tracking-wider">{modelName}</div>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
        {stepLabels.map((label, idx) => {
          const stepNum = idx + 1;
          const isActive = currentStep === stepNum;
          const isCompleted = completedSteps.includes(stepNum);
          
          return (
            <button
              key={stepNum}
              onClick={() => onStepClick(stepNum)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm transition-colors text-left ${
                isActive 
                  ? 'bg-blue-600 text-white font-medium shadow-md' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-500'
                }`}>
                  {stepNum}
                </span>
                <span>{label}</span>
              </div>
              {isCompleted && !isActive && <span className="text-emerald-500 text-sm">✔</span>}
              {isCompleted && isActive && <span className="text-white text-sm">✔</span>}
            </button>
          );
        })}
      </div>

      <div className="p-4 border-t border-slate-800 space-y-2">
        <Link href="/admin" className="block w-full text-center px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-sm transition-colors">
          Admin Dashboard
        </Link>
        <Link href="/" className="block w-full text-center px-4 py-2 border border-slate-700 hover:bg-slate-800 text-slate-400 rounded text-sm transition-colors">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
