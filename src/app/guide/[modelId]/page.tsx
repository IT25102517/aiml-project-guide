'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { models, getModelById, members } from '@/lib/models-data';
import type { ModelData, Step } from '@/lib/models-data';
import Sidebar from '@/components/Sidebar';
import ExplanationCard from '@/components/ExplanationCard';
import CodeBlock from '@/components/CodeBlock';
import ScreenshotUploader from '@/components/ScreenshotUploader';
import VivaSection from '@/components/VivaSection';

interface ScreenshotRecord {
  step_id: number;
  file_name: string;
  pinata_url: string;
  uploaded_at: string;
}

function GuideContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const modelId = params.modelId as string;
  const memberId = searchParams.get('member') || '';

  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [screenshots, setScreenshots] = useState<ScreenshotRecord[]>([]);

  const model = getModelById(modelId);
  const member = members.find(m => m.memberId === memberId);

  useEffect(() => {
    if (!memberId) return;

    fetch(`/api/screenshots?member_id=${memberId}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setScreenshots(data);
          const completed = data.map((d: ScreenshotRecord) => d.step_id);
          setCompletedSteps(completed);
        }
      })
      .catch(console.error);
  }, [memberId]);

  if (!model) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-400 mb-4">Model Not Found</h1>
          <p className="text-slate-400 mb-6">The model &quot;{modelId}&quot; does not exist.</p>
          <a href="/" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition">
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  const totalSteps = model.steps.length; // 4 code steps
  const isVivaStep = currentStep === totalSteps; // step index 4 = viva
  const currentStepData: Step | null = !isVivaStep ? model.steps[currentStep] : null;

  const handleStepComplete = (stepNumber: number) => {
    setCompletedSteps(prev => [...new Set([...prev, stepNumber])]);
  };

  const existingForStep = (stepNum: number) =>
    screenshots.filter(s => s.step_id === stepNum).map(s => ({
      file_name: s.file_name,
      pinata_url: s.pinata_url,
      uploaded_at: s.uploaded_at,
    }));

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar
        currentStep={currentStep}
        totalSteps={totalSteps}
        modelName={model.modelName}
        memberName={member?.memberName || memberId}
        onStepClick={setCurrentStep}
        completedSteps={completedSteps}
      />

      <main className="ml-72 flex-1 overflow-y-auto p-8 lg:p-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Model Header */}
          <div className="mb-8">
            <span className="inline-block px-3 py-1 bg-blue-600/20 text-blue-400 text-sm font-medium rounded-full mb-3">
              {model.algorithmType}
            </span>
            <h1 className="text-3xl font-bold text-white mb-2">{model.modelName}</h1>
            <p className="text-slate-400 text-lg">{model.modelDescription}</p>
          </div>

          {!isVivaStep && currentStepData ? (
            <>
              {/* Step Title */}
              <h2 className="text-2xl font-bold text-white border-b border-slate-700 pb-4">
                Step {currentStepData.stepNumber}: {currentStepData.title}
              </h2>

              {/* Explanation Card */}
              <ExplanationCard
                approach={currentStepData.approach}
                whatToLookFor={currentStepData.whatToLookFor}
                technicalNotes={currentStepData.technicalNotes}
                commonMistakes={currentStepData.commonMistakes}
                screenshotInstructions={currentStepData.screenshotInstructions}
              />

              {/* Code Block */}
              <CodeBlock
                code={currentStepData.code}
                title={currentStepData.title}
                stepNumber={currentStepData.stepNumber}
              />

              {/* Screenshot Upload */}
              <ScreenshotUploader
                memberId={memberId}
                modelId={modelId}
                stepNumber={currentStepData.stepNumber}
                stepName={currentStepData.title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}
                existingScreenshots={existingForStep(currentStepData.stepNumber)}
              />

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6 border-t border-slate-800">
                <button
                  onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                  disabled={currentStep === 0}
                  className="px-6 py-3 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  &larr; Previous Step
                </button>
                <button
                  onClick={() => setCurrentStep(prev => Math.min(totalSteps, prev + 1))}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition"
                >
                  {currentStep === totalSteps - 1 ? 'Viva Prep →' : 'Next Step →'}
                </button>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-white border-b border-slate-700 pb-4">
                Viva Preparation
              </h2>
              <VivaSection questions={model.vivaQuestions} />
              <div className="pt-6 border-t border-slate-800">
                <button
                  onClick={() => setCurrentStep(totalSteps - 1)}
                  className="px-6 py-3 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition"
                >
                  &larr; Back to Step 4
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default function GuidePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen bg-slate-950">
        <div className="text-slate-400 text-lg">Loading guide...</div>
      </div>
    }>
      <GuideContent />
    </Suspense>
  );
}
