'use client';

import { PaperAnalysis } from '@/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Users, FileText, BarChart3, Table, ImageIcon } from 'lucide-react';

interface AnalysisResultProps {
  analysis: PaperAnalysis;
  wordCount: number;
  pageCount: number;
}

export function AnalysisResult({ analysis, wordCount, pageCount }: AnalysisResultProps) {
  return (
    <Card className="p-6 space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">{analysis.title}</h2>
        {analysis.authors && analysis.authors.length > 0 && (
          <div className="flex items-center text-gray-600">
            <Users className="w-4 h-4 mr-2" />
            <span className="text-sm">{analysis.authors.join(', ')}</span>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          icon={<FileText className="w-4 h-4" />}
          label="Pages"
          value={pageCount}
        />
        <StatCard
          icon={<BarChart3 className="w-4 h-4" />}
          label="Words"
          value={wordCount.toLocaleString()}
        />
        <StatCard
          icon={<ImageIcon className="w-4 h-4" />}
          label="Figures"
          value={analysis.figures || 0}
        />
        <StatCard
          icon={<Table className="w-4 h-4" />}
          label="Tables"
          value={analysis.tables || 0}
        />
      </div>

      {/* Abstract */}
      {analysis.abstract && (
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-900 flex items-center">
            <BookOpen className="w-4 h-4 mr-2" />
            Abstract
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed line-clamp-4">
            {analysis.abstract}
          </p>
        </div>
      )}

      {/* Keywords */}
      {analysis.keywords && analysis.keywords.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-900">Keywords</h3>
          <div className="flex flex-wrap gap-2">
            {analysis.keywords.map((keyword, index) => (
              <Badge key={index} variant="secondary">
                {keyword}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Detected Sections */}
      {analysis.sections && analysis.sections.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900">Detected Sections</h3>
          <div className="space-y-2">
            {analysis.sections.map((section, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg"
              >
                <span className="text-sm font-medium text-gray-700">
                  {section.heading}
                </span>
                <Badge
                  variant={section.importance === 'high' ? 'default' : 'outline'}
                  className={
                    section.importance === 'high'
                      ? 'bg-blue-100 text-blue-700 hover:bg-blue-100'
                      : section.importance === 'medium'
                      ? 'text-gray-600'
                      : 'text-gray-400'
                  }
                >
                  {section.importance}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

function StatCard({
  icon,
  label,
  value
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
      <div className="text-gray-400 mb-1">{icon}</div>
      <span className="text-xl font-bold text-gray-900">{value}</span>
      <span className="text-xs text-gray-500">{label}</span>
    </div>
  );
}
