'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getModelById } from '@/lib/models-data';
import Sidebar from '@/components/Sidebar';
import ExplanationCard from '@/components/ExplanationCard';
import CodeBlock from '@/components/CodeBlock';
import ScreenshotUploader from '@/components/ScreenshotUploader';
import VivaSection from '@/components/VivaSection';

interface Shot { step_id:number; step_name:string; file_name:string; pinata_url:string; uploaded_at:string; }
export default function GuidePage() {
 const params=useParams();
 const model=getModelById(params.modelId as string);
 return model?<Guide key={model.modelId} model={model}/>:<main className="p-10"><h1 className="text-2xl">Model not found</h1><Link href="/" className="mt-4 block text-blue-300">Back to guides</Link></main>;
}
function Guide({model}:{model:NonNullable<ReturnType<typeof getModelById>>}) {
 const [currentStep,setCurrentStep]=useState(0);
 const [screenshots,setScreenshots]=useState<Shot[]>([]);
 useEffect(()=>{
   let active=true;
   fetch(`/api/screenshots?member_id=${encodeURIComponent(model.memberId)}`).then(r=>r.ok?r.json():[]).then(data=>{if(active&&Array.isArray(data))setScreenshots(data.filter((s:Shot)=>s.step_name?.startsWith('v3_')));}).catch(()=>{});
   return ()=>{active=false;};
 },[model.memberId]);
 const total=model.steps.length;
 const step=model.steps[currentStep];
 const navigate=(i:number)=>{setCurrentStep(Math.max(0,Math.min(total,i)));window.scrollTo({top:0,behavior:'smooth'});};
 const complete=(shot:Shot)=>setScreenshots(prev=>[...prev.filter(s=>s.step_id!==shot.step_id),shot]);
 return <div>
  <Sidebar currentStep={currentStep} stepTitles={model.steps.map(s=>s.title)} modelName={model.modelName} memberName={model.memberName} onStepClick={navigate} completedSteps={screenshots.map(s=>s.step_id)}/>
  <main className="min-w-0 px-5 py-8 sm:px-8 lg:ml-72 lg:px-12 lg:py-12"><div className="mx-auto max-w-4xl">
   <header className="mb-8 border-b border-slate-800 pb-7"><p className="text-sm text-blue-300">{model.studentId} · {model.algorithmType}</p><h1 className="mt-2 text-3xl font-bold">{model.modelName}</h1><p className="mt-3 text-slate-400">{model.modelDescription}</p><div className="mt-5 flex flex-wrap gap-3"><a download href={`/downloads/${model.modelId}.ipynb`} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-500">Download your Colab notebook ↓</a><a download href="/downloads/colab-starter-files.zip" className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800">Download the five CSV files ↓</a></div></header>
   {step?<>
    <p className="mb-2 text-sm text-slate-500">STEP {step.stepNumber} OF {total} · Run cells in order</p>
    <h2 className="mb-6 text-2xl font-semibold">{step.title}</h2>
    <ExplanationCard {...step}/>
    <CodeBlock code={step.code} title={`Colab cell ${step.stepNumber}`} stepNumber={step.stepNumber}/>
    <details className="my-6 rounded-xl border border-slate-800 p-4"><summary className="cursor-pointer text-sm text-slate-300">Upload your screenshot for this step</summary><ScreenshotUploader key={step.stepNumber} memberId={model.memberId} modelId={model.modelId} stepNumber={step.stepNumber} stepName={`v3_${step.stepNumber}`} existingScreenshots={screenshots.filter(s=>s.step_id===step.stepNumber)} onUploaded={complete}/></details>
   </>:<><h2 className="text-2xl font-semibold">Viva preparation</h2><p className="mt-3 text-slate-400">Use your actual results and chosen settings when answering. Be ready to run and explain your own cells.</p><VivaSection questions={model.vivaQuestions}/></>}
   <nav aria-label="Previous and next step" className="mt-8 flex justify-between gap-4 border-t border-slate-800 pt-6"><button onClick={()=>navigate(currentStep-1)} disabled={currentStep===0} className="rounded-lg bg-slate-800 px-5 py-3 text-sm disabled:opacity-30">← Previous</button>{currentStep<total?<button onClick={()=>navigate(currentStep+1)} className="rounded-lg bg-blue-600 px-5 py-3 text-sm hover:bg-blue-500">{currentStep===total-1?'Viva preparation':'Next step'} →</button>:<Link href="/compare" className="rounded-lg bg-blue-600 px-5 py-3 text-sm">Compare group results →</Link>}</nav>
  </div></main>
 </div>;
}
