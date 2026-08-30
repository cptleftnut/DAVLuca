import React, { useState, useMemo } from 'react';
import { useCaseData } from '../contexts/CaseDataContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, Badge } from './ui/UIPrimitives';
import {
  Users,
  Search,
  AlertTriangle,
  Activity,
  Briefcase,
  Phone,
  Wifi,
  HeartHandshake,
  MessageSquare,
  ShieldAlert,
  Flame,
  ChevronDown,
  ChevronUp,
  FileText,
  Smile,
  Frown,
  Meh,
  Tag,
  Link as LinkIcon,
  Sparkles,
  Edit3,
  Check,
  X,
  Plus,
  Share2,
  Scale,
  Building,
  UserCheck,
  Eye,
  SlidersHorizontal,
  Bot
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Party, DocumentFinding } from '../types';

interface PartySignalsProps {
  onSelectParty?: (partyId: string) => void;
  onSelectDocument?: (doc: DocumentFinding) => void;
  onAskAIAboutParty?: (partyName: string) => void;
  className?: string;
}

const CONNECTION_TYPES = [
  'Primary Investigator',
  'Authority / Caseworker',
  'Family Member',
  'Witness / Whistleblower',
  'Legal Counsel',
  'Child Welfare Specialist',
  'Third-Party Observer'
];

const RISK_LEVELS: Array<{ value: 'low' | 'medium' | 'high' | 'critical'; labelDa: string; labelEn: string; color: string; border: string; bg: string }> = [
  { value: 'critical', labelDa: 'Kritisk Risiko', labelEn: 'Critical Risk', color: 'text-red-400', border: 'border-red-500/40', bg: 'bg-red-500/15' },
  { value: 'high', labelDa: 'Høj Risiko', labelEn: 'High Risk', color: 'text-amber-400', border: 'border-amber-500/40', bg: 'bg-amber-500/15' },
  { value: 'medium', labelDa: 'Middel Risiko', labelEn: 'Medium Risk', color: 'text-yellow-300', border: 'border-yellow-500/40', bg: 'bg-yellow-500/15' },
  { value: 'low', labelDa: 'Lav Risiko', labelEn: 'Low Risk', color: 'text-emerald-400', border: 'border-emerald-500/40', bg: 'bg-emerald-500/15' }
];

export function PartySignals({
  onSelectParty,
  onSelectDocument,
  onAskAIAboutParty,
  className = ''
}: PartySignalsProps) {
  const { parties, documents, transcripts, claims, updateParty } = useCaseData();
  const { language, t } = useLanguage();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<string>('all');
  const [selectedConnectionFilter, setSelectedConnectionFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'cards' | 'matrix' | 'relationships'>('cards');
  const [expandedPartyId, setExpandedPartyId] = useState<string | null>(null);

  // Quick edit modal or inline edit state
  const [editingPartyId, setEditingPartyId] = useState<string | null>(null);
  const [editRiskLevel, setEditRiskLevel] = useState<string>('medium');
  const [editConnectionType, setEditConnectionType] = useState<string>('Witness / Whistleblower');
  const [editCustomTag, setEditCustomTag] = useState<string>('');
  const [editNotes, setEditNotes] = useState<string>('');

  // Start editing a party's signals and connection tags
  const handleStartEdit = (party: Party) => {
    setEditingPartyId(party.id);
    setEditRiskLevel(party.riskLevel || 'medium');
    setEditConnectionType(party.connectionType || party.category || 'Witness / Whistleblower');
    setEditNotes(party.notes || '');
    setEditCustomTag('');
  };

  // Save tags and risk levels to CaseDataContext
  const handleSaveEdit = (partyId: string) => {
    const existing = parties.find((p) => p.id === partyId);
    if (!existing) return;

    const updatedTags = Array.isArray(existing.tags) ? [...existing.tags] : [];
    if (editCustomTag.trim() && !updatedTags.includes(editCustomTag.trim())) {
      updatedTags.push(editCustomTag.trim());
    }

    updateParty(
      partyId,
      {
        riskLevel: editRiskLevel as any,
        connectionType: editConnectionType,
        notes: editNotes,
        tags: updatedTags
      },
      `Opdateret Risk Level (${editRiskLevel}) og Connection Type (${editConnectionType}) via PartySignals`
    );

    setEditingPartyId(null);
  };

  const getToneBadgeDetails = (tone?: string) => {
    switch (tone) {
      case 'hostile':
        return {
          label: t('KONFRONTATORISK / HOSTILE', 'HOSTILE / CONFRONTATIONAL'),
          bg: 'bg-red-500/20 border-red-500/50 text-red-300',
          icon: Flame
        };
      case 'evasive':
        return {
          label: t('EVASIV / AFVISENDE', 'EVASIVE / RESISTANT'),
          bg: 'bg-amber-500/20 border-amber-500/50 text-amber-300',
          icon: ShieldAlert
        };
      case 'critical':
        return {
          label: t('KRITISK ANALYTISK', 'CRITICAL ANALYTICAL'),
          bg: 'bg-orange-500/20 border-orange-500/50 text-orange-300',
          icon: Frown
        };
      case 'anxious':
        return {
          label: t('ANGST / URO', 'ANXIOUS / TRAUMATIZED'),
          bg: 'bg-purple-500/20 border-purple-500/50 text-purple-300',
          icon: Frown
        };
      case 'supportive':
        return {
          label: t('OMSORGSFULD / STØTTENDE', 'SUPPORTIVE / CARING'),
          bg: 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300',
          icon: Smile
        };
      case 'cooperative':
        return {
          label: t('KOOPERATIV / BLANK', 'COOPERATIVE / CLEAR'),
          bg: 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300',
          icon: HeartHandshake
        };
      default:
        return {
          label: t('NEUTRAL / FORMEL', 'NEUTRAL / FORMAL'),
          bg: 'bg-zinc-800 border-zinc-700 text-zinc-300',
          icon: Meh
        };
    }
  };

  const filteredParties = useMemo(() => {
    return parties.filter((p) => {
      const lower = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        p.name.toLowerCase().includes(lower) ||
        p.role.toLowerCase().includes(lower) ||
        p.organization.toLowerCase().includes(lower) ||
        (p.connectionType && p.connectionType.toLowerCase().includes(lower)) ||
        (p.tags && p.tags.some((tg) => tg.toLowerCase().includes(lower)));

      const matchesRisk =
        selectedRiskFilter === 'all' || p.riskLevel === selectedRiskFilter;

      const pConn = p.connectionType || p.category || 'Witness / Whistleblower';
      const matchesConn =
        selectedConnectionFilter === 'all' || pConn === selectedConnectionFilter;

      return matchesSearch && matchesRisk && matchesConn;
    });
  }, [parties, searchTerm, selectedRiskFilter, selectedConnectionFilter]);

  // Groupings for Relationship visualizer
  const connectionTypeGroups = useMemo(() => {
    const map = new Map<string, Party[]>();
    parties.forEach((p) => {
      const conn = p.connectionType || p.category || 'Other / Unassigned';
      if (!map.has(conn)) map.set(conn, []);
      map.get(conn)!.push(p);
    });
    return Array.from(map.entries());
  }, [parties]);

  const getRiskBadge = (risk: string) => {
    const found = RISK_LEVELS.find((r) => r.value === risk);
    if (!found) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-zinc-800 text-zinc-400 border border-zinc-700">
          {risk}
        </span>
      );
    }
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border uppercase tracking-wider ${found.bg} ${found.color} ${found.border}`}>
        <AlertTriangle className="w-3 h-3" />
        {language === 'da' ? found.labelDa : found.labelEn}
      </span>
    );
  };

  const getConnectionBadge = (type?: string) => {
    const tLabel = type || 'Witness / Whistleblower';
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
        <LinkIcon className="w-3 h-3 text-indigo-400" />
        {tLabel}
      </span>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Top Header Card */}
      <div className="bg-zinc-900/90 border border-zinc-800 p-5 md:p-6 rounded-2xl shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-mono font-bold">
                {t('Trin 4: Kilde- & Ekspertkritik', 'Step 4: Source & Entity Signals')}
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                <UserCheck className="w-3 h-3" />
                <span>{parties.length} {t('Registrerede Aktører', 'Indexed Entities')}</span>
              </span>
            </div>

            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <Users className="w-6 h-6 text-indigo-400 shrink-0" />
              <span>{t('PartySignals & Forbindelsestagging (Entity Matrix)', 'PartySignals & Relationship Tagging')}</span>
            </h2>

            <p className="text-xs md:text-sm text-zinc-300 max-w-3xl leading-relaxed">
              {t(
                'Kortlæg sagens nøglepersoner og myndigheder. Tilknyt risikoniveauer (Risk Level), forbindelsestyper (Connection Type) og undersøg adfærdsmæssige signaler og kildebias.',
                'Map key case entities and authorities. Tag Risk Levels and Connection Types, and investigate behavioral signals, institutional bias, and shared evidence.'
              )}
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="p-1 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveTab('cards')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'cards'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-bold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>{t('Aktørkort', 'Entity Cards')}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('relationships')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'relationships'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-bold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{t('Forbindelsesstruktur', 'Relationships')}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('matrix')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'matrix'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-bold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>{t('Tabelmatrix', 'Matrix')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="mt-5 pt-5 border-t border-zinc-800/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('Søg i navne, roller, organisationer, tags...', 'Search names, roles, organizations, tags...')}
              className="w-full bg-zinc-950 border border-zinc-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Risk Level Filter */}
          <div>
            <select
              value={selectedRiskFilter}
              onChange={(e) => setSelectedRiskFilter(e.target.value)}
              aria-label={t('Filtrer på risikoniveau', 'Filter by risk level')}
              className="w-full bg-zinc-950 border border-zinc-700/80 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
            >
              <option value="all">{t('Alle Risikoniveauer', 'All Risk Levels')}</option>
              <option value="critical">🔴 {t('Kritisk Risiko (Critical)', 'Critical Risk')}</option>
              <option value="high">🟠 {t('Høj Risiko (High)', 'High Risk')}</option>
              <option value="medium">🟡 {t('Middel Risiko (Medium)', 'Medium Risk')}</option>
              <option value="low">🟢 {t('Lav Risiko (Low)', 'Low Risk')}</option>
            </select>
          </div>

          {/* Connection Type Filter */}
          <div>
            <select
              value={selectedConnectionFilter}
              onChange={(e) => setSelectedConnectionFilter(e.target.value)}
              aria-label={t('Filtrer på forbindelsestype', 'Filter by connection type')}
              className="w-full bg-zinc-950 border border-zinc-700/80 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
            >
              <option value="all">{t('Alle Forbindelsestyper', 'All Connection Types')}</option>
              {CONNECTION_TYPES.map((ct) => (
                <option key={ct} value={ct}>
                  {ct}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* RELATIONSHIP STRUCTURE VISUALIZER TAB */}
      {activeTab === 'relationships' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {connectionTypeGroups.map(([connType, groupParties]) => (
              <div
                key={connType}
                className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-lg space-y-4"
              >
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                      <LinkIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white leading-tight">{connType}</h4>
                      <p className="text-[11px] text-zinc-400">{groupParties.length} {t('aktører', 'entities')}</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                    {groupParties.length}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {groupParties.map((p) => (
                    <div
                      key={p.id}
                      className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800/80 hover:border-indigo-500/40 transition-colors flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-white truncate">{p.name}</div>
                        <div className="text-[11px] text-zinc-400 truncate">{p.role} • {p.organization}</div>
                      </div>
                      <div className="shrink-0 flex items-center gap-1.5">
                        {getRiskBadge(p.riskLevel)}
                        <button
                          type="button"
                          onClick={() => handleStartEdit(p)}
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                          title={t('Rediger Risk & Connection', 'Edit Risk & Connection')}
                        >
                          <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MATRIX VIEW */}
      {activeTab === 'matrix' && (
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950 text-zinc-400 font-mono uppercase tracking-wider border-b border-zinc-800">
                <tr>
                  <th className="py-3 px-4">{t('Aktør / Navn', 'Entity Name')}</th>
                  <th className="py-3 px-4">{t('Rolle & Organisation', 'Role & Organization')}</th>
                  <th className="py-3 px-4">{t('Connection Type', 'Connection Type')}</th>
                  <th className="py-3 px-4">{t('Risk Level', 'Risk Level')}</th>
                  <th className="py-3 px-4">{t('Sagsrelationer', 'Linked Items')}</th>
                  <th className="py-3 px-4 text-right">{t('Handlinger', 'Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80">
                {filteredParties.map((party) => (
                  <tr key={party.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white whitespace-nowrap">
                      {party.name}
                    </td>
                    <td className="py-3.5 px-4 text-zinc-300">
                      <div>{party.role}</div>
                      <div className="text-[11px] text-zinc-500">{party.organization}</div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getConnectionBadge(party.connectionType || party.category)}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getRiskBadge(party.riskLevel)}
                    </td>
                    <td className="py-3.5 px-4 text-zinc-400 text-xs">
                      <span>{party.documentsLinked || 0} {t('dok.', 'docs')}</span> •{' '}
                      <span>{party.claimsCount || 0} {t('påstande', 'claims')}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-1">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(party)}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-indigo-300 hover:text-white transition-colors cursor-pointer inline-flex items-center gap-1 text-xs font-semibold"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>{t('Tag', 'Tag')}</span>
                      </button>

                      {onAskAIAboutParty && (
                        <button
                          type="button"
                          onClick={() => onAskAIAboutParty(party.name)}
                          className="p-1.5 rounded-lg bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-300 border border-emerald-500/30 transition-colors cursor-pointer inline-flex items-center gap-1 text-xs font-semibold"
                          title={t('Spørg AI om denne aktør', 'Ask AI about entity')}
                        >
                          <Bot className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CARDS VIEW (DEFAULT) */}
      {activeTab === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredParties.map((party, idx) => {
              const toneInfo = getToneBadgeDetails(party.sentimentProfile?.overallTone);
              const ToneIcon = toneInfo.icon;
              const isExpanded = expandedPartyId === party.id;
              const isEditing = editingPartyId === party.id;
              const quotes = party.sentimentProfile?.keyEmotionalQuotes || [];

              return (
                <motion.div
                  key={party.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, delay: Math.min(idx * 0.03, 0.3) }}
                >
                  <Card className="h-full bg-zinc-900/90 border-zinc-800 hover:border-indigo-500/40 transition-colors flex flex-col justify-between shadow-lg overflow-hidden">
                    <div className="p-5 space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold shrink-0">
                            <Users className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-bold text-white text-base leading-snug">{party.name}</h3>
                            <p className="text-xs text-zinc-400 flex items-center gap-1">
                              <Briefcase className="w-3 h-3 text-zinc-500" />
                              {party.role}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1 shrink-0">
                          {getRiskBadge(party.riskLevel)}
                          <button
                            type="button"
                            onClick={() => (isEditing ? setEditingPartyId(null) : handleStartEdit(party))}
                            className="p-1 rounded-lg text-xs text-indigo-400 hover:text-indigo-300 hover:bg-zinc-800 transition-colors cursor-pointer flex items-center gap-1 font-semibold"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>{isEditing ? t('Luk', 'Close') : t('Tag', 'Tag')}</span>
                          </button>
                        </div>
                      </div>

                      {/* Connection Type & Org */}
                      <div className="flex flex-wrap items-center gap-2">
                        {getConnectionBadge(party.connectionType || party.category)}
                        <span className="text-xs text-zinc-400 font-semibold">• {party.organization}</span>
                      </div>

                      {/* INLINE EDIT TAGGING CONTROLS */}
                      {isEditing && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="p-4 rounded-xl bg-zinc-950 border border-indigo-500/40 space-y-3 shadow-inner"
                        >
                          <div className="flex items-center justify-between text-xs font-bold text-indigo-300">
                            <span className="flex items-center gap-1">
                              <Tag className="w-3.5 h-3.5" />
                              {t('Tilknyt Risk Level & Connection Type', 'Tag Risk Level & Connection Type')}
                            </span>
                            <button
                              type="button"
                              onClick={() => setEditingPartyId(null)}
                              className="text-zinc-500 hover:text-zinc-300 cursor-pointer"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Risk Level Select */}
                          <div className="space-y-1">
                            <label className="text-[11px] font-mono text-zinc-400 block">
                              {t('Vælg Risikoniveau (Risk Level):', 'Select Risk Level:')}
                            </label>
                            <select
                              value={editRiskLevel}
                              onChange={(e) => setEditRiskLevel(e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-indigo-500 outline-none"
                            >
                              <option value="critical">🔴 {t('Kritisk (Critical Risk)', 'Critical Risk')}</option>
                              <option value="high">🟠 {t('Høj (High Risk)', 'High Risk')}</option>
                              <option value="medium">🟡 {t('Middel (Medium Risk)', 'Medium Risk')}</option>
                              <option value="low">🟢 {t('Lav (Low Risk)', 'Low Risk')}</option>
                            </select>
                          </div>

                          {/* Connection Type Select */}
                          <div className="space-y-1">
                            <label className="text-[11px] font-mono text-zinc-400 block">
                              {t('Vælg Forbindelsestype (Connection Type):', 'Select Connection Type:')}
                            </label>
                            <select
                              value={editConnectionType}
                              onChange={(e) => setEditConnectionType(e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-indigo-500 outline-none"
                            >
                              {CONNECTION_TYPES.map((ct) => (
                                <option key={ct} value={ct}>
                                  {ct}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Add Custom Tag */}
                          <div className="space-y-1">
                            <label className="text-[11px] font-mono text-zinc-400 block">
                              {t('Tilføj sagsrelevant tag:', 'Add case tag:')}
                            </label>
                            <input
                              type="text"
                              value={editCustomTag}
                              onChange={(e) => setEditCustomTag(e.target.value)}
                              placeholder={t('f.eks. "FABU Samværskonsulent"', 'e.g. "Key Witness"')}
                              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-indigo-500 outline-none"
                            />
                          </div>

                          {/* Save / Cancel buttons */}
                          <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
                            <button
                              type="button"
                              onClick={() => setEditingPartyId(null)}
                              className="px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-white bg-zinc-800 cursor-pointer"
                            >
                              {t('Annuller', 'Cancel')}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(party.id)}
                              className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all cursor-pointer flex items-center gap-1"
                            >
                              <Check className="w-3.5 h-3.5" />
                              {t('Gem Tags', 'Save Tags')}
                            </button>
                          </div>
                        </motion.div>
                      )}

                      {/* Notes / Summary */}
                      <p className="text-xs text-zinc-300 italic line-clamp-2">
                        {party.notes || t('Ingen specifikke forbehold noteret.', 'No specific notes recorded.')}
                      </p>

                      {/* Tags List */}
                      {Array.isArray(party.tags) && party.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {party.tags.map((tg, ti) => (
                            <span
                              key={ti}
                              className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700"
                            >
                              #{tg}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Sentiment Profile Display */}
                      {party.sentimentProfile && (
                        <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                              <MessageSquare className="w-3 h-3 text-indigo-400" />
                              {t('Følelsesmæssig Tone Context', 'Emotional Tone Context')}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold border flex items-center gap-1 ${toneInfo.bg}`}
                            >
                              <ToneIcon className="w-3 h-3" />
                              {toneInfo.label}
                            </span>
                          </div>

                          {/* Meter Bar */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                              <span>{t('Konfrontation (-100)', 'Confrontational')}</span>
                              <span className="font-bold text-white">
                                Score: {party.sentimentProfile.overallScore > 0 ? `+${party.sentimentProfile.overallScore}` : party.sentimentProfile.overallScore}
                              </span>
                              <span>{t('Kooperativ (+100)', 'Cooperative')}</span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden relative">
                              <div
                                className={`h-full transition-all duration-500 ${
                                  party.sentimentProfile.overallScore < -50
                                    ? 'bg-red-500'
                                    : party.sentimentProfile.overallScore < 0
                                    ? 'bg-amber-500'
                                    : party.sentimentProfile.overallScore < 50
                                    ? 'bg-cyan-500'
                                    : 'bg-emerald-500'
                                }`}
                                style={{
                                  width: `${Math.min(
                                    100,
                                    Math.max(10, (party.sentimentProfile.overallScore + 100) / 2)
                                  )}%`
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Technical & Sagsinvolvering Grid */}
                      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-zinc-800/80 text-xs">
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase font-bold text-zinc-500 block">
                            {t('Tekniske Spor', 'Tech Signals')}
                          </span>
                          <div className="flex items-center gap-1.5 text-zinc-300">
                            <Wifi className="w-3.5 h-3.5 text-indigo-400" />
                            <span>{party.technicalSignals?.ipAddresses?.length ?? 0} IPs</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-zinc-300">
                            <Phone className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{party.technicalSignals?.phoneNumbers?.length ?? 0} tlf</span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] uppercase font-bold text-zinc-500 block">
                            {t('Sagsinvolvering', 'Case Linkage')}
                          </span>
                          <div className="text-zinc-300">
                            <strong className="text-white">{party.documentsLinked ?? 0}</strong> {t('dokumenter', 'docs')}
                          </div>
                          <div className="text-zinc-300">
                            <strong className="text-white">{party.claimsCount ?? 0}</strong> {t('påstande', 'claims')}
                          </div>
                        </div>
                      </div>

                      {/* EXPANDABLE CORRESPONDENCE QUOTES */}
                      {quotes.length > 0 && (
                        <div className="pt-2 border-t border-zinc-800/80">
                          <button
                            type="button"
                            onClick={() => setExpandedPartyId(isExpanded ? null : party.id)}
                            className="w-full flex items-center justify-between text-xs font-bold text-indigo-400 hover:text-indigo-300 py-1 cursor-pointer"
                          >
                            <span className="flex items-center gap-1.5">
                              <FileText className="w-3.5 h-3.5" />
                              {t('Vis Følelsesmæssige Citater', 'View Quotes')} ({quotes.length})
                            </span>
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>

                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-2 space-y-2"
                            >
                              {quotes.map((q) => (
                                <div
                                  key={q.id}
                                  className="p-3 rounded-xl bg-zinc-950 border border-indigo-500/20 text-xs space-y-1.5 shadow-inner"
                                >
                                  <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                                    <span className="font-bold text-indigo-300">{q.docTitle}</span>
                                    <span>{q.date}</span>
                                  </div>
                                  <p className="text-zinc-200 italic font-serif">"{q.snippetText}"</p>
                                </div>
                              ))}
                            </motion.div>
                          )}
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filteredParties.length === 0 && (
            <div className="col-span-full py-12 text-center text-zinc-400 space-y-3">
              <Users className="w-12 h-12 mx-auto text-zinc-600" />
              <p>{t('Ingen aktører matchede dine søge- og filterkriterier.', 'No entities matched your search and filter criteria.')}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
