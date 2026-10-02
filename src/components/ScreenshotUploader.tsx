'use client';

import React, { useState, useRef } from 'react';

interface Screenshot {
  file_name: string;
  pinata_url: string;
  uploaded_at: string;
}

interface ScreenshotUploaderProps {
  memberId: string;
  modelId: string;
  stepNumber: number;
  stepName: string;
  existingScreenshots?: Screenshot[];
}

export default function ScreenshotUploader({
  memberId,
  modelId,
  stepNumber,
  stepName,
  existingScreenshots = [],
}: ScreenshotUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type.startsWith('image/')) {
        setFile(droppedFile);
        setPreview(URL.createObjectURL(droppedFile));
        setUploadStatus('idle');
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type.startsWith('image/')) {
        setFile(selectedFile);
        setPreview(URL.createObjectURL(selectedFile));
        setUploadStatus('idle');
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadStatus('idle');
    setErrorMessage('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('member_id', memberId);
      formData.append('model_id', modelId);
      formData.append('step_number', stepNumber.toString());
      formData.append('step_name', stepName);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      setUploadStatus('success');
      setFile(null);
    } catch (err) {
      console.error(err);
      setUploadStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsUploading(false);
    }
  };

  const generatedFileName = `${modelId}_step${stepNumber}_${stepName}.png`.replace(/\s+/g, '_').toLowerCase();

  return (
    <div className="my-6">
      <div 
        className="border-dashed border-2 border-slate-600 rounded-xl p-6 text-center cursor-pointer hover:bg-slate-800/30 transition-colors"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileSelect} 
          accept="image/*" 
          className="hidden" 
        />
        
        {!preview && !file && (
          <div className="flex flex-col items-center justify-center space-y-2">
            <span className="text-3xl">📤</span>
            <p className="text-slate-300 font-medium">Click to upload or drag & drop</p>
            <p className="text-slate-500 text-sm">PNG, JPG up to 10MB</p>
          </div>
        )}

        {preview && (
          <div className="flex flex-col items-center space-y-4" onClick={(e) => e.stopPropagation()}>
            <img src={preview} alt="Preview" className="max-h-48 rounded shadow-lg border border-slate-700" />
            <p className="text-sm text-slate-300 break-all">{file?.name}</p>
            <p className="text-xs text-slate-500">Will be saved as: <span className="font-mono text-blue-400">{generatedFileName}</span></p>
            
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {isUploading ? 'Uploading...' : 'Upload Screenshot'}
            </button>
          </div>
        )}
        
        {uploadStatus === 'success' && !file && (
          <div className="mt-4 flex flex-col items-center text-emerald-500 space-y-2">
            <span className="text-4xl">✅</span>
            <p className="font-semibold">Upload successful!</p>
          </div>
        )}

        {uploadStatus === 'error' && (
          <div className="mt-4 text-red-400 text-sm font-medium">
            Error: {errorMessage}
          </div>
        )}
      </div>

      {existingScreenshots.length > 0 && (
        <div className="mt-6">
          <h4 className="text-slate-300 font-semibold mb-3">Previously Uploaded:</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {existingScreenshots.map((shot, idx) => (
              <div key={idx} className="bg-slate-800 rounded-lg p-2 border border-slate-700">
                <img 
                  src={shot.pinata_url} 
                  alt={shot.file_name} 
                  className="w-full h-auto aspect-video object-cover rounded mb-2 border border-slate-600"
                />
                <p className="text-xs text-slate-400 truncate" title={shot.file_name}>{shot.file_name}</p>
                <p className="text-[10px] text-slate-500">{new Date(shot.uploaded_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
