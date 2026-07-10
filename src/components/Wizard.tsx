import { useState } from 'react';
import ProgressBar from './ProgressBar';
import PasteStep from './PasteStep';
import AnalyzeStep from './AnalyzeStep';
import ResultsStep from './ResultsStep';
import { analyzeLogs, getStoredModel } from '../lib/ai';
import type { IncidentReport, WizardStep, LogFormat } from '../types';

export default function Wizard() {
  const [currentStep, setCurrentStep] = useState<WizardStep>('paste');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<IncidentReport | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<LogFormat>('Firewall Logs');
  const [submittedLogs, setSubmittedLogs] = useState('');

  const activeModel = getStoredModel();

  const handleAnalyze = async (format: LogFormat, logs: string) => {
    setIsLoading(true);
    setError(null);
    setSelectedFormat(format);
    setSubmittedLogs(logs);
    setCurrentStep('analyze');

    try {
      const result = await analyzeLogs(format, logs, activeModel);
      setReport(result);
      setCurrentStep('results');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(message);
      setCurrentStep('paste');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setCurrentStep('paste');
    setReport(null);
    setError(null);
    setSubmittedLogs('');
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      {/* Progress bar */}
      <ProgressBar currentStep={currentStep} />

      {/* Step content */}
      <div className="bg-muted rounded-2xl border border-border shadow-sm p-6 sm:p-8">
        {/* Error banner */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-sm text-destructive">
            <p className="font-semibold mb-1">Analysis failed</p>
            <p className="opacity-90">{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-2 text-xs underline hover:no-underline opacity-80 hover:opacity-100 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {currentStep === 'paste' && (
          <PasteStep onAnalyze={handleAnalyze} isLoading={isLoading} />
        )}

        {currentStep === 'analyze' && (
          <AnalyzeStep />
        )}

        {currentStep === 'results' && report && (
          <ResultsStep
            report={report}
            format={selectedFormat}
            logs={submittedLogs}
            onReset={handleReset}
          />
        )}
      </div>

      {/* Footer */}
      <p className="text-center text-xs text-secondary">
        Powered by{' '}
        <span className="font-mono font-medium text-foreground">
          {activeModel.includes('kimi-k2p7') ? 'Kimi K2P7 Code' :
               activeModel.includes('glm-5p2') ? 'GLM 5P2' :
               activeModel.includes('deepseek-v4') ? 'DeepSeek V4 Pro' :
               activeModel.split('/').pop()?.replace(/-/g, ' ') || activeModel}
        </span>{' '}
        on{' '}
        <span className="font-medium text-primary">Fireworks AI</span>
      </p>
    </div>
  );
}