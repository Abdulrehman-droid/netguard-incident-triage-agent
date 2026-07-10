import { useState, useRef } from 'react';
import { Terminal, Upload, AlertCircle, FileCode } from 'lucide-react';
import type { LogFormat } from '../types';

interface PasteStepProps {
  onAnalyze: (format: LogFormat, logs: string) => void;
  isLoading: boolean;
}

const LOG_FORMATS: LogFormat[] = [
  'Firewall Logs',
  'IDS / IPS Alerts',
  'Syslog Events',
  'Cloud Network Logs',
];

const PLACEHOLDER_EXAMPLES: Record<LogFormat, string> = {
  'Firewall Logs': `# Example — paste your firewall logs here
2026-07-10 08:23:17 DENY TCP 203.0.113.42:44321 → 10.0.1.25:22
2026-07-10 08:23:18 DENY TCP 203.0.113.42:44322 → 10.0.1.25:22
2026-07-10 08:23:19 DENY TCP 203.0.113.42:44323 → 10.0.1.25:22`,
  'IDS / IPS Alerts': `# Example — paste your IDS/IPS alerts here
[IDS] Alert 1042 — Port Scan — 203.0.113.42 → 10.0.1.0/24
[IDS] Alert 1043 — Multiple connections to closed ports`,
  'Syslog Events': `# Example — paste your syslog events here
Jul 10 08:23:17 mailserver sshd[2847]: Failed password for root from 203.0.113.42 port 44321
Jul 10 08:23:18 mailserver sshd[2847]: Failed password for admin from 203.0.113.42 port 44322`,
  'Cloud Network Logs': `# Example — paste your cloud network logs here
src_ip:203.0.113.42 dst_ip:10.0.1.25 src_port:44321 dst_port:22 action:REJECT
src_ip:203.0.113.42 dst_ip:10.0.1.25 src_port:44322 dst_port:22 action:REJECT`,
};

export default function PasteStep({ onAnalyze, isLoading }: PasteStepProps) {
  const [format, setFormat] = useState<LogFormat>('Firewall Logs');
  const [logs, setLogs] = useState('');
  const [showExamples, setShowExamples] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canSubmit = logs.trim().length > 0 && !isLoading;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onAnalyze(format, logs);
  };

  const handlePasteExample = () => {
    setLogs(PLACEHOLDER_EXAMPLES[format]);
    setShowExamples(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setLogs((prev) => prev + (prev ? '\n' : '') + content);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="animate-slide-up space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 mb-2">
          <Terminal className="w-7 h-7 text-primary" />
        </div>
        <h2 className="text-2xl font-heading font-bold text-foreground">Paste Incident Logs</h2>
        <p className="text-secondary text-sm max-w-md mx-auto">
          Select the log format, then paste your logs or upload a file. NetGuard AI will analyze them
          and generate a triage report in seconds.
        </p>
      </div>

      {/* Log Format Selector */}
      <div>
        <label htmlFor="log-format" className="block text-sm font-medium text-foreground mb-2">
          Log Format
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {LOG_FORMATS.map((f) => (
            <button
              key={f}
              onClick={() => {
                setFormat(f);
                setShowExamples(false);
              }}
              className={`
                px-3 py-2.5 text-sm font-medium rounded-lg border transition-all duration-200
                active:scale-[0.98] cursor-pointer
                ${format === f
                  ? 'bg-primary text-on-primary border-primary shadow-sm'
                  : 'bg-muted text-foreground border-border hover:border-primary/40 hover:bg-primary/5'
                }
              `}
              aria-pressed={format === f}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Log Text Area */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="log-content" className="text-sm font-medium text-foreground">
            Log Content
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowExamples(!showExamples)}
              className="text-xs text-primary hover:text-accent font-medium transition-colors duration-200 cursor-pointer"
            >
              {showExamples ? 'Hide example' : 'Paste sample logs'}
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 text-xs text-secondary hover:text-foreground font-medium transition-colors duration-200 cursor-pointer disabled:opacity-50"
              title="Upload a log file (.txt, .log)"
            >
              <Upload className="w-3.5 h-3.5" />
              Upload file
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.log,.csv,.json"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>
        </div>

        <div className="relative">
          <textarea
            ref={textareaRef}
            id="log-content"
            value={logs}
            onChange={(e) => setLogs(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={showExamples ? '' : `Paste your ${format.toLowerCase()} here...`}
            rows={10}
            disabled={isLoading}
            className="
              w-full px-4 py-3.5 rounded-xl border border-border bg-muted text-foreground
              font-mono text-sm leading-relaxed resize-y min-h-[200px]
              placeholder:text-secondary/60
              focus:border-primary focus:ring-2 focus:ring-primary/20
              transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
            "
            spellCheck={false}
          />
          {showExamples && !logs && (
            <div className="absolute inset-0 rounded-xl overflow-hidden">
              <pre className="w-full h-full px-4 py-3.5 font-mono text-sm leading-relaxed text-secondary/40 pointer-events-none whitespace-pre-wrap">
                {PLACEHOLDER_EXAMPLES[format]}
              </pre>
            </div>
          )}
        </div>

        {/* Quick fill button when showing examples */}
        {showExamples && (
          <button
            onClick={handlePasteExample}
            className="mt-2 inline-flex items-center gap-1.5 text-xs text-primary hover:text-accent font-medium transition-colors duration-200 cursor-pointer"
          >
            <FileCode className="w-3.5 h-3.5" />
            Use this example
          </button>
        )}
      </div>

      {/* Submit */}
      <div className="space-y-3">
        {!canSubmit && logs.length === 0 && (
          <div className="flex items-start gap-2 text-xs text-secondary bg-secondary/5 rounded-lg px-3 py-2.5">
            <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <span>Paste at least one log line above, then click Analyze.</span>
          </div>
        )}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={`
            w-full py-3.5 rounded-xl font-semibold text-base
            transition-all duration-200 ease-out
            active:scale-[0.97]
            ${canSubmit
              ? 'bg-primary text-on-primary shadow-md shadow-primary/30 hover:shadow-lg hover:shadow-primary/40 cursor-pointer'
              : 'bg-border text-secondary cursor-not-allowed'
            }
          `}
        >
          {isLoading ? (
            <span className="inline-flex items-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              Analyzing...
            </span>
          ) : (
            <span className="inline-flex items-center gap-2">
              <Terminal className="w-5 h-5" />
              Analyze Logs
            </span>
          )}
        </button>
        <p className="text-center text-xs text-secondary">
          Press <kbd className="px-1.5 py-0.5 bg-border rounded text-foreground text-xs font-mono">⌘</kbd>+<kbd className="px-1.5 py-0.5 bg-border rounded text-foreground text-xs font-mono">Enter</kbd> to submit
        </p>
      </div>
    </div>
  );
}