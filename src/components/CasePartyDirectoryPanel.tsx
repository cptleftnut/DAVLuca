import { useState } from 'react';
import { Users, User, ShieldAlert, FileText, ChevronRight, Search, Building } from 'lucide-react';
import { Party } from '../types';
import { Card, CardContent, Badge, Button } from './ui/UIPrimitives';
import { CasePartyTechnicalSignalsPanel } from './CasePartyTechnicalSignalsPanel';
import { useLanguage } from '../contexts/LanguageContext';

interface CasePartyDirectoryPanelProps {
  parties: Party[];
  onSelectParty?: (party: Party) => void;
}

export function CasePartyDirectoryPanel({ parties, onSelectParty }: CasePartyDirectoryPanelProps) {
  const { language, t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedParty, setSelectedParty] = useState<Party | null>(parties[0] || null);

  const filteredParties = parties.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.organization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-400" />
          <h3 className="text-sm font-semibold text-white">
            {t('Katalog over Relevante Parter & Aktører', 'Parties of Interest Directory')}
          </h3>
          <span className="text-xs text-slate-400">({parties.length} {t('indekseret', 'indexed')})</span>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder={t('Søg i navne, roller, organisationer...', 'Search party names, roles, entities...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-72 bg-slate-800/90 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Directory Grid & Profile Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-3">
          {filteredParties.map((party) => {
            const isSelected = selectedParty?.id === party.id;
            return (
              <div
                key={party.id}
                onClick={() => {
                  setSelectedParty(party);
                  if (onSelectParty) onSelectParty(party);
                }}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-950/40 border-indigo-500 shadow-md'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold shrink-0">
                      {party.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white leading-snug">{party.name}</h4>
                      <p className="text-xs text-slate-400">{party.role}</p>
                    </div>
                  </div>
                  <Badge variant={party.riskLevel === 'critical' ? 'critical' : party.riskLevel === 'high' ? 'high' : 'medium'}>
                    {party.riskLevel === 'critical' ? t('Kritisk', 'Critical') : party.riskLevel === 'high' ? t('Høj', 'High') : t('Middel', 'Medium')}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
                  <Building className="w-3.5 h-3.5 text-slate-500" />
                  <span>{party.organization}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-[11px] text-slate-400 text-center">
                  <div className="bg-slate-950/50 p-1.5 rounded">
                    <div className="font-semibold text-white">{party.keyMentionsCount}</div>
                    <div className="text-slate-400">{t('Omtaler', 'Mentions')}</div>
                  </div>
                  <div className="bg-slate-950/50 p-1.5 rounded">
                    <div className="font-semibold text-white">{party.claimsCount}</div>
                    <div className="text-slate-400">{t('Påstande', 'Claims')}</div>
                  </div>
                  <div className="bg-slate-950/50 p-1.5 rounded">
                    <div className="font-semibold text-white">{party.documentsLinked}</div>
                    <div className="text-slate-400">{t('Dokumenter', 'Docs Linked')}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Party Deep Dive */}
        <div className="lg:col-span-7 space-y-6">
          {selectedParty ? (
            <>
              <Card className="border-indigo-500/30">
                <CardContent className="p-6 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300 font-bold text-xl">
                        {selectedParty.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">{selectedParty.name}</h2>
                        <p className="text-xs text-slate-300">{selectedParty.role} • <strong className="text-slate-200">{selectedParty.organization}</strong></p>
                      </div>
                    </div>

                    <Badge variant={selectedParty.riskLevel === 'critical' ? 'critical' : selectedParty.riskLevel === 'high' ? 'high' : 'medium'}>
                      {t('Risikoprofil:', 'Risk Exposure:')} {selectedParty.riskLevel}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      {t('Efterforskningsnotater & Profilering', 'Investigative Notes & Profile')}
                    </h5>
                    <p className="text-sm text-slate-200 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                      {selectedParty.notes}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Technical Signals Module */}
              <CasePartyTechnicalSignalsPanel party={selectedParty} />
            </>
          ) : (
            <div className="p-12 text-center text-slate-400 bg-slate-900/40 rounded-xl border border-slate-800">
              {t('Vælg en part fra oversigten for at se tekniske signaler og dossier.', 'Select a party from the directory to review technical signals and dossiers.')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
