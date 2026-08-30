import { useState } from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle2, Search, Filter, ArrowUpRight } from 'lucide-react';
import { SeriousClaim } from '../types';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from './ui/UIPrimitives';
import { useLanguage } from '../contexts/LanguageContext';

interface CaseSeriousClaimsRegisterPanelProps {
  claims: SeriousClaim[];
  onSelectClaim?: (claim: SeriousClaim) => void;
}

export function CaseSeriousClaimsRegisterPanel({ claims, onSelectClaim }: CaseSeriousClaimsRegisterPanelProps) {
  const { language, t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredClaims = claims.filter(claim => {
    const matchesStatus = statusFilter === 'all' || claim.status === statusFilter;
    const matchesSearch = claim.claimId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          claim.claimant.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          claim.targetParty.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          claim.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          claim.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const statusesDa: Record<string, string> = {
    'all': 'Alle Påstande',
    'Substantiated': 'Underbygget & Dokumenteret',
    'Under Review': 'Under Granskning',
    'Pending Evidence': 'Afventer Supplerende Bevis'
  };

  const statuses = ['all', 'Substantiated', 'Under Review', 'Pending Evidence'];

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-4 h-4 text-indigo-400 mr-1" />
          {statuses.map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {language === 'da' ? statusesDa[st] || st : st === 'all' ? 'All Claims' : st}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder={t('Søg i sags-ID, emner, anmeldere...', 'Search claim IDs, subjects, claimants...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-72 bg-slate-800/90 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Claims List Table/Cards */}
      <div className="space-y-4">
        {filteredClaims.map((claim) => {
          return (
            <Card key={claim.id} className="border-slate-800 hover:border-red-500/30 transition-all">
              <CardContent className="p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-red-400 bg-red-500/10 px-2.5 py-1 rounded border border-red-500/20">
                      {claim.claimId}
                    </span>
                    <h3 className="text-base font-bold text-white">
                      {claim.category}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant={claim.severity === 'critical' ? 'critical' : 'high'}>
                      {t('Alvorlighed:', 'Severity:')} {claim.severity === 'critical' ? t('Kritisk', 'Critical') : t('Høj', 'High')}
                    </Badge>
                    <Badge variant={claim.status === 'Substantiated' ? 'success' : 'amber'}>
                      {language === 'da' ? statusesDa[claim.status] || claim.status : claim.status}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <span className="text-slate-400">{t('Anmelder / Kilde:', 'Claimant / Source:')}</span>
                    <div className="font-semibold text-slate-200">{claim.claimant}</div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-slate-400">{t('Målrettet Part / Subjekt:', 'Target Subject:')}</span>
                    <div className="font-semibold text-red-300">{claim.targetParty}</div>
                  </div>
                </div>

                <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  {claim.description}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-medium">{t('Bevishenvisninger:', 'Evidence Citations:')}</span>
                    {claim.evidenceRefs.map((ref, idx) => (
                      <span key={idx} className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700">
                        {ref}
                      </span>
                    ))}
                  </div>

                  <div className="text-slate-400 text-[11px]">
                    {t('Registreret:', 'Registered:')} {claim.registeredDate} • {t('Sidst opdateret:', 'Updated:')} {claim.lastUpdated}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
