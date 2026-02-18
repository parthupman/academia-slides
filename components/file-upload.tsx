'use client';

import { useCallback, useState } from 'react';
import { Upload, FileText, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onClear: () => void;
  isUploading: boolean;
  uploadProgress: number;
  fileName?: string;
}

export function FileUpload({
  onFileSelect,
  onClear,
  isUploading,
  uploadProgress,
  fileName
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): boolean => {
    setError(null);
    
    if (!file.type.includes('pdf') && !file.name.endsWith('.pdf')) {
      setError('Please upload a PDF file');
      return false;
    }
    
    if (file.size > 20 * 1024 * 1024) {
      setError('File size must be less than 20MB');
      return false;
    }
    
    return true;
  };

  const handleFileChange = useCallback((file: File | null) => {
    if (!file) return;
    
    if (validateFile(file)) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const file = e.dataTransfer.files[0];
    handleFileChange(file);
  }, [handleFileChange]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const hasFile = !!fileName;

  return (
    <Card className={cn(
      "p-8 border-2 border-dashed transition-all duration-300",
      isDragOver ? "border-blue-500 bg-blue-50" : "border-gray-300",
      hasFile && "border-solid border-green-500 bg-green-50"
    )}>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className="flex flex-col items-center justify-center space-y-4"
      >
        {!hasFile ? (
          <>
            <div className={cn(
              "w-20 h-20 rounded-full flex items-center justify-center transition-colors",
              isDragOver ? "bg-blue-100" : "bg-gray-100"
            )}>
              {isUploading ? (
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
              ) : (
                <Upload className={cn(
                  "w-10 h-10 transition-colors",
                  isDragOver ? "text-blue-500" : "text-gray-400"
                )} />
              )}
            </div>
            
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {isUploading ? 'Uploading...' : 'Upload your research paper'}
              </h3>
              <p className="text-sm text-gray-500">
                Drag and drop your PDF here, or click to browse
              </p>
              <p className="text-xs text-gray-400">
                Maximum file size: 20MB
              </p>
            </div>
            
            {isUploading && (
              <div className="w-full max-w-xs space-y-2">
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-xs text-center text-gray-500">
                  {uploadProgress}%
                </p>
              </div>
            )}
            
            {error && (
              <p className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded">
                {error}
              </p>
            )}
            
            {!isUploading && (
              <Button
                variant="outline"
                onClick={() => document.getElementById('file-input')?.click()}
                className="mt-4"
              >
                Choose File
              </Button>
            )}
            
            <input
              id="file-input"
              type="file"
              accept=".pdf,application/pdf"
              onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
              className="hidden"
            />
          </>
        ) : (
          <div className="w-full space-y-4">
            <div className="flex items-center justify-between bg-white p-4 rounded-lg border">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 truncate max-w-[200px] sm:max-w-xs">
                    {fileName}
                  </p>
                  <p className="text-sm text-green-600 flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                    Ready for analysis
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClear}
                className="text-gray-400 hover:text-red-500"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
