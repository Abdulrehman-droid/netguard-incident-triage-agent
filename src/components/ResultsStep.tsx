import { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Download,
  RefreshCw,
  Shield,
  Server,
  Target,
  FileText,
  Terminal,
  ExternalLink,
  Check,
} from 'lucide-react';
import type { IncidentReport } from '../types';
import type { LogFormat } from '../types';

interface ResultsStepProps {
  report: IncidentReport;
  format: LogFormat;
  logs: string;
  onReset: () => void;
}

function severityConfig(severity: string) {
  const map: Record<string, { color: string; bg: string; icon: typeof AlertTriangle }> = {
    Critical: { color: 'text-severity-critical', bg: 'bg-severity-critical/10', icon: AlertTriangle },
    High: { color: 'text-severity-high', bg: 'bg-severity-high/10', icon: AlertTriangle },
    Medium: { color: 'text-severity-medium', bg: 'bg-severity-medium/10', icon: AlertTriangle },
    Low: { color: 'text-severity-low', bg: 'bg-severity-low/10', icon: CheckCircle2 },
  };
  return map[severity] || map.Low;
}

function confidenceColor(score: number): string {
  if (score >= 80) return 'text-severity-critical';
  if (score >= 60) return 'text-severity-high';
  if (score >= 40) return 'text-severity-medium';
  return 'text-severity-low';
}

function confidenceBg(score: number): string {
  if (score >= 80) return 'bg-severity-critical';
  if (score >= 60) return 'bg-severity-high';
  if (score >= 40) return 'bg-severity-medium';
  return 'bg-severity-low';
}

export default function ResultsStep({ report, format, logs, onReset }: ResultsStepProps) {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  const isThreat = !report.noThreatDetected;
  const sev = severityConfig(report.severity);
  const SevIcon = sev.icon;

  const handleCopy = async (text: string, section: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(section);
      setTimeout(() => setCopiedSection(null), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedSection(section);
      setTimeout(() => setCopiedSection(null), 2000);
    }
  };

  const handleExport = () => {
    const exportData = {
      analyzedAt: new Date().toISOString(),
      logFormat: format,
      report,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `netguard-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setIsResetting(true);
    setTimeout(() => {
      onReset();
    }, 300);
  };

  return (
    <div className="animate-slide-up space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        {isThreat ? (
          <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${sev.bg} mb-2`}>
            <SevIcon className={`w-7 h-7 ${sev.color}`} />
          </div>
        ) : (
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-severity-low/10 mb-2">
            <CheckCircle2 className="w-7 h-7 text-severity-low" />
          </div>
        )}

        <h2 className="text-2xl font-heading font-bold text-foreground">
          {report.threatName}
        </h2>
        <p className="text-secondary text-sm max-w-lg mx-auto">
          {report.executiveSummary}
        </p>
      </div>

      {/* Severity & Confidence Badges */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${sev.bg} ${sev.color} border border-current/20`}>
          <SevIcon className="w-3.5 h-3.5" />
          {report.severity}
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted border border-border text-xs font-semibold text-secondary">
          <Shield className="w-3.5 h-3.5" />
          {report.attackType}
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted border border-border text-xs font-medium text-secondary">
          <Target className="w-3.5 h-3.5" />
          {report.mitreAttackMapping}
        </span>
      </div>

      {/* Confidence Meter */}
      <div className="max-w-xs mx-auto">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-secondary">Confidence</span>
          <span className={`text-xs font-bold ${confidenceColor(report.confidence)}`}>
            {report.confidence}%
          </span>
        </div>
        <div className="h-2 bg-border rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${confidenceBg(report.confidence)}`}
            style={{ width: `${report.confidence}%` }}
          />
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-muted rounded-xl p-4 border border-border">
          <div className="flex items-center gap-2 text-xs font-medium text-secondary mb-2">
            <Server className="w-3.5 h-3.5" />
            Attacker IP
          </div>
          <code className="text-sm font-mono font-semibold text-foreground break-all">
            {report.attackerIP}
          </code>
        </div>
        <div className="bg-muted rounded-xl p-4 border border-border">
          <div className="flex items-center gap-2 text-xs font-medium text-secondary mb-2">
            <Server className="w-3.5 h-3.5" />
            Victim / Target IP
          </div>
          <code className="text-sm font-mono font-semibold text-foreground break-all">
            {report.victimIP}
          </code>
        </div>
      </div>

      {/* Evidence */}
      {report.evidence.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Evidence Log Lines
            </h3>
            <button
              onClick={() => handleCopy(report.evidence.join('\n'), 'evidence')}
              className="inline-flex items-center gap-1 text-xs text-secondary hover:text-foreground transition-colors duration-200 cursor-pointer"
            >
              {copiedSection === 'evidence' ? (
                <Check className="w-3.5 h-3.5 text-severity-low" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              {copiedSection === 'evidence' ? 'Copied' : 'Copy'}
            </button>
          </div>
          <div className="bg-muted rounded-xl border border-border p-3 max-h-[200px] overflow-y-auto">
            <pre className="text-xs font-mono text-foreground leading-relaxed whitespace-pre-wrap">
              {report.evidence.join('\n')}
            </pre>
          </div>
        </div>
      )}

      {/* Firewall Commands */}
      {report.firewallCommands.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Terminal className="w-4 h-4 text-primary" />
              Recommended Blocking Commands
            </h3>
            <button
              onClick={() => handleCopy(report.firewallCommands.join('\n'), 'commands')}
              className="inline-flex items-center gap-1 text-xs text-secondary hover:text-foreground transition-colors duration-200 cursor-pointer"
            >
              {copiedSection === 'commands' ? (
                <Check className="w-3.5 h-3.5 text-severity-low" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              {copiedSection === 'commands' ? 'Copied' : 'Copy'}
            </button>
          </div>
          <div className="bg-foreground/5 rounded-xl border border-border p-3">
            <pre className="text-xs font-mono text-foreground leading-relaxed whitespace-pre-wrap">
              {report.firewallCommands.map((cmd, i) => (
                <span key={i}>
                  <span className="text-primary">$</span> {cmd}{'\n'}
                </span>
              ))}
            </pre>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border bg-muted text-foreground text-sm font-medium hover:bg-border transition-all duration-200 active:scale-[0.97] cursor-pointer"
        >
          <Download className="w-4 h-4" />
          Export Report
        </button>
        <button
          onClick={handleReset}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-on-primary text-sm font-semibold shadow-md shadow-primary/30 hover:shadow-lg hover:shadow-primary/40 transition-all duration-200 ease-out active:scale-[0.97] cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${isResetting ? 'animate-spin' : ''}`} />
          {isResetting ? 'Resetting...' : 'Analyze New Logs'}
        </button>
      </div>
    </div>
  );
}