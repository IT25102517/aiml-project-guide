'use client';

import React, { useState } from 'react';

interface CodeBlockProps {
  code: string;
  title: string;
  stepNumber: number;
}

export default function CodeBlock({ code, title, stepNumber }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setCopyError(false);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code', err);
      setCopyError(true);
    }
  };

  return (
    <div className="rounded-xl overflow-hidden border border-slate-700 bg-black my-6">
      <div className="bg-slate-800 px-4 py-3 flex items-center justify-between border-b border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">
            {stepNumber}
          </div>
          <span className="text-sm font-semibold text-slate-200">{title}</span>
        </div>
        <button
          onClick={handleCopy}
          className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
            copied
              ? 'bg-emerald-500 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          {copyError ? 'Select and copy below' : copied ? 'Copied!' : 'Copy cell'}
        </button>
      </div>
      <div className="max-h-[36rem] overflow-auto p-4">
        <pre className="font-mono text-sm text-slate-300">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}
