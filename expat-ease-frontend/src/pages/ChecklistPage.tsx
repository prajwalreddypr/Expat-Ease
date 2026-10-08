import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import { getApiUrl } from '../utils/api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface StepDocumentInfo {
  id: number;
  original_filename: string;
  file_path: string;
}

interface SettlementStep {
  id: number;
  user_id: number;
  step_number: number;
  title: string;
  description: string;
  is_completed: boolean;
  is_unlocked: boolean;
  is_skipped: boolean;
  skip_reason?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  documents: StepDocumentInfo[];
}

interface ResourceLink {
  label: string;
  url: string;
  description?: string;
}

interface ResourceProvider {
  label: string;
  url: string;
  note: string;
}

interface ResourceBank {
  label: string;
  url: string;
  domain: string;
}

type StepResource =
  | { type: 'links'; title: string; items: ResourceLink[] }
  | { type: 'providers'; title: string; items: ResourceProvider[] }
  | { type: 'banks'; traditional: ResourceBank[]; digital: ResourceBank[] }
  | { type: 'notice'; variant: 'warning' | 'info'; title: string; message: string };

// ---------------------------------------------------------------------------
// Time estimates per country + step_number
// ---------------------------------------------------------------------------
const TIME_ESTIMATES: Record<string, Record<number, string>> = {
  France: {
    1: '~30 min',
    2: '~30 min',
    3: '~2–4 weeks',
    4: '~1–2 hours',
    5: '~1–2 hours',
    6: '~30 min',
    7: '~30 min',
  },
  Germany: {
    1: '~2–4 weeks',
    2: '~1–2 hours',
    3: '~30 min',
    4: '~1–2 hours',
    5: '~30 min',
    6: 'Auto-sent',
    7: '~2–3 hours',
  },
};

// ---------------------------------------------------------------------------
// Per-step resources keyed by country then step_number
// ---------------------------------------------------------------------------
const STEP_RESOURCES: Record<string, Record<number, StepResource[]>> = {
  France: {
    1: [
      {
        type: 'links',
        title: 'Official Portals',
        items: [
          {
            label: 'ANEF — Validate your long-stay visa',
            url: 'https://administration-etrangers-en-france.interieur.gouv.fr',
            description: 'Official French immigration administration portal',
          },
          {
            label: 'OFII — Register your integration contract',
            url: 'https://www.ofii.fr',
            description: 'Book your medical visit and sign the Republican Integration Contract',
          },
        ],
      },
    ],
    2: [
      {
        type: 'providers',
        title: 'SIM Card Providers',
        items: [
          { label: 'Free Mobile', url: 'https://mobile.free.fr', note: 'Plans from €2/mo' },
          { label: 'Orange', url: 'https://www.orange.fr/portail', note: 'Best nationwide coverage' },
          { label: 'Lebara', url: 'https://mobile.lebara.com/fr/fr', note: 'Great for international calls' },
          { label: 'Syma Mobile', url: 'https://www.symamobile.com', note: 'No-commitment, budget plans' },
          { label: 'Lycamobile', url: 'https://www.lycamobile.fr', note: 'Popular with expats' },
        ],
      },
    ],
    3: [
      {
        type: 'links',
        title: 'Accommodation Platforms',
        items: [
          { label: 'PAP.fr — De Particulier à Particulier', url: 'https://www.pap.fr', description: 'Rent directly from landlords — no agency fees' },
          { label: 'Studapart', url: 'https://studapart.com', description: 'Student & young professional housing' },
          { label: 'Leboncoin — Locations', url: 'https://www.leboncoin.fr/recherche?category=10', description: 'Largest classifieds site in France' },
          { label: 'Appartager — Flatsharing', url: 'https://www.appartager.com', description: 'Colocation & flatshare listings' },
          { label: 'SeLoger', url: 'https://www.seloger.com', description: 'Large rental marketplace with verified listings' },
        ],
      },
    ],
    4: [
      {
        type: 'links',
        title: 'Registration Portals',
        items: [
          { label: 'Ameli.fr — Get your Social Security number', url: 'https://www.ameli.fr', description: 'Apply for your numéro de sécu through the CPAM' },
          { label: 'Service-public.fr — Administrative guide', url: 'https://www.service-public.fr', description: 'Official portal for all administrative procedures in France' },
        ],
      },
    ],
    5: [
      {
        type: 'banks',
        traditional: [
          { label: 'BNP Paribas', url: 'https://mabanque.bnpparibas/', domain: 'bnpparibas.fr' },
          { label: 'Société Générale', url: 'https://particuliers.sg.fr/', domain: 'sg.fr' },
          { label: 'Crédit Agricole', url: 'https://www.credit-agricole.fr/', domain: 'credit-agricole.fr' },
        ],
        digital: [
          { label: 'Revolut', url: 'https://www.revolut.com/', domain: 'revolut.com' },
          { label: 'N26', url: 'https://n26.com/fr-fr', domain: 'n26.com' },
          { label: 'Wise', url: 'https://wise.com/', domain: 'wise.com' },
        ],
      },
    ],
    6: [
      {
        type: 'links',
        title: 'Healthcare Registration',
        items: [
          { label: 'Ameli.fr — Register with Assurance Maladie', url: 'https://www.ameli.fr', description: 'Activate your health coverage and request your Carte Vitale' },
        ],
      },
    ],
    7: [
      {
        type: 'notice',
        variant: 'warning',
        title: 'Deadline for Non-European Students',
        message: 'July 2026 is the last month to receive CAF housing benefit for non-European students. Apply as soon as possible to avoid missing out on this benefit.',
      },
      {
        type: 'links',
        title: 'Housing Benefit',
        items: [
          { label: 'CAF.fr — Apply for APL / ALS housing benefit', url: 'https://www.caf.fr', description: 'Can reduce rent by €100–300/month depending on income & location' },
          { label: 'CAF Eligibility Simulator', url: 'https://wwwd.caf.fr/wps/portal/caffr/simulateuraide', description: 'Check how much benefit you may be entitled to' },
        ],
      },
    ],
  },

  Germany: {
    1: [
      {
        type: 'links',
        title: 'Accommodation Platforms',
        items: [
          { label: 'Immobilienscout24', url: 'https://www.immobilienscout24.de', description: 'Largest property portal in Germany' },
          { label: 'WG-Gesucht — Flatsharing', url: 'https://www.wg-gesucht.de', description: 'Most popular flatshare & room listings' },
          { label: 'Immowelt', url: 'https://www.immowelt.de', description: 'Wide selection of rentals across Germany' },
          { label: 'Wohnungsboerse.net', url: 'https://www.wohnungsboerse.net', description: 'Rental listings across Germany' },
          { label: 'Studenten-WG', url: 'https://www.studenten-wg.de', description: 'Student-focused shared housing' },
        ],
      },
    ],
    2: [
      {
        type: 'links',
        title: 'Anmeldung — Address Registration',
        items: [
          {
            label: 'Berlin Bürgeramt — Book an appointment',
            url: 'https://service.berlin.de/dienstleistung/120686/',
            description: 'Register your address at a local Bürgeramt (required within 14 days of moving in)',
          },
          {
            label: 'Bundesregierung — Anmeldung guide',
            url: 'https://www.bundesregierung.de/breg-de/themen/umzug-anmeldung',
            description: 'Official federal guide for registering your address in Germany',
          },
        ],
      },
    ],
    3: [
      {
        type: 'providers',
        title: 'SIM Card Providers',
        items: [
          { label: 'Deutsche Telekom', url: 'https://www.telekom.de', note: 'Best nationwide coverage' },
          { label: 'Vodafone', url: 'https://www.vodafone.de', note: 'Strong 4G/5G network' },
          { label: 'O2 / Telefónica', url: 'https://www.o2online.de', note: 'Competitive plans' },
          { label: 'Lebara', url: 'https://mobile.lebara.com/de/de', note: 'Great for international calls' },
          { label: 'Aldi Talk', url: 'https://www.alditalk.de', note: 'Budget prepaid on Telekom network' },
        ],
      },
    ],
    4: [
      {
        type: 'banks',
        traditional: [
          { label: 'Deutsche Bank', url: 'https://www.deutsche-bank.de', domain: 'deutsche-bank.de' },
          { label: 'Commerzbank', url: 'https://www.commerzbank.de', domain: 'commerzbank.de' },
          { label: 'Sparkasse', url: 'https://www.sparkasse.de', domain: 'sparkasse.de' },
        ],
        digital: [
          { label: 'N26', url: 'https://n26.com/de-de', domain: 'n26.com' },
          { label: 'DKB', url: 'https://www.dkb.de', domain: 'dkb.de' },
          { label: 'Revolut', url: 'https://www.revolut.com/', domain: 'revolut.com' },
          { label: 'Wise', url: 'https://wise.com/', domain: 'wise.com' },
        ],
      },
    ],
    5: [
      {
        type: 'providers',
        title: 'Public Health Insurance (Krankenkasse)',
        items: [
          { label: 'Techniker Krankenkasse (TK)', url: 'https://www.tk.de', note: 'Most popular — English-friendly' },
          { label: 'AOK', url: 'https://www.aok.de', note: 'Largest public insurer' },
          { label: 'Barmer', url: 'https://www.barmer.de', note: 'Nationwide coverage' },
          { label: 'DAK-Gesundheit', url: 'https://www.dak.de', note: 'Good expat support' },
        ],
      },
    ],
    6: [
      {
        type: 'links',
        title: 'Tax ID & Filing',
        items: [
          {
            label: 'ELSTER — Online tax portal',
            url: 'https://www.elster.de',
            description: 'Register for online tax filing and get your Steuernummer from your local Finanzamt',
          },
          {
            label: 'BZSt — Request your Steueridentifikationsnummer',
            url: 'https://www.bzst.de/DE/Privatpersonen/SteuerlicheIdentifikationsnummer/steuerlicheidentifikationsnummer_node.html',
            description: 'Reissue request if your Steuer-ID was not received by post after Anmeldung',
          },
        ],
      },
    ],
    7: [
      {
        type: 'notice',
        variant: 'warning',
        title: 'Non-EU Nationals Only',
        message: 'Non-EU citizens must apply for a residence permit (Aufenthaltstitel) at the local Ausländerbehörde within 90 days of arrival. Bring your passport, Meldebescheinigung, health insurance certificate, and proof of financial means.',
      },
      {
        type: 'links',
        title: 'Residence Permit Portals',
        items: [
          {
            label: 'Berlin Ausländerbehörde — Book an appointment',
            url: 'https://service.berlin.de/dienstleistung/324659/',
            description: 'Apply for a residence or work permit (Aufenthaltstitel) in Berlin',
          },
          {
            label: 'Make it in Germany — Residence permit guide',
            url: 'https://www.make-it-in-germany.com/en/visa-residence/living-in-germany/residence-permit/',
            description: 'Official guide for skilled workers and immigrants to Germany',
          },
        ],
      },
    ],
  },
};

// ---------------------------------------------------------------------------
// Resource sub-components
// ---------------------------------------------------------------------------
const NoticeSection: React.FC<{ variant: 'warning' | 'info'; title: string; message: string }> = ({ variant, title, message }) => {
  const isWarning = variant === 'warning';
  return (
    <div className={`flex items-start space-x-3 p-3 rounded-xl border ${
      isWarning ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-200'
    }`}>
      <div className="flex-shrink-0 text-lg">{isWarning ? '⚠️' : 'ℹ️'}</div>
      <div>
        <p className={`text-xs font-bold uppercase tracking-wide mb-1 ${isWarning ? 'text-amber-700' : 'text-blue-700'}`}>{title}</p>
        <p className={`text-sm ${isWarning ? 'text-amber-800' : 'text-blue-800'}`}>{message}</p>
      </div>
    </div>
  );
};

const LinksSection: React.FC<{ title: string; items: ResourceLink[] }> = ({ title, items }) => (
  <div>
    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">{title}</p>
    <div className="space-y-2">
      {items.map((item) => (
        <a key={item.url} href={item.url} target="_blank" rel="noopener noreferrer"
          className="flex items-start space-x-3 p-3 bg-white border border-slate-200 rounded-xl hover:border-emerald-300 hover:bg-emerald-50 transition-all duration-200 group">
          <div className="w-5 h-5 mt-0.5 flex-shrink-0 text-emerald-500 group-hover:text-emerald-600">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-700 group-hover:text-emerald-700">{item.label}</p>
            {item.description && <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>}
          </div>
        </a>
      ))}
    </div>
  </div>
);

const ProvidersSection: React.FC<{ title: string; items: ResourceProvider[] }> = ({ title, items }) => (
  <div>
    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">{title}</p>
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <a key={item.url} href={item.url} target="_blank" rel="noopener noreferrer"
          className="inline-flex flex-col items-start px-3 py-2 bg-white border border-slate-200 rounded-xl hover:border-emerald-300 hover:bg-emerald-50 transition-all duration-200 group">
          <span className="text-sm font-semibold text-slate-700 group-hover:text-emerald-700">{item.label}</span>
          <span className="text-xs text-slate-400">{item.note}</span>
        </a>
      ))}
    </div>
  </div>
);

const BankLogo: React.FC<{ domain: string; label: string }> = ({ domain, label }) => (
  <img
    src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
    alt={`${label} logo`}
    className="w-6 h-6 rounded object-contain"
    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
  />
);

const BanksSection: React.FC<{ traditional: ResourceBank[]; digital: ResourceBank[] }> = ({ traditional, digital }) => (
  <div className="space-y-3">
    <div>
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Traditional Banks</p>
      <div className="flex flex-wrap gap-2">
        {traditional.map((bank) => (
          <a key={bank.url} href={bank.url} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 px-3 py-2 bg-white border border-slate-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group">
            <BankLogo domain={bank.domain} label={bank.label} />
            <span className="text-sm font-semibold text-slate-700 group-hover:text-blue-700">{bank.label}</span>
          </a>
        ))}
      </div>
    </div>
    <div>
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Digital Banks</p>
      <div className="flex flex-wrap gap-2">
        {digital.map((bank) => (
          <a key={bank.url} href={bank.url} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 px-3 py-2 bg-white border border-slate-200 rounded-xl hover:border-violet-300 hover:bg-violet-50 transition-all duration-200 group">
            <BankLogo domain={bank.domain} label={bank.label} />
            <span className="text-sm font-semibold text-slate-700 group-hover:text-violet-700">{bank.label}</span>
          </a>
        ))}
      </div>
    </div>
  </div>
);

const StepResources: React.FC<{ stepNumber: number; country: string }> = ({ stepNumber, country }) => {
  const resources = STEP_RESOURCES[country]?.[stepNumber];
  if (!resources) return null;
  return (
    <div className="mb-4 p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-4">
      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Helpful Resources</p>
      {resources.map((resource, idx) => {
        if (resource.type === 'notice') return <NoticeSection key={idx} variant={resource.variant} title={resource.title} message={resource.message} />;
        if (resource.type === 'links') return <LinksSection key={idx} title={resource.title} items={resource.items} />;
        if (resource.type === 'providers') return <ProvidersSection key={idx} title={resource.title} items={resource.items} />;
        if (resource.type === 'banks') return <BanksSection key={idx} traditional={resource.traditional} digital={resource.digital} />;
        return null;
      })}
    </div>
  );
};

// ---------------------------------------------------------------------------
// StepCard
// ---------------------------------------------------------------------------
interface StepCardProps {
  step: SettlementStep;
  country: string;
  uploadingFile: number | null;
  onToggleComplete: (stepId: number, isCompleted: boolean) => void;
  onDocumentUpload: (stepId: number, file: File, label?: string) => void;
  onSaveNotes: (stepId: number, notes: string) => Promise<void>;
  onSkip: (stepId: number, reason: string) => Promise<void>;
  onUnskip: (stepId: number) => Promise<void>;
}

const StepCard: React.FC<StepCardProps> = ({ step, country, uploadingFile, onToggleComplete, onDocumentUpload, onSaveNotes, onSkip, onUnskip }) => {
  const [showUpload, setShowUpload] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [showSkipInput, setShowSkipInput] = useState(false);
  const [skipReason, setSkipReason] = useState('');
  const [docLabel, setDocLabel] = useState('');
  const [notesValue, setNotesValue] = useState(step.notes || '');
  const [notesDirty, setNotesDirty] = useState(false);
  const [notesSaving, setNotesSaving] = useState(false);
  const isUploading = uploadingFile === step.id;

  // Sync notes when the step prop updates (e.g. after save)
  useEffect(() => {
    setNotesValue(step.notes || '');
    setNotesDirty(false);
  }, [step.notes, step.id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setUploadedFile(file);
  };

  const handleUpload = () => {
    if (uploadedFile) {
      onDocumentUpload(step.id, uploadedFile, docLabel.trim() || undefined);
      setShowUpload(false);
      setUploadedFile(null);
      setDocLabel('');
    }
  };

  const handleNotesSave = async () => {
    setNotesSaving(true);
    await onSaveNotes(step.id, notesValue);
    setNotesSaving(false);
    setNotesDirty(false);
  };

  const timeEstimate = TIME_ESTIMATES[country]?.[step.step_number];
  const completedDate = step.is_completed
    ? new Date(step.updated_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : null;

  const handleSkipConfirm = async () => {
    await onSkip(step.id, skipReason.trim());
    setShowSkipInput(false);
    setSkipReason('');
  };

  return (
    <div className={`relative transition-all duration-300 ${!step.is_unlocked ? 'opacity-60' : 'opacity-100'}`}>
      <div className={`card bg-white/90 backdrop-blur-sm border shadow-lg p-6 rounded-2xl ${
        step.is_skipped ? 'border-amber-200 bg-amber-50/60' : 'border-white/30'
      }`}>
        <div className="flex items-start space-x-4">
          {/* Step circle */}
          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 ${
            step.is_skipped
              ? 'bg-amber-400 text-white'
              : step.is_completed
              ? 'bg-green-500 text-white'
              : step.is_unlocked
              ? 'bg-emerald-500 text-white'
              : 'bg-gray-300 text-gray-600'
          }`}>
            {step.is_skipped ? '–' : step.is_completed ? '✓' : step.step_number}
          </div>

          <div className="flex-1 min-w-0">
            {/* Title row with badges */}
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h3 className={`text-xl font-bold ${step.is_skipped ? 'text-slate-500' : 'text-slate-800'}`}>{step.title}</h3>
              {step.is_skipped && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200">
                  N/A
                </span>
              )}
              {timeEstimate && !step.is_skipped && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">
                  🕐 {timeEstimate}
                </span>
              )}
              {completedDate && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-600 border border-green-200">
                  ✓ {completedDate}
                </span>
              )}
            </div>

            {/* Skip reason banner */}
            {step.is_skipped && (
              <div className="mb-3 flex items-center justify-between p-2.5 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-sm text-amber-700">
                  <span className="font-semibold">Skipped:</span>{' '}
                  {step.skip_reason || 'Not applicable'}
                </p>
                <button
                  onClick={() => onUnskip(step.id)}
                  className="ml-3 px-2 py-1 text-xs font-medium text-amber-700 border border-amber-300 rounded-lg hover:bg-amber-100 transition-colors flex-shrink-0"
                >
                  Undo skip
                </button>
              </div>
            )}

            {!step.is_skipped && <p className="text-slate-600 mb-4">{step.description}</p>}

            {/* Helpful Resources */}
            {step.is_unlocked && !step.is_skipped && <StepResources stepNumber={step.step_number} country={country} />}

            {/* Completion + Skip controls */}
            {step.is_unlocked && !step.is_skipped && (
              <div className="mb-4">
                {!step.is_completed && (
                  <p className="text-sm font-medium text-slate-500 mb-3">Mark as completed once done</p>
                )}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => onToggleComplete(step.id, true)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      step.is_completed
                        ? 'bg-green-500 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-700 hover:bg-green-50 hover:text-green-700 hover:border-green-200 border border-gray-200'
                    }`}
                  >
                    ✓ {step.is_completed ? 'Completed' : 'Mark Complete'}
                  </button>
                  {step.is_completed ? (
                    <button
                      onClick={() => onToggleComplete(step.id, false)}
                      className="px-4 py-2 rounded-lg font-medium transition-all duration-200 bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-200 text-sm"
                    >
                      Undo
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowSkipInput(v => !v)}
                      className="px-4 py-2 rounded-lg font-medium transition-all duration-200 bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 text-sm"
                    >
                      Skip / N/A
                    </button>
                  )}
                </div>

                {/* Skip reason input */}
                {showSkipInput && (
                  <div className="mt-3 space-y-2">
                    <input
                      type="text"
                      value={skipReason}
                      onChange={e => setSkipReason(e.target.value)}
                      placeholder="Why are you skipping? (e.g. Already have a SIM card)"
                      className="w-full px-3 py-2 text-sm border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                      onKeyDown={e => e.key === 'Enter' && handleSkipConfirm()}
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSkipConfirm}
                        className="px-3 py-1.5 text-sm font-medium bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                      >
                        Confirm skip
                      </button>
                      <button
                        onClick={() => { setShowSkipInput(false); setSkipReason(''); }}
                        className="px-3 py-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Personal notes */}
            {step.is_unlocked && !step.is_skipped && (
              <div className="mb-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">My Notes</p>
                <textarea
                  value={notesValue}
                  onChange={(e) => { setNotesValue(e.target.value); setNotesDirty(true); }}
                  placeholder="Add personal notes… (e.g. appointment booked for April 3rd, waiting for documents)"
                  rows={2}
                  className="w-full px-3 py-2 text-sm text-slate-700 placeholder-slate-400 border border-slate-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all"
                />
                {notesDirty && (
                  <div className="flex justify-end mt-1.5">
                    <button
                      onClick={handleNotesSave}
                      disabled={notesSaving}
                      className="px-3 py-1 text-xs font-medium bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-60 flex items-center space-x-1"
                    >
                      {notesSaving && <div className="animate-spin rounded-full h-3 w-3 border-2 border-white/40 border-t-white" />}
                      <span>{notesSaving ? 'Saving…' : 'Save notes'}</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Document section */}
            {step.is_completed && !step.is_skipped && (
              <div className="mt-2 p-4 bg-emerald-50 rounded-xl border border-emerald-100 space-y-3">
                <h4 className="font-medium text-emerald-900">Documents</h4>

                {step.documents.length > 0 && (
                  <div className="space-y-2">
                    {step.documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between py-1.5 px-3 bg-white rounded-lg border border-emerald-200">
                        <div className="flex items-center space-x-2 min-w-0">
                          <span className="text-emerald-500 text-sm flex-shrink-0">📄</span>
                          <span className="text-sm text-slate-700 truncate">{doc.original_filename}</span>
                        </div>
                        <button
                          onClick={() => window.open(doc.file_path, '_blank')}
                          className="px-3 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition-colors duration-200 flex-shrink-0 ml-2"
                        >
                          View
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {isUploading ? (
                  <div className="flex items-center space-x-3 py-1">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-emerald-300 border-t-emerald-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-emerald-800">Uploading...</p>
                      <p className="text-xs text-emerald-600">Your document is being uploaded, please wait</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {!showUpload && (
                      <button
                        onClick={() => setShowUpload(true)}
                        className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-emerald-700 border border-emerald-300 rounded-lg hover:bg-emerald-100 transition-colors duration-200"
                      >
                        <span>+</span>
                        <span>{step.documents.length === 0 ? 'Upload a document' : 'Add another document'}</span>
                      </button>
                    )}

                    {showUpload && (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={docLabel}
                          onChange={(e) => setDocLabel(e.target.value)}
                          placeholder="Label (e.g. Passport, Lease Agreement)"
                          className="w-full px-3 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                        />
                        <input
                          type="file"
                          onChange={handleFileChange}
                          className="w-full px-3 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                          aria-label="Upload document file"
                        />
                        {uploadedFile && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600 truncate mr-2">Selected: {uploadedFile.name}</span>
                            <div className="flex space-x-2 flex-shrink-0">
                              <button
                                onClick={handleUpload}
                                className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors duration-200 text-sm"
                              >
                                Upload
                              </button>
                              <button
                                onClick={() => { setShowUpload(false); setUploadedFile(null); setDocLabel(''); }}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200 text-sm"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                        {!uploadedFile && (
                          <button
                            onClick={() => { setShowUpload(false); setDocLabel(''); }}
                            className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lock overlay */}
      {!step.is_unlocked && (
        <div className="absolute inset-0 bg-white/70 rounded-2xl flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-2">🔒</div>
            <p className="text-sm font-medium text-gray-500">Complete previous step to unlock</p>
          </div>
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// FireworksAnimation
// ---------------------------------------------------------------------------
const FireworksAnimation: React.FC = () => {
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#a8e6cf', '#ffd3a5'];
  const fireworks = Array.from({ length: 20 }, (_, i) => {
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size = 8 + Math.random() * 12;
    return (
      <div key={i} className="absolute rounded-full opacity-0" style={{
        left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
        width: `${size}px`, height: `${size}px`,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        animation: `firework ${2 + Math.random() * 3}s ease-out forwards`,
        animationDelay: `${Math.random() * 4}s`,
        filter: 'blur(1px)', boxShadow: `0 0 ${size}px ${color}`,
      }} />
    );
  });
  const sparkles = Array.from({ length: 30 }, (_, i) => (
    <div key={`s-${i}`} className="absolute w-1 h-1 bg-white rounded-full opacity-0" style={{
      left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
      animation: `firework-burst ${1 + Math.random() * 2}s ease-out forwards`,
      animationDelay: `${Math.random() * 5}s`,
    }} />
  ));
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {fireworks}{sparkles}
      <div className="absolute inset-0 opacity-0" style={{
        background: 'radial-gradient(circle at center, rgba(255, 107, 107, 0.1) 0%, transparent 70%)',
        animation: 'celebration-glow 2s ease-in-out infinite, fadeInOut 8s ease-in-out',
      }} />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center opacity-0"
        style={{ animation: 'fadeInOut 8s ease-in-out' }}>
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/30">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-4xl font-bold text-gradient mb-2">Congratulations!</h2>
          <p className="text-xl text-slate-600">You've completed all settlement steps!</p>
          <p className="text-lg text-slate-500 mt-2">Welcome to your new life abroad! 🌟</p>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// ChecklistPage
// ---------------------------------------------------------------------------
const ChecklistPage: React.FC = () => {
  const { user, token, selectedCountry } = useAuth();
  const { addToast } = useToast();

  const country = user?.settlement_country || selectedCountry || 'France';

  const [steps, setSteps] = useState<SettlementStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadingFile, setUploadingFile] = useState<number | null>(null);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showFireworks, setShowFireworks] = useState(false);
  const [hasShownCompletionCelebration, setHasShownCompletionCelebration] = useState(false);
  const [previousCompletionCount, setPreviousCompletionCount] = useState(0);

  useEffect(() => { if (token && user) fetchSteps(); }, [token, user]);

  useEffect(() => {
    const handleScroll = () => setShowScrollToTop(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const completedCount = steps.filter(s => s.is_completed || s.is_skipped).length;
    const total = steps.length;
    if (total > 0 && completedCount === total && !hasShownCompletionCelebration && !isResetting && completedCount > previousCompletionCount) {
      setHasShownCompletionCelebration(true);
      const t = setTimeout(() => { setShowFireworks(true); setTimeout(() => setShowFireworks(false), 8000); }, 500);
      return () => clearTimeout(t);
    }
    setPreviousCompletionCount(completedCount);
  }, [steps, hasShownCompletionCelebration, isResetting, previousCompletionCount]);

  const fetchSteps = async () => {
    try {
      setLoading(true); setError(null);
      const res = await fetch(getApiUrl('/api/v1/settlement-steps/'), { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error(`Failed to fetch settlement steps: ${res.status}`);
      const data: SettlementStep[] = await res.json();
      setSteps(data);
      if (data.filter(s => s.is_completed || s.is_skipped).length === data.length && data.length > 0) setHasShownCompletionCelebration(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const updateStepCompletion = async (stepId: number, isCompleted: boolean) => {
    try {
      const res = await fetch(getApiUrl(`/api/v1/settlement-steps/${stepId}`), {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_completed: isCompleted }),
      });
      if (!res.ok) throw new Error('Failed to update step');
      const updated: SettlementStep = await res.json();
      setSteps(prev => prev.map(s => {
        if (s.id === stepId) return updated;
        if (s.step_number === updated.step_number + 1 && isCompleted) return { ...s, is_unlocked: true };
        return s;
      }));
    } catch {
      addToast({ type: 'error', message: 'Failed to update step. Please try again.' });
    }
  };

  const handleSkip = async (stepId: number, reason: string) => {
    try {
      const res = await fetch(getApiUrl(`/api/v1/settlement-steps/${stepId}`), {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_skipped: true, skip_reason: reason || null }),
      });
      if (!res.ok) throw new Error('Failed to skip step');
      const updated: SettlementStep = await res.json();
      setSteps(prev => prev.map(s => {
        if (s.id === stepId) return updated;
        if (s.step_number === updated.step_number + 1) return { ...s, is_unlocked: true };
        return s;
      }));
      addToast({ type: 'success', message: 'Step marked as not applicable.' });
    } catch {
      addToast({ type: 'error', message: 'Failed to skip step. Please try again.' });
    }
  };

  const handleUnskip = async (stepId: number) => {
    try {
      const res = await fetch(getApiUrl(`/api/v1/settlement-steps/${stepId}`), {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_skipped: false }),
      });
      if (!res.ok) throw new Error('Failed to undo skip');
      const updated: SettlementStep = await res.json();
      setSteps(prev => prev.map(s => s.id === stepId ? updated : s));
      addToast({ type: 'success', message: 'Step restored.' });
    } catch {
      addToast({ type: 'error', message: 'Failed to undo skip. Please try again.' });
    }
  };

  const handleSaveNotes = async (stepId: number, notes: string) => {
    try {
      const res = await fetch(getApiUrl(`/api/v1/settlement-steps/${stepId}`), {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });
      if (!res.ok) throw new Error('Failed to save notes');
      const updated: SettlementStep = await res.json();
      setSteps(prev => prev.map(s => s.id === stepId ? updated : s));
      addToast({ type: 'success', message: 'Notes saved.' });
    } catch {
      addToast({ type: 'error', message: 'Failed to save notes. Please try again.' });
    }
  };

  const handleDocumentUpload = async (stepId: number, file: File, label?: string) => {
    setUploadingFile(stepId);
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (label) formData.append('custom_name', label);
      const res = await fetch(getApiUrl(`/api/v1/documents/upload?settlement_step_id=${stepId}`), {
        method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData,
      });
      if (!res.ok) throw new Error('Upload failed');
      const doc = await res.json();
      setSteps(prev => prev.map(s => s.id === stepId
        ? { ...s, documents: [...s.documents, { id: doc.id, original_filename: doc.original_filename, file_path: doc.file_path }] }
        : s
      ));
      addToast({ type: 'success', message: 'Document uploaded successfully.' });
    } catch {
      addToast({ type: 'error', message: 'Failed to upload document. Please try again.' });
    } finally {
      setUploadingFile(null);
    }
  };

  const handleResetSteps = async () => {
    setShowResetConfirm(false);
    try {
      setIsResetting(true); setError(null);
      const res = await fetch(getApiUrl('/api/v1/settlement-steps/reset'), {
        method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(err.detail || `Reset failed: ${res.status}`);
      }
      setSteps(await res.json());
      setHasShownCompletionCelebration(false);
      setPreviousCompletionCount(0);
      addToast({ type: 'success', message: 'Settlement steps reset. You can start over!' });
    } catch (err) {
      addToast({ type: 'error', message: err instanceof Error ? err.message : 'Failed to reset steps.' });
    } finally {
      setIsResetting(false);
    }
  };

  const completedSteps = steps.filter(s => s.is_completed || s.is_skipped).length;
  const totalSteps = steps.length;
  const progressPercentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your settlement checklist...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button onClick={fetchSteps} className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors duration-200">Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      {showFireworks && <FireworksAnimation />}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <h1 className="text-4xl font-bold text-gradient leading-tight py-2">Settlement Checklist</h1>
            <div className="mt-4 sm:mt-0 flex items-center space-x-2">
              {showResetConfirm ? (
                <>
                  <span className="text-sm text-slate-600">Reset all progress?</span>
                  <button onClick={handleResetSteps} disabled={isResetting}
                    className="px-3 py-1.5 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 disabled:opacity-50">
                    Yes, reset
                  </button>
                  <button onClick={() => setShowResetConfirm(false)}
                    className="px-3 py-1.5 text-sm font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors duration-200">
                    Cancel
                  </button>
                </>
              ) : (
                <button onClick={() => setShowResetConfirm(true)} disabled={isResetting}
                  className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-800 border border-red-300 rounded-lg hover:bg-red-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center">
                  {isResetting ? (
                    <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2" />Resetting...</>
                  ) : (
                    <><svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>Reset All Steps</>
                  )}
                </button>
              )}
            </div>
          </div>
          <p className="text-lg text-slate-600 mb-6">
            Complete these steps in order to settle in {country}. Each completed step unlocks the next one.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-6">
          {steps.map(step => (
            <StepCard key={step.id} step={step} country={country} uploadingFile={uploadingFile}
              onToggleComplete={updateStepCompletion} onDocumentUpload={handleDocumentUpload}
              onSaveNotes={handleSaveNotes} onSkip={handleSkip} onUnskip={handleUnskip} />
          ))}
        </div>

        {/* Completion banner */}
        {completedSteps === totalSteps && totalSteps > 0 && (
          <div className="mt-8 card bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 p-8 rounded-2xl text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-green-900 mb-3">Congratulations!</h2>
            <p className="text-green-700 text-lg">
              You've completed all settlement steps! You're now well-prepared to settle in {country}.
            </p>
            <div className="mt-6">
              <span className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-full font-medium">✓ Settlement Complete</span>
            </div>
          </div>
        )}
      </div>

      {/* Floating progress bar */}
      <div className="fixed top-1/2 right-6 transform -translate-y-1/2 z-50 select-none">
        <div className="card bg-white/95 backdrop-blur-md border border-white/30 shadow-2xl rounded-2xl p-3 sm:p-4 min-w-[250px] sm:min-w-[280px] max-w-[90vw] sm:max-w-none hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-800">Progress</h3>
            <div className="text-right">
              <span className="text-lg font-bold text-emerald-600">{progressPercentage}%</span>
              <p className="text-xs text-slate-500">{completedSteps}/{totalSteps}</p>
            </div>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3 shadow-inner mb-3">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 h-3 rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${progressPercentage}%` } as React.CSSProperties} />
          </div>
          <div className="flex justify-between mb-3">
            {steps.map(step => (
              <div key={step.id} className="text-center flex-1">
                <div className={`w-2 h-2 rounded-full mx-auto mb-1 ${step.is_skipped ? 'bg-amber-400' : step.is_completed ? 'bg-green-500' : step.is_unlocked ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                <span className="text-xs text-slate-400">{step.step_number}</span>
              </div>
            ))}
          </div>
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-600">{completedSteps === totalSteps ? 'Complete!' : `${totalSteps - completedSteps} remaining`}</span>
            <span className={`px-2 py-1 rounded-full font-medium ${completedSteps === totalSteps ? 'bg-green-100 text-green-700' : 'bg-emerald-100 text-emerald-700'}`}>
              {completedSteps === totalSteps ? '🎉 Done' : '📋 In Progress'}
            </span>
          </div>
        </div>
      </div>

      {/* Scroll to top */}
      {showScrollToTop && (
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 z-50 flex items-center justify-center"
          aria-label="Scroll to top">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default ChecklistPage;
