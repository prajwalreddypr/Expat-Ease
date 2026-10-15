import { useEffect, useState } from 'react';
import type { ChangeEvent, FC } from 'react';
import { TIME_ESTIMATES } from '../../data/checklistResources';
import type { SettlementStep } from '../../types/checklist';
import StepResources from './StepResources';

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

const StepCard: FC<StepCardProps> = ({
  step,
  country,
  uploadingFile,
  onToggleComplete,
  onDocumentUpload,
  onSaveNotes,
  onSkip,
  onUnskip,
}) => {
  const [showUpload, setShowUpload] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [showSkipInput, setShowSkipInput] = useState(false);
  const [skipReason, setSkipReason] = useState('');
  const [docLabel, setDocLabel] = useState('');
  const [notesValue, setNotesValue] = useState(step.notes || '');
  const [notesDirty, setNotesDirty] = useState(false);
  const [notesSaving, setNotesSaving] = useState(false);
  const isUploading = uploadingFile === step.id;

  useEffect(() => {
    setNotesValue(step.notes || '');
    setNotesDirty(false);
  }, [step.notes, step.id]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
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

            {step.is_unlocked && !step.is_skipped && <StepResources stepNumber={step.step_number} country={country} />}

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
                      onClick={() => setShowSkipInput((visible) => !visible)}
                      className="px-4 py-2 rounded-lg font-medium transition-all duration-200 bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 text-sm"
                    >
                      Skip / N/A
                    </button>
                  )}
                </div>

                {showSkipInput && (
                  <div className="mt-3 space-y-2">
                    <input
                      type="text"
                      value={skipReason}
                      onChange={(event) => setSkipReason(event.target.value)}
                      placeholder="Why are you skipping? (e.g. Already have a SIM card)"
                      className="w-full px-3 py-2 text-sm border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                      onKeyDown={(event) => event.key === 'Enter' && handleSkipConfirm()}
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

            {step.is_unlocked && !step.is_skipped && (
              <div className="mb-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">My Notes</p>
                <textarea
                  value={notesValue}
                  onChange={(event) => { setNotesValue(event.target.value); setNotesDirty(true); }}
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

            {step.is_completed && !step.is_skipped && (
              <div className="mt-2 p-4 bg-emerald-50 rounded-xl border border-emerald-100 space-y-3">
                <h4 className="font-medium text-emerald-900">Documents</h4>

                {step.documents.length > 0 && (
                  <div className="space-y-2">
                    {step.documents.map((document) => (
                      <div key={document.id} className="flex items-center justify-between py-1.5 px-3 bg-white rounded-lg border border-emerald-200">
                        <div className="flex items-center space-x-2 min-w-0">
                          <span className="text-emerald-500 text-sm flex-shrink-0">📄</span>
                          <span className="text-sm text-slate-700 truncate">{document.original_filename}</span>
                        </div>
                        <button
                          onClick={() => window.open(document.file_path, '_blank')}
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
                          onChange={(event) => setDocLabel(event.target.value)}
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

export default StepCard;
