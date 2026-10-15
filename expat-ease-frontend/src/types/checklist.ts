export interface StepDocumentInfo {
  id: number;
  original_filename: string;
  file_path: string;
}

export interface SettlementStep {
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

export interface ResourceLink {
  label: string;
  url: string;
  description?: string;
}

export interface ResourceProvider {
  label: string;
  url: string;
  note: string;
}

export interface ResourceBank {
  label: string;
  url: string;
  domain: string;
}

export type StepResource =
  | { type: 'links'; title: string; items: ResourceLink[] }
  | { type: 'providers'; title: string; items: ResourceProvider[] }
  | { type: 'banks'; traditional: ResourceBank[]; digital: ResourceBank[] }
  | { type: 'notice'; variant: 'warning' | 'info'; title: string; message: string };
