import type { FC } from 'react';
import { STEP_RESOURCES } from '../../data/checklistResources';
import type { ResourceBank, ResourceLink, ResourceProvider } from '../../types/checklist';

const NoticeSection: FC<{
  variant: 'warning' | 'info';
  title: string;
  message: string;
}> = ({ variant, title, message }) => {
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

const LinksSection: FC<{ title: string; items: ResourceLink[] }> = ({ title, items }) => (
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

const ProvidersSection: FC<{ title: string; items: ResourceProvider[] }> = ({ title, items }) => (
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

const BankLogo: FC<{ domain: string; label: string }> = ({ domain, label }) => (
  <img
    src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
    alt={`${label} logo`}
    className="w-6 h-6 rounded object-contain"
    onError={(event) => { (event.target as HTMLImageElement).style.display = 'none'; }}
  />
);

const BanksSection: FC<{ traditional: ResourceBank[]; digital: ResourceBank[] }> = ({ traditional, digital }) => (
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

interface StepResourcesProps {
  stepNumber: number;
  country: string;
}

const StepResources: FC<StepResourcesProps> = ({ stepNumber, country }) => {
  const resources = STEP_RESOURCES[country]?.[stepNumber];
  if (!resources) return null;

  return (
    <div className="mb-4 p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-4">
      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Helpful Resources</p>
      {resources.map((resource, index) => {
        if (resource.type === 'notice') return <NoticeSection key={index} variant={resource.variant} title={resource.title} message={resource.message} />;
        if (resource.type === 'links') return <LinksSection key={index} title={resource.title} items={resource.items} />;
        if (resource.type === 'providers') return <ProvidersSection key={index} title={resource.title} items={resource.items} />;
        if (resource.type === 'banks') return <BanksSection key={index} traditional={resource.traditional} digital={resource.digital} />;
        return null;
      })}
    </div>
  );
};

export default StepResources;
