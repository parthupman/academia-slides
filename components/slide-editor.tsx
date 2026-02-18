'use client';

import { useState, useRef, useEffect } from 'react';
import { EnhancedSlide, AIChatMessage } from '@/types/enhanced';
import { PaperMetadata } from '@/types/enhanced';
import { UserSettings } from '@/types/settings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Copy,
  MessageSquare,
  Send,
  Bot,
  User,
  Save,
  Type,
  Layout,
  Image,
  Quote,
  List,
  GripVertical,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { chatWithAI, simplifyContent } from '@/lib/ai-enhanced';
import { toast } from 'sonner';

interface SlideEditorProps {
  slides: EnhancedSlide[];
  metadata: PaperMetadata;
  settings: UserSettings;
  onSave: (slides: EnhancedSlide[]) => void;
  onExport: () => void;
}

const LAYOUT_OPTIONS = [
  { value: 'title', label: 'Title', icon: Type },
  { value: 'content', label: 'Content', icon: List },
  { value: 'two-column', label: 'Two Column', icon: Layout },
  { value: 'figure', label: 'Figure/Image', icon: Image },
  { value: 'quote', label: 'Quote', icon: Quote },
  { value: 'section-divider', label: 'Section Divider', icon: GripVertical },
];

export function SlideEditor({ slides: initialSlides, metadata, settings, onSave, onExport }: SlideEditorProps) {
  const [slides, setSlides] = useState<EnhancedSlide[]>(initialSlides);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [chatMessages, setChatMessages] = useState<AIChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hi! I'm your AI presentation assistant. I can help you refine slides, suggest improvements, or make changes. What would you like to work on?`,
      timestamp: new Date().toISOString()
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [editedSlide, setEditedSlide] = useState<EnhancedSlide | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const currentSlide = slides[currentSlideIndex];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSlideUpdate = (index: number, updates: Partial<EnhancedSlide>) => {
    const newSlides = [...slides];
    newSlides[index] = { ...newSlides[index], ...updates };
    setSlides(newSlides);
  };

  const handleAddSlide = () => {
    const newSlide: EnhancedSlide = {
      id: slides.length + 1,
      title: 'New Slide',
      content: ['Add your content here'],
      layout: 'content',
      timing: 120
    };
    const newSlides = [...slides, newSlide];
    setSlides(newSlides);
    setCurrentSlideIndex(newSlides.length - 1);
  };

  const handleDeleteSlide = (index: number) => {
    if (slides.length <= 1) {
      toast.error('Cannot delete the last slide');
      return;
    }
    const newSlides = slides.filter((_, i) => i !== index);
    setSlides(newSlides);
    if (currentSlideIndex >= newSlides.length) {
      setCurrentSlideIndex(newSlides.length - 1);
    }
  };

  const handleDuplicateSlide = (index: number) => {
    const slideToCopy = slides[index];
    const newSlide: EnhancedSlide = {
      ...slideToCopy,
      id: Math.max(...slides.map(s => s.id)) + 1,
      title: `${slideToCopy.title} (Copy)`
    };
    const newSlides = [...slides.slice(0, index + 1), newSlide, ...slides.slice(index + 1)];
    setSlides(newSlides);
    setCurrentSlideIndex(index + 1);
  };

  const handleSendChatMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage: AIChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: chatInput,
      timestamp: new Date().toISOString()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const response = await chatWithAI(
        userMessage.content,
        {
          currentSlide,
          allSlides: slides,
          metadata
        },
        settings
      );

      const assistantMessage: AIChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.reply,
        timestamp: new Date().toISOString(),
        action: response.action as AIChatMessage['action']
      };

      setChatMessages(prev => [...prev, assistantMessage]);

      // Handle action if present
      if (response.action) {
        handleAIAction(response.action);
      }
    } catch {
      toast.error('Failed to get AI response');
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleAIAction = (action: { type: string; target?: number; data?: unknown }) => {
    switch (action.type) {
      case 'edit_slide':
        if (action.target !== undefined && action.data) {
          handleSlideUpdate(action.target - 1, action.data as Partial<EnhancedSlide>);
          toast.success(`Updated slide ${action.target}`);
        }
        break;
      case 'add_slide':
        if (action.data) {
          const newSlide = action.data as EnhancedSlide;
          setSlides(prev => [...prev, { ...newSlide, id: prev.length + 1 }]);
          toast.success('Added new slide');
        }
        break;
      case 'remove_slide':
        if (action.target !== undefined) {
          handleDeleteSlide(action.target - 1);
        }
        break;
      case 'reorder':
        if (Array.isArray(action.data)) {
          const newOrder = action.data as number[];
          const reordered = newOrder.map(id => slides.find(s => s.id === id)).filter(Boolean) as EnhancedSlide[];
          setSlides(reordered);
          toast.success('Reordered slides');
        }
        break;
    }
  };

  const handleSimplifyContent = async () => {
    if (!currentSlide) return;
    
    try {
      toast.loading('Simplifying content...');
      const simplified = await simplifyContent(
        currentSlide.content.join('\n'),
        'general',
        settings
      );
      
      handleSlideUpdate(currentSlideIndex, {
        content: simplified.split('\n').filter(line => line.trim())
      });
      
      toast.dismiss();
      toast.success('Content simplified!');
    } catch {
      toast.dismiss();
      toast.error('Failed to simplify content');
    }
  };

  const getLayoutIcon = (layout: string) => {
    const option = LAYOUT_OPTIONS.find(o => o.value === layout);
    const Icon = option?.icon || List;
    return <Icon className="w-4 h-4" />;
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="font-semibold text-gray-900">Slide Editor</h1>
          <Badge variant="secondary">
            {slides.length} slides
          </Badge>
          <Badge variant="outline">
            {Math.round(slides.reduce((acc, s) => acc + (s.timing || 120), 0) / 60)} min
          </Badge>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowChat(!showChat)}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            AI Assistant
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSave(slides)}
          >
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
          <Button
            size="sm"
            onClick={onExport}
          >
            Export
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Slide Thumbnails */}
        <div className="w-64 bg-gray-100 border-r flex flex-col">
          <div className="p-3 border-b bg-white">
            <Button onClick={handleAddSlide} className="w-full" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Slide
            </Button>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-3 space-y-2">
              {slides.map((slide, index) => (
                <div
                  key={slide.id}
                  className={cn(
                    "p-3 rounded-lg cursor-pointer transition-all group relative",
                    currentSlideIndex === index
                      ? "bg-white shadow-md ring-2 ring-blue-500"
                      : "bg-white/50 hover:bg-white hover:shadow-sm"
                  )}
                  onClick={() => setCurrentSlideIndex(index)}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xs font-mono text-gray-400">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    {getLayoutIcon(slide.layout)}
                  </div>
                  <p className="text-sm font-medium truncate">{slide.title}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {slide.content[0]?.slice(0, 30)}...
                  </p>
                  
                  {/* Hover Actions */}
                  <div className="absolute top-2 right-2 hidden group-hover:flex space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicateSlide(index);
                      }}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSlide(index);
                      }}
                      className="p-1 hover:bg-red-100 text-red-500 rounded"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Slide Preview & Edit */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <div className="bg-white border-b px-4 py-2 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
                disabled={currentSlideIndex === 0}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-gray-600">
                {currentSlideIndex + 1} / {slides.length}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentSlideIndex(Math.min(slides.length - 1, currentSlideIndex + 1))}
                disabled={currentSlideIndex === slides.length - 1}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Select
                value={currentSlide?.layout}
                onValueChange={(value) => handleSlideUpdate(currentSlideIndex, { layout: value as EnhancedSlide['layout'] })}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LAYOUT_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center">
                        <option.icon className="w-4 h-4 mr-2" />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSimplifyContent}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Simplify
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditedSlide(currentSlide);
                  setIsEditDialogOpen(true);
                }}
              >
                Edit
              </Button>
            </div>
          </div>

          {/* Slide Preview */}
          <div className="flex-1 bg-gray-200 p-8 overflow-auto">
            <div className="max-w-4xl mx-auto aspect-video bg-white rounded-lg shadow-lg p-8">
              {currentSlide && (
                <div className="h-full flex flex-col">
                  <h2 className="text-2xl font-bold mb-4">{currentSlide.title}</h2>
                  <div className="flex-1">
                    <ul className="space-y-2">
                      {currentSlide.content.map((point, i) => (
                        <li key={i} className="flex items-start">
                          <span className="mr-2 mt-1.5 w-2 h-2 bg-blue-500 rounded-full" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  {currentSlide.notes && (
                    <div className="mt-4 p-3 bg-yellow-50 rounded text-sm text-gray-600">
                      <strong>Notes:</strong> {currentSlide.notes}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AI Chat Panel */}
        {showChat && (
          <div className="w-80 bg-white border-l flex flex-col">
            <div className="p-3 border-b bg-gray-50">
              <h3 className="font-medium flex items-center">
                <Bot className="w-4 h-4 mr-2" />
                AI Assistant
              </h3>
            </div>
            <ScrollArea className="flex-1 p-3">
              <div className="space-y-4">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex",
                      msg.role === 'user' ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[85%] p-3 rounded-lg text-sm",
                        msg.role === 'user'
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-800"
                      )}
                    >
                      <div className="flex items-center mb-1 opacity-70">
                        {msg.role === 'user' ? (
                          <User className="w-3 h-3 mr-1" />
                        ) : (
                          <Bot className="w-3 h-3 mr-1" />
                        )}
                        <span className="text-xs">
                          {msg.role === 'user' ? 'You' : 'AI'}
                        </span>
                      </div>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            </ScrollArea>
            <div className="p-3 border-t">
              <div className="flex space-x-2">
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask AI to help..."
                  onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage()}
                />
                <Button
                  size="icon"
                  onClick={handleSendChatMessage}
                  disabled={isChatLoading || !chatInput.trim()}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Try: &quot;Make this more concise&quot; or &quot;Add a chart slide&quot;
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Slide</DialogTitle>
          </DialogHeader>
          {editedSlide && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={editedSlide.title}
                  onChange={(e) => setEditedSlide({ ...editedSlide, title: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Content (one per line)</label>
                <Textarea
                  value={editedSlide.content.join('\n')}
                  onChange={(e) => setEditedSlide({ 
                    ...editedSlide, 
                    content: e.target.value.split('\n').filter(line => line.trim()) 
                  })}
                  rows={6}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Speaker Notes</label>
                <Textarea
                  value={editedSlide.notes || ''}
                  onChange={(e) => setEditedSlide({ ...editedSlide, notes: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Timing (seconds)</label>
                <Input
                  type="number"
                  value={editedSlide.timing || 120}
                  onChange={(e) => setEditedSlide({ ...editedSlide, timing: parseInt(e.target.value) })}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  handleSlideUpdate(currentSlideIndex, editedSlide);
                  setIsEditDialogOpen(false);
                  toast.success('Slide updated');
                }}>
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
