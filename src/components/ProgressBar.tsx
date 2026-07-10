import type { WizardStep } from '../types';

interface ProgressBarProps {
  currentStep: WizardStep;
}

const steps: { key: WizardStep; label: string; number: number }[] = [
  { key: 'paste', label: 'Paste Logs', number: 1 },
  { key: 'analyze', label: 'Analyze', number: 2 },
  { key: 'results', label: 'Results', number: 3 },
];

function getStepIndex(step: WizardStep): number {
  return steps.findIndex((s) => s.key === step);
}

export default function ProgressBar({ currentStep }: ProgressBarProps) {
  const currentIndex = getStepIndex(currentStep);

  return (
    <nav aria-label="Analysis progress" className="w-full">
      <ol className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isFuture = index > currentIndex;

          return (
            <li key={step.key} className="flex items-center flex-1 last:flex-none">
              <div className="flex items-center gap-3">
                {/* Step circle */}
                <div
                  className={`
                    flex items-center justify-center w-10 h-10 rounded-full text-sm font-semibold
                    transition-all duration-300 ease-out
                    ${isCompleted ? 'bg-primary text-on-primary shadow-md shadow-primary/20 scale-100' : ''}
                    ${isCurrent ? 'bg-primary text-on-primary ring-4 ring-primary/20 scale-105' : ''}
                    ${isFuture ? 'bg-muted text-secondary border-2 border-border' : ''}
                  `}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  {isCompleted ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step.number
                  )}
                </div>
                {/* Step label */}
                <span
                  className={`
                    hidden sm:inline text-sm font-medium transition-colors duration-200
                    ${isCurrent ? 'text-foreground' : ''}
                    ${isCompleted ? 'text-primary' : ''}
                    ${isFuture ? 'text-secondary' : ''}
                  `}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="flex-1 mx-4 h-0.5 rounded-full transition-colors duration-300 ease-out"
                  style={{
                    backgroundColor: index < currentIndex
                      ? 'oklch(0.546 0.215 262.88)'
                      : 'oklch(0.929 0.018 259.15)',
                  }}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}