'use client';
import Link from 'next/link';
import { useState } from 'react';
import { models } from '@/lib/models-data';
import { readResult, toCSV, type Result } from '@/lib/results';
import MetricsGuide from '@/components/MetricsGuide';

export default function ComparePage() {
  const [results, setResults] = useState<Result[]>([]);
  const [messages, setMessages] = useState<string[]>([]);
  const [ranking, setRanking] = useState('Validation_RMSE');
  const sorted = [...results].sort((a,b) => +a[ranking] - +b[ranking] || +a.Validation_MAE - +b.Validation_MAE);
  async function load(files: FileList | null) {
    if (!files) return;
    const incoming: Result[] = [], notes: string[] = [];
    for (const file of Array.from(files)) {
      try { if (file.size > 100000) throw new Error('Result CSV should be smaller than 100 KB.'); incoming.push(readResult(await file.text())); notes.push(`${file.name}: loaded. A repeated model replaces its previous result.`); }
      catch (error) { notes.push(`${file.name}: ${error instanceof Error ? error.message : 'Could not read file.'}`); }
    }
    setResults(previous => { const map = new Map(previous.map(r => [r.Model_ID, r])); incoming.forEach(r => map.set(r.Model_ID, r)); return [...map.values()]; });
    setMessages(notes);
  }
  function download() {
    const url = URL.createObjectURL(new Blob([toCSV(sorted)], {type:'text/csv;charset=utf-8'}));
    const a = document.createElement('a'); a.href=url; a.download='group_model_comparison.csv'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return <main className="min-h-screen bg-slate-950 text-slate-100 px-5 py-10"><div className="max-w-7xl mx-auto space-y-8">
    <Link href="/" className="text-cyan-300">← All member guides</Link>
    <header><p className="text-cyan-300 text-sm uppercase tracking-widest mb-3">Bring your six results together</p><h1 className="text-4xl font-bold mb-4">Group model comparison</h1><p className="text-slate-300 max-w-3xl">Each member uploads their final *_result.csv from Step 6. Compare like-for-like scores. Files are read locally in your browser; reload the page to clear them.</p></header>
    <MetricsGuide />
    <section className="rounded-2xl border border-slate-700 bg-slate-900 p-6 space-y-4">
      <h2 className="text-xl font-semibold">1. Add the member result files</h2>
      <label className="block">Choose one or more result CSVs<input aria-label="Result CSV files" className="block mt-3 w-full file:mr-4 file:rounded-lg file:border-0 file:bg-cyan-300 file:px-4 file:py-2 file:text-slate-950" type="file" accept=".csv,text/csv" multiple onChange={e => { void load(e.target.files); e.target.value=''; }} /></label>
      <p className="text-sm text-slate-400">{results.length} / 6 models loaded. Checks include member ID, protocol, 4,777 training rows, 1,194 holdout rows and 12 features. These checks cannot verify how a notebook was run; keep the notebook and four-variant comparison table as evidence.</p>
      {messages.length > 0 && <ul aria-live="polite" className="text-sm text-amber-200 space-y-1">{messages.map((m,i)=><li key={i}>{m}</li>)}</ul>}
      <div className="flex flex-wrap gap-2">{models.map(m=><span key={m.modelId} className={`rounded-full px-3 py-1 text-xs ${results.some(r=>r.Model_ID===m.modelId)?'bg-emerald-950 text-emerald-200':'bg-slate-800 text-slate-400'}`}>{m.modelName}</span>)}</div>
    </section>
    <section className="space-y-4"><h2 className="text-xl font-semibold">2. Compare and explain the outcome</h2>
      <div className="flex flex-wrap gap-4 items-center"><label>Rank by <select className="ml-2 bg-slate-800 border border-slate-600 rounded-lg p-2" value={ranking} onChange={e=>setRanking(e.target.value)}><option value="Validation_RMSE">Validation RMSE — recommended selection</option><option value="Holdout_RMSE">Holdout RMSE — observed comparison</option></select></label><button disabled={!results.length} onClick={download} className="rounded-lg bg-cyan-300 text-slate-950 px-4 py-2 disabled:opacity-40">Download comparison CSV</button><button onClick={()=>{setResults([]);setMessages([]);}} className="text-slate-400">Clear results</button></div>
      <p className="text-slate-300">Use the lowest Validation RMSE to select the group model, then discuss its holdout performance and MAE. If you choose by holdout RMSE instead, call it the best on this holdout; that holdout has then helped select the model.</p>
      {sorted.length === 6 && <p className="p-4 rounded-xl bg-cyan-950 text-cyan-100">{ranking==='Validation_RMSE'?'Lowest Validation RMSE':'Lowest observed holdout RMSE'}: <strong>{sorted[0].Model}</strong> ({(+sorted[0][ranking]).toFixed(3)} lakhs). Check close scores, the single-split limitation, overfitting and model limitations before writing your conclusion.</p>}
      <div className="overflow-x-auto rounded-xl border border-slate-700"><table className="w-full text-sm text-left whitespace-nowrap"><thead className="bg-slate-800"><tr>{['Model','Validation RMSE','Validation MAE','Validation R²','Train RMSE','Holdout RMSE','Holdout MAE','Holdout R²'].map(h=><th key={h} className="p-4">{h}</th>)}</tr></thead><tbody>{sorted.map(r=><tr key={r.Model_ID} className="border-t border-slate-800"><td className="p-4 font-medium">{r.Model}</td><td className="p-4">{(+r.Validation_RMSE).toFixed(3)}</td>{['Validation_MAE','Validation_R2','Train_RMSE','Holdout_RMSE','Holdout_MAE','Holdout_R2'].map(k=><td className="p-4" key={k}>{(+r[k]).toFixed(3)}</td>)}</tr>)}{!sorted.length&&<tr><td colSpan={8} className="p-10 text-center text-slate-400">Your actual results will appear here.</td></tr>}</tbody></table></div>
      <p className="text-xs text-slate-400">RMSE and MAE: INR lakhs. R²: unitless, can be negative. Scores cover the retained kilometre range. The unlabelled university test file cannot provide evaluation scores.</p>
      {sorted.map(r=><details key={r.Model_ID} className="rounded-xl border border-slate-800 p-4"><summary className="cursor-pointer">{r.Model}: chosen settings</summary><p className="mt-3 text-sm text-slate-300 break-words">Student: {r.Student_ID} · Selected variant: {r.Variant} · Four variants compared</p></details>)}
    </section>
  </div></main>;
}
