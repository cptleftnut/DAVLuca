import { BarChart3, PieChart, TrendingUp, Download, Share2, Layers } from 'lucide-react';
import { InfographicItem } from '../types';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from './ui/UIPrimitives';
import { useLanguage } from '../contexts/LanguageContext';

interface PublicInfographicGalleryProps {
  infographics: InfographicItem[];
}

export function PublicInfographicGallery({ infographics }: PublicInfographicGalleryProps) {
  const { language, t } = useLanguage();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
            {t('Forensiske Infografikker & Visuel Datamatrix', 'Forensic Infographics & Visual Data Synthesis')}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {t(
              'Automatiserede visualiseringsmatricer kompileret ud fra verificerede bankoverførsler, teledata og toldmanifester.',
              'Automated visualization matrices compiled from verified bank transfers, phone metadata, and customs logs.'
            )}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {infographics.map((info) => {
          return (
            <Card key={info.id} className="border-slate-800 hover:border-indigo-500/40 transition-all flex flex-col justify-between">
              <div>
                <CardHeader>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[11px] font-mono text-indigo-400 uppercase tracking-wider font-semibold">
                      {info.category}
                    </span>
                    <Badge variant="indigo">
                      {info.chartType}
                    </Badge>
                  </div>
                  <CardTitle className="text-base font-bold text-white">
                    {info.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {info.description}
                  </p>

                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-3">
                    {info.metrics.map((metric, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">{metric.label}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white font-mono">{metric.value}</span>
                          {metric.change && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-semibold">
                              {metric.change}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </div>

              <div className="p-5 pt-0 border-t border-slate-800/60 mt-4 flex items-center justify-between text-xs text-slate-400">
                <span>{t('Genereret:', 'Generated:')} {info.lastGenerated}</span>
                <button
                  onClick={() => alert(t(`Infografik "${info.title}" klargjort til rapporteksport.`, `Infographic "${info.title}" ready for report export.`))}
                  className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  {t('Eksportér Vektor', 'Export Vector')}
                </button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
