'use client';
import Link from 'next/link';
interface Props { currentStep: number; stepTitles: string[]; modelName: string; memberName: string; onStepClick: (step:number)=>void; completedSteps:number[]; }
export default function Sidebar({currentStep,stepTitles,modelName,memberName,onStepClick,completedSteps}:Props) {
 return <aside className="border-b border-slate-800 bg-slate-900 p-5 lg:fixed lg:inset-y-0 lg:left-0 lg:w-72 lg:overflow-y-auto lg:border-r lg:p-6">
   <Link href="/" className="text-sm font-semibold text-blue-300">← All member guides</Link>
   <h2 className="mt-5 text-lg font-semibold">{modelName}</h2><p className="mt-1 text-sm text-slate-400">{memberName}</p>
   <nav aria-label="Guide steps" className="mt-6 flex gap-2 overflow-x-auto pb-2 lg:flex-col">{[...stepTitles,'Viva preparation'].map((title,i)=><button key={title} onClick={()=>onStepClick(i)} aria-current={currentStep===i?'step':undefined} className={`flex min-w-48 items-center gap-3 rounded-lg px-3 py-3 text-left text-sm lg:min-w-0 ${currentStep===i?'bg-blue-600 text-white':'text-slate-400 hover:bg-slate-800 hover:text-white'}`}><span className="font-mono text-xs">{i<stepTitles.length?String(i+1).padStart(2,'0'):'Q&A'}</span><span className="flex-1">{title}</span>{i<stepTitles.length&&completedSteps.includes(i+1)&&<span aria-label="Screenshot uploaded">✓</span>}</button>)}</nav>
   <Link href="/compare" className="mt-5 block text-sm text-blue-300 hover:underline">Group comparison →</Link>
   <Link href="/admin" className="mt-3 block text-sm text-slate-400 hover:underline">Screenshot dashboard →</Link>
 </aside>;
}
