import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { UploadCloud, FileText, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { HealthInsight } from '../types';
import { cn } from '../lib/utils';

interface HealthUploaderProps {
  onInsightAdded: (insight: HealthInsight) => void;
}

export function HealthUploader({ onInsightAdded }: HealthUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processFile = async (file: File) => {
    setIsLoading(true);
    setError(null);

    try {
      // Read file as base64
      const reader = new FileReader();
      
      const fileData = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const response = await fetch('/api/analyze-health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          fileData,
          fileContext: "User wants to track blood work monthly to adjust vitamin schedules."
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze document');
      }

      const data = await response.json();
      
      const newInsight: HealthInsight = {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        fileName: file.name,
        summary: data.summary,
        recommendations: data.recommendations,
        keyMarkers: data.keyMarkers,
        disclaimer: data.disclaimer
      };

      onInsightAdded(newInsight);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during upload.');
    } finally {
      setIsLoading(false);
      setIsDragging(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6 shadow-2xl shadow-indigo-900/10">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-slate-100">Upload Lab Results</h2>
        <span className="text-xs uppercase tracking-widest text-slate-400">PDF, PNG, JPG</span>
      </div>
      
      <p className="text-sm text-slate-400 mb-6 leading-relaxed">
        Upload your latest blood tests or DNA raw data. We'll analyze your biomarkers to see if your current supplement protocol needs adjusting.
      </p>

      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isLoading && fileInputRef.current?.click()}
        className={cn(
          "border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all cursor-pointer relative overflow-hidden",
          isDragging ? "border-indigo-400 bg-indigo-500/10" : "border-white/10 hover:border-white/20 hover:bg-white/5",
          isLoading ? "opacity-50 pointer-events-none" : ""
        )}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="application/pdf,image/png,image/jpeg,text/csv" 
          onChange={handleFileChange}
        />
        
        {isLoading ? (
          <>
            <Loader2 size={40} className="text-indigo-400 animate-spin mb-4" />
            <p className="font-semibold text-slate-200">Analyzing Document...</p>
            <p className="text-xs text-slate-400 mt-2 text-center">Our AI is reviewing your biomarkers and cross-referencing with your schedule.</p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 text-indigo-400 shadow-inner">
              <UploadCloud size={32} />
            </div>
            <p className="font-semibold text-slate-200">Click to upload or drag and drop</p>
            <p className="text-xs text-slate-500 mt-2 text-center">Secure, private, and analyzed instantly.</p>
          </>
        )}
      </div>

      {error && (
        <div className="mt-4 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-3">
          <AlertCircle size={18} className="text-rose-400 mt-0.5 shrink-0" />
          <p className="text-sm text-rose-200">{error}</p>
        </div>
      )}
    </div>
  );
}
