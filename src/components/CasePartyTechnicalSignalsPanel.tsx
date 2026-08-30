import { Smartphone, Mail, Phone, Globe, Activity } from 'lucide-react';
import { Party } from '../types';
import { Card, CardContent, CardHeader, CardTitle, Badge } from './ui/UIPrimitives';
import { useLanguage } from '../contexts/LanguageContext';

interface CasePartyTechnicalSignalsPanelProps {
  party: Party;
}

export function CasePartyTechnicalSignalsPanel({ party }: CasePartyTechnicalSignalsPanelProps) {
  const { language, t } = useLanguage();
  
  if (!party) {
    return (
      <Card className="border-slate-800">
        <CardContent className="p-6 text-center text-xs text-slate-400">
          {t('Ingen part valgt.', 'No party selected.')}
        </CardContent>
      </Card>
    );
  }

  const technicalSignals = party.technicalSignals || {
    deviceCount: 1,
    emailAccounts: party.contactEmail ? 1 : 0,
    phoneNumbers: party.contactPhone ? [party.contactPhone] : [],
    ipAddresses: [],
    lastActivity: party.lastActive ? `${party.lastActive} CET` : (language === 'da' ? 'Ingen aktivitet registreret' : 'No recorded activity')
  };

  const phoneNumbers = Array.isArray(technicalSignals.phoneNumbers) ? technicalSignals.phoneNumbers : [];
  const ipAddresses = Array.isArray(technicalSignals.ipAddresses) ? technicalSignals.ipAddresses : [];
  const deviceCount = technicalSignals.deviceCount ?? 0;
  const emailAccounts = technicalSignals.emailAccounts ?? 0;
  const lastActivity = technicalSignals.lastActivity || (party.lastActive ? `${party.lastActive} CET` : (language === 'da' ? 'Ingen nylige data' : 'No recent activity'));

  return (
    <Card className="border-slate-800">
      <CardHeader>
        <CardTitle className="text-base flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            {t('Tekniske Signaler & Digitalt Fodaftryk', 'Technical Signals & Digital Footprint')}
          </span>
          <Badge variant={party.riskLevel === 'critical' ? 'critical' : party.riskLevel === 'high' ? 'high' : 'medium'}>
            {t('Risiko:', 'Risk:')} {party.riskLevel}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-xs">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center gap-1.5 text-slate-400 mb-1">
              <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
              {t('Enheder', 'Devices')}
            </div>
            <div className="text-lg font-bold text-white">{deviceCount} {t('Tilknyttet', 'Linked')}</div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center gap-1.5 text-slate-400 mb-1">
              <Mail className="w-3.5 h-3.5 text-indigo-400" />
              {t('E-mails', 'Emails')}
            </div>
            <div className="text-lg font-bold text-white">{emailAccounts} {t('Konti', 'Accounts')}</div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center gap-1.5 text-slate-400 mb-1">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              {t('Påstande', 'Claims')}
            </div>
            <div className="text-lg font-bold text-white">{party.claimsCount ?? 0} {t('Registreret', 'Registered')}</div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center gap-1.5 text-slate-400 mb-1">
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              {t('Dokumenter', 'Filings')}
            </div>
            <div className="text-lg font-bold text-white">{party.documentsLinked ?? 0} {t('Omtaler', 'Mentions')}</div>
          </div>
        </div>

        {/* Phone Numbers */}
        <div className="space-y-2 pt-2">
          <div className="text-slate-400 font-medium flex items-center gap-1">
            <Phone className="w-3.5 h-3.5 text-indigo-400" /> {t('Kendte Telefonnumre:', 'Known Phone Identifiers:')}
          </div>
          {phoneNumbers.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {phoneNumbers.map((phone, idx) => (
                <span key={idx} className="font-mono px-2.5 py-1 rounded bg-slate-800 text-slate-200 border border-slate-700">
                  {phone}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 italic text-[11px]">
              {t('Ingen specifikke telefonnumre registreret i sagskartoteket.', 'No specific telephone numbers indexed in case files.')}
            </p>
          )}
        </div>

        {/* IP Addresses */}
        <div className="space-y-2 pt-2">
          <div className="text-slate-400 font-medium flex items-center gap-1">
            <Globe className="w-3.5 h-3.5 text-cyan-400" /> {t('Registrerede IP-adresser & Geotags:', 'Captured IP Address Geotags:')}
          </div>
          {ipAddresses.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {ipAddresses.map((ip, idx) => (
                <span key={idx} className="font-mono px-2.5 py-1 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                  {ip}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 italic text-[11px]">
              {t('Ingen IP-adresser eller digitale netværksspor indfanget endnu.', 'No IP addresses or digital network traces captured yet.')}
            </p>
          )}
        </div>

        <div className="pt-2 text-slate-400 border-t border-slate-800 flex items-center justify-between text-[11px]">
          <span>{t('Seneste Signalregistrering:', 'Last Signal Heartbeat:')}</span>
          <span className="text-slate-200 font-mono">{lastActivity}</span>
        </div>
      </CardContent>
    </Card>
  );
}
