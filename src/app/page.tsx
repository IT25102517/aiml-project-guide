import Link from 'next/link';
import React from 'react';

const members = [
  { memberId: 'amarasekara', name: 'Amarasekara I.S.Y.', studentId: 'IT25101702', modelId: 'ridge', modelName: 'Ridge Regression' },
  { memberId: 'indusara', name: 'Indusara L.G.S.', studentId: 'IT25102517', modelId: 'gradient_boosting', modelName: 'Gradient Boosting' },
  { memberId: 'gunathilake', name: 'Gunathilake P.G.K.I.', studentId: 'IT25103600', modelId: 'random_forest', modelName: 'Random Forest' },
  { memberId: 'wijerathna', name: 'Wijerathna K.G.C.J.', studentId: 'IT25101522', modelId: 'decision_tree', modelName: 'Decision Tree' },
  { memberId: 'bandara', name: 'Bandara U.S.B.N.', studentId: 'IT25103405', modelId: 'svr', modelName: 'SVR (Support Vector)' },
  { memberId: 'wijesinghe', name: 'Wijesinghe W.A.D.M.C.L.', studentId: 'IT25100607', modelId: 'knn', modelName: 'KNN Regressor' },
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">AIML Model Training Guide</h1>
        <p className="text-xl text-slate-400">Used Cars Price Prediction - Progress Review II</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl max-w-2xl w-full">
        <h2 className="text-lg font-semibold text-white mb-4">Google Colab Setup Instructions:</h2>
        <ol className="list-decimal list-inside space-y-2 text-slate-300">
          <li>Open Google Colab (<a href="https://colab.research.google.com" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">colab.research.google.com</a>)</li>
          <li>Create a New Notebook</li>
          <li>Click Files icon on left sidebar</li>
          <li>Upload <code className="bg-slate-800 px-1 py-0.5 rounded text-sm text-pink-400">final_processed_cars.csv</code></li>
          <li>Select your name below to see your model's code</li>
        </ol>
      </div>

      <div className="space-y-6 w-full max-w-5xl">
        <h2 className="text-2xl font-semibold text-center text-slate-200">Select Your Name to Begin</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map((m) => (
            <Link key={m.memberId} href={`/guide/${m.modelId}?member=${m.memberId}`}>
              <div className="group bg-slate-900 border border-slate-800 rounded-xl p-6 hover:bg-slate-800 hover:border-blue-500/50 hover:scale-[1.02] transition-all duration-200 cursor-pointer flex flex-col justify-between h-full relative overflow-hidden">
                <div>
                  <h3 className="font-bold text-lg text-white group-hover:text-blue-400 transition-colors">{m.name}</h3>
                  <p className="text-sm text-slate-500 mb-4">{m.studentId}</p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {m.modelName}
                  </span>
                  <span className="text-slate-600 group-hover:text-blue-400 transition-colors">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="pt-8">
        <Link href="/admin" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
          Admin Dashboard →
        </Link>
      </div>
    </div>
  );
}
