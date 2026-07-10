import { useState } from 'react';
import Wizard from './components/Wizard';
import {
  getStoredModel, storeModel, testModel, DIAGNOSTIC_MODELS,
} from './lib/ai';

interface DiagResult {
  label: string;
  ok: boolean;
  status: number;
  error?: string;
}

const PRESET_MODELS = [
  { label: 'Kimi K2P7 Code', id: 'accounts/fireworks/models/kimi-k2p7-code' },
  { label: 'GLM 5P2', id: 'accounts/fireworks/models/glm-5p2' },
  { label: 'DeepSeek V4 Pro', id: 'accounts/fireworks/models/deepseek-v4-pro' },
];

function modelLabel(modelId: string) {
  if (modelId.includes('kimi-k2p7')) return 'Kimi K2P7';
  if (modelId.includes('glm-5p2')) return 'GLM 5P2';
  if (modelId.includes('deepseek-v4')) return 'DeepSeek V4';
  return modelId.split('/').pop()?.slice(0, 18) || 'Model';
}

export default function App() {
  const [showSettings, setShowSettings] = useState(false);
  const [activeModel, setActiveModel] = useState(getStoredModel());
  const [diagResults, setDiagResults] = useState<DiagResult[] | null>(null);
  const [diagRunning, setDiagRunning] = useState(false);

  function handleModelSelect(modelId: string) {
    setActiveModel(modelId);
    storeModel(modelId);
  }

  async function runDiagnostics() {
    setDiagRunning(true);
    setDiagResults(null);
    const results: DiagResult[] = [];
    for (const m of DIAGNOSTIC_MODELS) {
      const r = await testModel(m.id);
      results.push({ label: m.label, ...r });
    }
    setDiagResults(results);
    setDiagRunning(false);
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-muted/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary shadow-sm shadow-primary/20">
              <svg className="w-5 h-5 text-on-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-heading font-bold text-foreground leading-tight">NetGuard</h1>
              <p className="text-xs text-secondary leading-tight">Incident Triage Agent</p>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* Active model chip */}
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-muted border border-border text-xs text-secondary font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              {modelLabel(activeModel)}
            </span>

            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 hover:scale-[0.97] active:scale-[0.95]
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40
                ${showSettings
                  ? 'bg-primary/15 text-primary'
                  : 'bg-muted border border-border text-secondary hover:text-foreground hover:border-foreground/30'}`}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
              </svg>
              Model
            </button>
          </div>
        </div>

        {/* Settings panel (Model selector only) */}
        {showSettings && (
          <div className="border-t border-border bg-muted/40 backdrop-blur-sm">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
              {/* Model selection row */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <label className="text-xs font-medium text-secondary whitespace-nowrap">
                  AI Model
                </label>
                <div className="flex flex-wrap gap-1.5 flex-1">
                  {PRESET_MODELS.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => handleModelSelect(m.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-150 hover:scale-[0.97] active:scale-[0.95]
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40
                        ${activeModel === m.id
                          ? 'bg-primary text-on-primary'
                          : 'bg-surface border border-border text-secondary hover:text-foreground hover:border-foreground/30'}`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Diagnostics */}
              <div className="border-t border-border mt-4 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-secondary">Model Diagnostics</span>
                  <button
                    onClick={runDiagnostics}
                    disabled={diagRunning}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-warning/15 text-warning border border-warning/30
                      hover:brightness-110 transition-all duration-150 disabled:opacity-40
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warning/40"
                  >
                    {diagRunning ? 'Testing...' : 'Run Diagnostics'}
                  </button>
                </div>
                {diagResults && (
                  <div className="bg-surface rounded-lg border border-border overflow-hidden text-xs">
                    {diagResults.map((r) => (
                      <div key={r.label} className="flex items-center gap-2 px-3 py-2 border-b border-border last:border-0">
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${r.ok ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className="font-medium text-foreground">{r.label}</span>
                        <span className="text-secondary ml-auto">
                          {r.ok ? `✅ OK (${r.status})` : `❌ ${r.status}${r.error ? ` — ${r.error}` : ''}`}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                {diagResults && !diagResults.some((r) => r.ok) && (
                  <p className="text-xs text-red-400 mt-2">
                    No models responded successfully. Please check your Fireworks API key or try switching models.
                  </p>
                )}
                {diagResults && diagResults.filter((r) => r.ok).length >= 1 && (
                  <p className="text-xs text-green-500 mt-2">
                    {diagResults.filter((r) => r.ok).length} of {diagResults.length} models available with your key.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="flex-1 px-4 sm:px-6 py-8 sm:py-12">
        <Wizard />
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-4">
        <p className="text-center text-xs text-secondary">
          NetGuard Incident Triage Agent &mdash; Cybersecurity Hackathon Project
        </p>
      </footer>
    </div>
  );
}