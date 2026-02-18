'use client';

import { useState } from 'react';
import { EnhancedSlide } from '@/types/enhanced';
import { ExportOptions } from '@/types/enhanced';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
    Presentation,
  FileText,
  Image,
  Monitor,
  Check,
  Download,
  Loader2,
  FileSpreadsheet
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  slides: EnhancedSlide[];
  onExport: (options: ExportOptions) => Promise<void>;
}

const EXPORT_FORMATS = [
  { 
    id: 'pptx', 
    name: 'PowerPoint', 
    description: 'Standard presentation format',
    icon: Presentation,
    color: 'bg-orange-500'
  },
  { 
    id: 'pdf', 
    name: 'PDF', 
    description: 'Universal document format',
    icon: FileText,
    color: 'bg-red-500'
  },
  { 
    id: 'google-slides', 
    name: 'Google Slides', 
    description: 'Export to Google Drive',
    icon: FileSpreadsheet,
    color: 'bg-yellow-500'
  },
  { 
    id: 'keynote', 
    name: 'Keynote', 
    description: 'Apple presentation format',
    icon: Presentation,
    color: 'bg-blue-500'
  },
  { 
    id: 'html', 
    name: 'HTML', 
    description: 'Web presentation',
    icon: Monitor,
    color: 'bg-green-500'
  },
  { 
    id: 'images', 
    name: 'Images', 
    description: 'PNG/JPG slide images',
    icon: Image,
    color: 'bg-purple-500'
  },
];

export function ExportDialog({ isOpen, onClose, slides, onExport }: ExportDialogProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportOptions['format']>('pptx');
  const [options, setOptions] = useState<ExportOptions>({
    format: 'pptx',
    includeSpeakerNotes: true,
    includeAnimations: true,
    quality: 'high',
    compressImages: false
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const handleExport = async () => {
    setIsExporting(true);
    setExportProgress(0);
    
    // Simulate progress
    const interval = setInterval(() => {
      setExportProgress(prev => Math.min(prev + 10, 90));
    }, 200);
    
    try {
      await onExport(options);
      setExportProgress(100);
      setTimeout(() => {
        onClose();
        setIsExporting(false);
        setExportProgress(0);
      }, 500);
    } catch {
      setIsExporting(false);
      setExportProgress(0);
    } finally {
      clearInterval(interval);
    }
  };

  const selectedFormatInfo = EXPORT_FORMATS.find(f => f.id === selectedFormat);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Download className="w-5 h-5 mr-2" />
            Export Presentation
          </DialogTitle>
          <DialogDescription>
            Choose your export format and options
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Format Selection */}
          <div>
            <Label className="text-base font-medium mb-3 block">Export Format</Label>
            <div className="grid grid-cols-2 gap-3">
              {EXPORT_FORMATS.map((format) => (
                <button
                  key={format.id}
                  onClick={() => {
                    setSelectedFormat(format.id as ExportOptions['format']);
                    setOptions(prev => ({ ...prev, format: format.id as ExportOptions['format'] }));
                  }}
                  className={cn(
                    "flex items-center p-4 rounded-lg border-2 transition-all text-left",
                    selectedFormat === format.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  )}
                >
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-white mr-3", format.color)}>
                    <format.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center">
                      <span className="font-medium">{format.name}</span>
                      {selectedFormat === format.id && (
                        <Check className="w-4 h-4 ml-2 text-blue-600" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{format.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Options */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Export Options</Label>
            
            <Card className="p-4 space-y-4">
              {/* Include Speaker Notes */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Include Speaker Notes</Label>
                  <p className="text-sm text-gray-500">Add presenter notes to each slide</p>
                </div>
                <Switch
                  checked={options.includeSpeakerNotes}
                  onCheckedChange={(checked) => 
                    setOptions(prev => ({ ...prev, includeSpeakerNotes: checked }))
                  }
                />
              </div>

              {/* Include Animations */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Include Animations</Label>
                  <p className="text-sm text-gray-500">Add slide transitions and animations</p>
                </div>
                <Switch
                  checked={options.includeAnimations}
                  onCheckedChange={(checked) => 
                    setOptions(prev => ({ ...prev, includeAnimations: checked }))
                  }
                />
              </div>

              {/* Compress Images */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Compress Images</Label>
                  <p className="text-sm text-gray-500">Reduce file size (lower quality)</p>
                </div>
                <Switch
                  checked={options.compressImages}
                  onCheckedChange={(checked) => 
                    setOptions(prev => ({ ...prev, compressImages: checked }))
                  }
                />
              </div>

              {/* Quality */}
              <div className="space-y-2">
                <Label>Image Quality</Label>
                <Select
                  value={options.quality}
                  onValueChange={(value: 'standard' | 'high' | 'maximum') => 
                    setOptions(prev => ({ ...prev, quality: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard (Faster)</SelectItem>
                    <SelectItem value="high">High (Recommended)</SelectItem>
                    <SelectItem value="maximum">Maximum (Larger file)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </Card>
          </div>

          {/* Summary */}
          <Card className="p-4 bg-gray-50">
            <h4 className="font-medium mb-2">Export Summary</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Format:</span>
                <span className="font-medium">{selectedFormatInfo?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Slides:</span>
                <span className="font-medium">{slides.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Speaker Notes:</span>
                <span className="font-medium">{options.includeSpeakerNotes ? 'Included' : 'Excluded'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Quality:</span>
                <Badge variant="secondary">{options.quality}</Badge>
              </div>
            </div>
          </Card>

          {/* Export Button */}
          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full h-12 text-lg"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Exporting... {exportProgress}%
              </>
            ) : (
              <>
                <Download className="w-5 h-5 mr-2" />
                Export {slides.length} Slides
              </>
            )}
          </Button>

          {/* Progress Bar */}
          {isExporting && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${exportProgress}%` }}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
