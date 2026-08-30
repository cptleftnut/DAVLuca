import { useState } from 'react';
import { AlertTriangle, CheckCircle2, Clock, Filter, Plus, ArrowUpRight } from 'lucide-react';
import { ControlQueueItem } from '../types';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from './ui/UIPrimitives';
import { useLanguage } from '../contexts/LanguageContext';

interface CaseControlQueuePanelProps {
  items: ControlQueueItem[];
}

export function CaseControlQueuePanel({ items: initialItems }: CaseControlQueuePanelProps) {
  const { language, t } = useLanguage();
  const [items, setItems] = useState<ControlQueueItem[]>(initialItems);
  const [statusFilter, setStatusFilter] = useState('all');

  const updateStatus = (id: string, newStatus: ControlQueueItem['status']) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
  };

  const filteredItems = items.filter(item => {
    if (statusFilter === 'all') return true;
    return item.status === statusFilter;
  });

  const statusesDa: Record<string, string> = {
    'all': 'Alle Opgaver',
    'Open': 'Åben / Afventer',
    'In Progress': 'I Gangværende Revision',
    'Resolved': 'Afsluttet & Godkendt'
  };

  const prioritiesDa: Record<string, string> = {
    'urgent': 'Haster / Kritisk',
    'high': 'Høj Prioritet',
    'medium': 'Middel Prioritet'
  };

  return (
    <div className="space-y-6">
      {/* Control Actions & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-4 h-4 text-indigo-400 mr-1" />
          {['all', 'Open', 'In Progress', 'Resolved'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {language === 'da' ? statusesDa[st] || st : st === 'all' ? 'All Tasks' : st}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-400">
          {t('Viser', 'Showing')} <strong className="text-white">{filteredItems.length}</strong> {t('af', 'of')} {items.length} {t('kontrolopgaver', 'tasks')}
        </div>
      </div>

      {/* Task Queue List */}
      <div className="space-y-3">
        {filteredItems.map(item => {
          return (
            <Card key={item.id} className="border-slate-800 hover:border-slate-700 transition-all">
              <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                      {item.itemCode}
                    </span>
                    <Badge variant={item.priority === 'urgent' ? 'critical' : item.priority === 'high' ? 'high' : 'medium'}>
                      {language === 'da' ? prioritiesDa[item.priority] || item.priority : item.priority}
                    </Badge>
                    <span className="text-xs text-slate-400 font-medium">
                      {item.type}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-white">
                    {item.title}
                  </h4>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {item.notes}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                    <span>{t('Ansvarlig:', 'Assigned:')} <strong className="text-slate-200">{item.assignedTo}</strong></span>
                    <span>{t('Frist:', 'Due:')} <strong className="text-amber-400">{item.dueDate}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-6">
                  {item.status !== 'Resolved' ? (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => updateStatus(item.id, 'Resolved')}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {t('Marker som Udført', 'Mark Resolved')}
                    </Button>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                      <CheckCircle2 className="w-4 h-4" />
                      {t('Afsluttet & Godkendt', 'Resolved')}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
