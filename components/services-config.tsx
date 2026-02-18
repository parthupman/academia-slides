'use client';

import { AIService, ServiceType, TASK_ROUTING } from '@/types/services';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Brain,
  Image,
  BarChart3,
  Share2,
  FunctionSquare,
  Workflow,
  Check,
  Zap,
  Settings,
  Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ServicesConfigProps {
  services: AIService[];
  onUpdate: (services: AIService[]) => void;
}

const SERVICE_ICONS: Record<ServiceType, typeof Brain> = {
  'text-analysis': Brain,
  'image-generation': Image,
  'chart-generation': BarChart3,
  'diagram-generation': Share2,
  'equation-rendering': FunctionSquare,
  'voice-generation': Workflow,
  'slide-layout': Settings,
  'citation-formatting': Shield
};

const SERVICE_COLORS: Record<ServiceType, string> = {
  'text-analysis': 'bg-blue-500',
  'image-generation': 'bg-purple-500',
  'chart-generation': 'bg-green-500',
  'diagram-generation': 'bg-orange-500',
  'equation-rendering': 'bg-red-500',
  'voice-generation': 'bg-pink-500',
  'slide-layout': 'bg-gray-500',
  'citation-formatting': 'bg-yellow-500'
};

export function ServicesConfig({ services, onUpdate }: ServicesConfigProps) {
  const updateService = (serviceId: string, updates: Partial<AIService>) => {
    const newServices = services.map(s => 
      s.id === serviceId ? { ...s, ...updates } : s
    );
    onUpdate(newServices);
  };

  const updateServiceConfig = (serviceId: string, config: Partial<AIService['config']>) => {
    const service = services.find(s => s.id === serviceId);
    if (service) {
      updateService(serviceId, {
        config: { ...service.config, ...config }
      });
    }
  };

  const groupedServices = services.reduce((acc, service) => {
    if (!acc[service.type]) acc[service.type] = [];
    acc[service.type].push(service);
    return acc;
  }, {} as Record<ServiceType, AIService[]>);

  const getServiceIcon = (type: ServiceType) => {
    const Icon = SERVICE_ICONS[type];
    return <Icon className="w-5 h-5" />;
  };

  return (
    <div className="space-y-6">
      {/* Architecture Overview */}
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
        <h3 className="text-lg font-semibold mb-2 flex items-center">
          <Workflow className="w-5 h-5 mr-2 text-blue-600" />
          Multi-Service Architecture
        </h3>
        <p className="text-gray-600 mb-4">
          AcademiaSlides uses specialized AI services for different tasks. 
          This modular approach gives you the best results for each component.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(SERVICE_ICONS).map(([type, Icon]) => (
            <div key={type} className="flex items-center space-x-2 text-sm">
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-white", SERVICE_COLORS[type as ServiceType])}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="capitalize">{type.replace(/-/g, ' ')}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Service Configuration Tabs */}
      <Tabs defaultValue="text-analysis">
        <TabsList className="grid grid-cols-4 md:grid-cols-8">
          {Object.keys(SERVICE_ICONS).map((type) => (
            <TabsTrigger key={type} value={type} className="flex items-center space-x-1">
              {getServiceIcon(type as ServiceType)}
              <span className="hidden md:inline capitalize">{type.replace(/-/g, ' ')}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(groupedServices).map(([type, typeServices]) => (
          <TabsContent key={type} value={type} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold capitalize flex items-center">
                {getServiceIcon(type as ServiceType)}
                <span className="ml-2">{type.replace(/-/g, ' ')} Services</span>
              </h3>
              <Badge variant="outline">
                {typeServices.filter(s => s.config.enabled).length} enabled
              </Badge>
            </div>

            <div className="grid gap-4">
              {typeServices.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  onConfigUpdate={(config) => updateServiceConfig(service.id, config)}
                />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Task Routing Preview */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Zap className="w-5 h-5 mr-2 text-amber-500" />
          Task Routing
        </h3>
        <p className="text-gray-600 mb-4">
          When you generate a presentation, tasks are automatically routed to the best available service:
        </p>
        <div className="space-y-2">
          {TASK_ROUTING.slice(0, 6).map((routing) => (
            <div key={routing.task} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
              <span className="capitalize">{routing.task.replace(/-/g, ' ')}</span>
              <div className="flex items-center space-x-2">
                {routing.preferredServices.slice(0, 3).map((serviceId) => {
                  const service = services.find(s => s.id === serviceId);
                  const isEnabled = service?.config.enabled;
                  return (
                    <Badge 
                      key={serviceId} 
                      variant={isEnabled ? 'default' : 'secondary'}
                      className={cn(!isEnabled && 'opacity-50')}
                    >
                      {service?.name || serviceId}
                      {isEnabled && <Check className="w-3 h-3 ml-1" />}
                    </Badge>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function ServiceCard({ 
  service, 
  onConfigUpdate 
}: { 
  service: AIService; 
  onConfigUpdate: (config: Partial<AIService['config']>) => void;
}) {
  const Icon = SERVICE_ICONS[service.type];

  return (
    <Card className={cn(
      "p-4 transition-all",
      service.config.enabled ? "border-blue-200" : "border-gray-200 opacity-75"
    )}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center text-white",
            SERVICE_COLORS[service.type]
          )}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="font-semibold">{service.name}</h4>
              {service.config.enabled && (
                <Badge className="bg-green-100 text-green-700">
                  <Check className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-500">{service.description}</p>
            <div className="flex flex-wrap gap-1 mt-2">
              {service.capabilities.slice(0, 3).map((cap) => (
                <span key={cap} className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                  {cap.replace(/-/g, ' ')}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            checked={service.config.enabled}
            onCheckedChange={(checked) => onConfigUpdate({ enabled: checked })}
          />
        </div>
      </div>

      {service.config.enabled && service.requiresApiKey && (
        <div className="mt-4 pt-4 border-t space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs">API Key</Label>
              <Input
                type="password"
                value={service.config.apiKey || ''}
                onChange={(e) => onConfigUpdate({ apiKey: e.target.value })}
                placeholder="Enter API key"
              />
            </div>
            {service.config.model !== undefined && (
              <div>
                <Label className="text-xs">Model</Label>
                <Input
                  value={service.config.model || ''}
                  onChange={(e) => onConfigUpdate({ model: e.target.value })}
                  placeholder="Model name"
                />
              </div>
            )}
          </div>
          {service.config.endpoint !== undefined && (
            <div>
              <Label className="text-xs">Custom Endpoint (optional)</Label>
              <Input
                value={service.config.endpoint || ''}
                onChange={(e) => onConfigUpdate({ endpoint: e.target.value })}
                placeholder="https://api.example.com"
              />
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
