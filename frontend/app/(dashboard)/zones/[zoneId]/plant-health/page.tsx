'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useCallback } from 'react';
import { GhostIcon } from '@/components/ui/Icons';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { useZone } from '@/lib/hooks';
import { uploadPlantImage } from '@/lib/api/plant-health';
import { cn } from '@/lib/utils/cn';
import type { AnalysisResult } from '@/types';

/**
 * Zone-specific plant health image upload page
 * Allows operators to upload plant images for disease detection
 */
export default function PlantHealthPage() {
  const params = useParams();
  const router = useRouter();
  const zoneId = params.zoneId as string;
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch zone details
  const { data: zone, isLoading: zoneLoading, error: zoneError } = useZone(zoneId);

  // File validation constants
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ACCEPTED_FORMATS = ['image/jpeg', 'image/png'];

  // Validate file
  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_FORMATS.includes(file.type)) {
      return 'Only JPEG and PNG images are accepted';
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`;
    }
    return null;
  };

  // Handle file selection
  const handleFileSelect = (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSelectedFile(file);
    setError(null);
    setAnalysisResult(null);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Handle drag events
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, []);

  // Handle upload
  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    // Simulate progress (since we don't have real progress tracking)
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      const result = await uploadPlantImage(selectedFile, zoneId);
      setUploadProgress(100);
      setAnalysisResult(result);
      clearInterval(progressInterval);
    } catch (err) {
      clearInterval(progressInterval);
      setError(err instanceof Error ? err.message : 'Failed to upload image');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Handle reset
  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setAnalysisResult(null);
    setError(null);
    setUploadProgress(0);
  };

  // Show loading state
  if (zoneLoading) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <GhostIcon size="lg" animate />
            <h1 className="text-3xl md:text-4xl font-creepster text-ghost-green text-glow">
              Loading Plant Health...
            </h1>
          </div>
        </div>
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  // Show error state
  if (zoneError || !zone) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <GhostIcon size="lg" animate />
            <h1 className="text-3xl md:text-4xl font-creepster text-ghost-green text-glow">
              Zone Not Found
            </h1>
          </div>
        </div>
        
        <div className="retro-card fog-overlay border-blood-red">
          <div className="text-center py-8">
            <span className="text-6xl mb-4 block">💀</span>
            <p className="font-vt323 text-lg text-blood-red mb-4">
              This zone has vanished into the mist!
            </p>
            <Button onClick={() => router.push('/')}>
              Return to Zone Management
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Page header */}
      <div className="mb-8">
        <button
          onClick={() => router.push(`/zones/${zoneId}`)}
          className="mb-4 text-ghost-green hover:text-slime-green font-vt323 text-lg flex items-center gap-2 transition-colors"
        >
          ← Back to {zone.name} Dashboard
        </button>
        
        <div className="flex items-center gap-3">
          <span className="text-4xl">🌿</span>
          <h1 className="text-3xl md:text-4xl font-creepster text-ghost-green text-glow">
            Plant Health Analysis - {zone.name}
          </h1>
        </div>
      </div>

      {/* Error notification */}
      {error && (
        <div className="mb-6 p-4 bg-bg-dark border-4 border-blood-red rounded-lg pixel-corners animate-flicker">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <p className="font-vt323 text-lg text-blood-red">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <div className="retro-card fog-overlay">
          <div className="relative z-10">
            <h2 className="text-2xl font-creepster text-toxic-purple mb-6 flex items-center gap-2">
              <span>📸</span>
              Upload Plant Image
            </h2>

            {/* Drag and Drop Zone */}
            {!previewUrl && (
              <div
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                  'relative border-4 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer',
                  isDragging 
                    ? 'border-ghost-green bg-ghost-green/10 scale-105' 
                    : 'border-toxic-purple hover:border-ghost-green hover:bg-ghost-green/5'
                )}
                onClick={() => document.getElementById('file-input')?.click()}
              >
                <input
                  id="file-input"
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
                
                <div className="space-y-4">
                  <span className="text-6xl block animate-float">🎃</span>
                  <div>
                    <p className="font-vt323 text-xl text-ghost-green mb-2">
                      {isDragging ? 'Drop your image here!' : 'Drag & drop an image'}
                    </p>
                    <p className="font-vt323 text-sm text-text-secondary">
                      or click to browse
                    </p>
                  </div>
                  <div className="text-xs text-text-secondary font-vt323">
                    <p>Accepted formats: JPEG, PNG</p>
                    <p>Max size: 10MB</p>
                  </div>
                </div>
              </div>
            )}

            {/* Image Preview */}
            {previewUrl && (
              <div className="space-y-4">
                <div className="relative border-4 border-ghost-green rounded-lg overflow-hidden pixel-corners">
                  <img 
                    src={previewUrl} 
                    alt="Plant preview" 
                    className="w-full h-auto"
                  />
                  {/* Retro frame decoration */}
                  <div className="absolute top-2 left-2 text-2xl opacity-70">🕸️</div>
                  <div className="absolute top-2 right-2 text-2xl opacity-70">🕸️</div>
                  <div className="absolute bottom-2 left-2 text-2xl opacity-70">🕸️</div>
                  <div className="absolute bottom-2 right-2 text-2xl opacity-70">🕸️</div>
                </div>

                {selectedFile && (
                  <div className="font-vt323 text-sm text-text-secondary">
                    <p>File: {selectedFile.name}</p>
                    <p>Size: {(selectedFile.size / 1024).toFixed(2)} KB</p>
                  </div>
                )}

                {/* Upload Progress */}
                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-vt323 text-sm text-ghost-green">Analyzing...</span>
                      <span className="font-vt323 text-sm text-ghost-green">{uploadProgress}%</span>
                    </div>
                    <div className="relative h-8 bg-bg-darkest border-4 border-ghost-green rounded pixel-corners overflow-hidden">
                      <div 
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-slime-green to-ghost-green transition-all duration-300 animate-pulse"
                        style={{ width: `${uploadProgress}%` }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="font-vt323 text-sm text-bone-white drop-shadow-lg">
                          👻 Scanning...
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    variant="primary"
                    className="flex-1"
                    onClick={handleUpload}
                    disabled={isUploading || !!analysisResult}
                    loading={isUploading}
                    icon={<span>🔍</span>}
                  >
                    {isUploading ? 'ANALYZING...' : 'ANALYZE'}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleReset}
                    disabled={isUploading}
                  >
                    Reset
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results Section */}
        <div className="retro-card fog-overlay">
          <div className="relative z-10">
            <h2 className="text-2xl font-creepster text-toxic-purple mb-6 flex items-center gap-2">
              <span>🔬</span>
              Analysis Results
            </h2>

            {!analysisResult && !isUploading && (
              <div className="text-center py-12">
                <span className="text-6xl mb-4 block opacity-50">🌱</span>
                <p className="font-vt323 text-lg text-text-secondary">
                  Upload an image to see analysis results
                </p>
              </div>
            )}

            {isUploading && (
              <div className="text-center py-12">
                <LoadingSpinner size="lg" />
                <p className="font-vt323 text-lg text-ghost-green mt-4">
                  Analyzing plant health...
                </p>
              </div>
            )}

            {analysisResult && (
              <div className="space-y-6">
                {/* Health Score */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-vt323 text-lg text-bone-white">Overall Health:</span>
                    <span className={cn(
                      'font-vt323 text-2xl font-bold',
                      analysisResult.healthScore >= 80 ? 'text-ghost-green' :
                      analysisResult.healthScore >= 50 ? 'text-pumpkin-orange' :
                      'text-blood-red'
                    )}>
                      {analysisResult.healthScore}%
                    </span>
                  </div>
                  <div className="relative h-8 bg-bg-darkest border-4 border-toxic-purple rounded pixel-corners overflow-hidden">
                    <div 
                      className={cn(
                        'absolute inset-y-0 left-0 transition-all duration-500',
                        analysisResult.healthScore >= 80 ? 'bg-gradient-to-r from-slime-green to-ghost-green' :
                        analysisResult.healthScore >= 50 ? 'bg-gradient-to-r from-pumpkin-orange to-toxic-purple' :
                        'bg-gradient-to-r from-blood-red to-pumpkin-orange'
                      )}
                      style={{ width: `${analysisResult.healthScore}%` }}
                    />
                  </div>
                </div>

                {/* Detected Diseases */}
                {analysisResult.diseases.length > 0 ? (
                  <div>
                    <h3 className="font-vt323 text-lg text-bone-white mb-3">
                      Detected Issues ({analysisResult.diseases.length}):
                    </h3>
                    <div className="space-y-3">
                      {analysisResult.diseases.map((disease, index) => (
                        <div 
                          key={index}
                          className={cn(
                            'p-4 border-4 rounded-lg pixel-corners',
                            disease.severity === 'high' ? 'border-blood-red bg-blood-red/10' :
                            disease.severity === 'medium' ? 'border-pumpkin-orange bg-pumpkin-orange/10' :
                            'border-ghost-green bg-ghost-green/10'
                          )}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h4 className="font-vt323 text-base font-bold text-bone-white mb-1">
                                {disease.name}
                              </h4>
                              <div className="flex items-center gap-2 mb-2">
                                <span className={cn(
                                  'px-2 py-1 text-xs font-bold border-2 rounded pixel-corners',
                                  disease.severity === 'high' ? 'border-blood-red text-blood-red' :
                                  disease.severity === 'medium' ? 'border-pumpkin-orange text-pumpkin-orange' :
                                  'border-ghost-green text-ghost-green'
                                )}>
                                  {disease.severity.toUpperCase()}
                                </span>
                                <span className="font-vt323 text-sm text-text-secondary">
                                  Confidence: {(disease.confidence * 100).toFixed(0)}%
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Confidence bar */}
                          <div className="relative h-4 bg-bg-darkest border-2 border-current rounded overflow-hidden mb-2">
                            <div 
                              className={cn(
                                'absolute inset-y-0 left-0 transition-all duration-500',
                                disease.severity === 'high' ? 'bg-blood-red' :
                                disease.severity === 'medium' ? 'bg-pumpkin-orange' :
                                'bg-ghost-green'
                              )}
                              style={{ width: `${disease.confidence * 100}%` }}
                            />
                          </div>

                          <p className="font-vt323 text-sm text-bone-white">
                            <span className="text-toxic-purple">Treatment:</span> {disease.treatment}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 border-4 border-ghost-green rounded-lg pixel-corners bg-ghost-green/10">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">✓</span>
                      <p className="font-vt323 text-base text-ghost-green">
                        No diseases detected! Plant appears healthy.
                      </p>
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {analysisResult.recommendations.length > 0 && (
                  <div>
                    <h3 className="font-vt323 text-lg text-bone-white mb-3">
                      Recommendations:
                    </h3>
                    <ul className="space-y-2">
                      {analysisResult.recommendations.map((rec, index) => (
                        <li 
                          key={index}
                          className="flex items-start gap-2 font-vt323 text-sm text-text-secondary"
                        >
                          <span className="text-ghost-green">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Timestamp */}
                <div className="pt-4 border-t-2 border-toxic-purple">
                  <p className="font-vt323 text-xs text-text-secondary">
                    Analysis completed: {new Date(analysisResult.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
