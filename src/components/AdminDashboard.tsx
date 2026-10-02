'use client';

import React, { useState, useEffect } from 'react';
import JSZip from 'jszip';

interface Screenshot {
  id: string;
  member_id: string;
  model_name: string;
  step_id: number;
  step_name: string;
  file_name: string;
  pinata_url: string;
  uploaded_at: string;
}

interface AdminDashboardProps {
  adminPassword?: string;
}

const members = [
  { memberId: 'amarasekara', memberName: 'Amarasekara I.S.Y.', studentId: 'IT25101702', modelName: 'Ridge Regression' },
  { memberId: 'indusara', memberName: 'Indusara L.G.S.', studentId: 'IT25102517', modelName: 'Gradient Boosting' },
  { memberId: 'gunathilake', memberName: 'Gunathilake P.G.K.I.', studentId: 'IT25103600', modelName: 'Random Forest' },
  { memberId: 'wijerathna', memberName: 'Wijerathna K.G.C.J.', studentId: 'IT25101522', modelName: 'Decision Tree' },
  { memberId: 'bandara', memberName: 'Bandara U.S.B.N.', studentId: 'IT25103405', modelName: 'SVR' },
  { memberId: 'wijesinghe', memberName: 'Wijesinghe W.A.D.M.C.L.', studentId: 'IT25100607', modelName: 'KNN' },
];

export default function AdminDashboard({ adminPassword = 'admin' }: AdminDashboardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  const [loading, setLoading] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === adminPassword) {
      setIsAuthenticated(true);
    } else {
      alert('Incorrect password');
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchScreenshots();
    }
  }, [isAuthenticated]);

  const fetchScreenshots = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/screenshots');
      if (res.ok) {
        const data = await res.json();
        setScreenshots(data);
      }
    } catch (err) {
      console.error('Failed to fetch screenshots', err);
    } finally {
      setLoading(false);
    }
  };

  const getScreenshotForCell = (memberId: string, stepId: number) => {
    return screenshots.find(s => s.member_id === memberId && s.step_id === stepId);
  };

  const totalPossible = members.length * 4; // 4 steps
  const totalCompleted = members.reduce((sum, member) => {
    let completed = 0;
    for(let i=1; i<=4; i++) {
      if(getScreenshotForCell(member.memberId, i)) completed++;
    }
    return sum + completed;
  }, 0);

  const handleDownloadZip = async () => {
    if (screenshots.length === 0) return;
    
    setIsZipping(true);
    try {
      const zip = new JSZip();
      
      const fetchPromises = screenshots.map(async (shot) => {
        try {
          const response = await fetch(shot.pinata_url);
          const blob = await response.blob();
          
          const member = members.find(m => m.memberId === shot.member_id);
          const mName = member ? member.memberName.replace(/\s+/g, '_') : shot.member_id;
          const modelName = shot.model_name.replace(/\s+/g, '_');
          
          const fileName = `${mName}_${modelName}_step${shot.step_id}_${shot.step_name.replace(/\s+/g, '_')}.png`;
          
          zip.file(fileName, blob);
        } catch (err) {
          console.error(`Failed to fetch image for ${shot.file_name}`, err);
        }
      });
      
      await Promise.all(fetchPromises);
      
      const zipContent = await zip.generateAsync({ type: 'blob' });
      
      const url = window.URL.createObjectURL(zipContent);
      const a = document.createElement('a');
      a.href = url;
      a.download = `AIML_Project_Screenshots_${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      
    } catch (err) {
      console.error('Failed to create ZIP', err);
      alert('Error creating ZIP file.');
    } finally {
      setIsZipping(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900 text-slate-200 p-4">
        <form onSubmit={handleLogin} className="bg-slate-800 p-8 rounded-xl border border-slate-700 shadow-xl w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center text-blue-400">Admin Access</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-slate-400">Password</label>
            <input 
              type="password" 
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-4 rounded transition-colors">
            Enter Dashboard
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-blue-400 mb-2">Project Completion Dashboard</h1>
            <p className="text-slate-400 font-medium">
              Overall Progress: <span className="text-emerald-400">{totalCompleted} / {totalPossible} steps completed</span>
            </p>
          </div>
          
          <button 
            onClick={handleDownloadZip}
            disabled={isZipping || screenshots.length === 0}
            className="bg-slate-700 hover:bg-slate-600 border border-slate-600 text-white px-4 py-2 rounded shadow flex items-center space-x-2 transition-colors disabled:opacity-50"
          >
            <span>{isZipping ? 'Creating ZIP...' : '📥 Download All Screenshots as ZIP'}</span>
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-400">Loading data...</div>
        ) : (
          <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-900/50 text-slate-300">
                  <tr>
                    <th className="px-6 py-4 font-semibold border-b border-slate-700">Team Member</th>
                    <th className="px-6 py-4 font-semibold text-center border-b border-slate-700">Step 1</th>
                    <th className="px-6 py-4 font-semibold text-center border-b border-slate-700">Step 2</th>
                    <th className="px-6 py-4 font-semibold text-center border-b border-slate-700">Step 3</th>
                    <th className="px-6 py-4 font-semibold text-center border-b border-slate-700">Step 4</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {members.map((member) => (
                    <tr key={member.memberId} className="hover:bg-slate-700/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-200">{member.memberName}</div>
                        <div className="text-xs text-slate-500 mt-1">{member.studentId} • {member.modelName}</div>
                      </td>
                      {[1, 2, 3, 4].map(stepNum => {
                        const shot = getScreenshotForCell(member.memberId, stepNum);
                        return (
                          <td key={stepNum} className="px-6 py-4 text-center">
                            {shot ? (
                              <a 
                                href={shot.pinata_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30 transition-colors"
                                title="View Screenshot"
                              >
                                ✔
                              </a>
                            ) : (
                              <span className="text-slate-600 font-bold">-</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
