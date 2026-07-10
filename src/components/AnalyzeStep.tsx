import { useEffect, useState } from 'react';
import { Shield, Search, Brain, Activity } from 'lucide-react';

const STATUS_MESSAGES = [
  { icon: Search, text: 'Parsing log entries...' },
  { icon: Brain, text: 'Analyzing patterns against known threats...' },
  { icon: Activity, text: 'Correlating indicators of compromise...' },
  { icon: Shield, text: 'Generating mitigation recommendations...' },
];

interface AnalyzeStepProps {
  onTimeout?: () => void;
}

export default function AnalyzeStep({ onTimeout }: AnalyzeStepProps) {
  const [currentMessage, setCurrentMessage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage((prev) => {
        const next = prev + 1;
        if (next >= STATUS_MESSAGES.length) {
          return STATUS_MESSAGES.length - 1; // stay on last message
        }
        return next;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="animate-fade-in flex flex-col items-center justify-center py-12 space-y-8">
      {/* Animated shield */}
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" style={{ animationDuration: '2s' }} />
        <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-primary shadow-lg shadow-primary/30">
          <Shield className="w-10 h-10 text-on-primary" />
        </div>
      </div>

      {/* Status messages */}
      <div className="space-y-4 text-center">
        <h3 className="text-xl font-heading font-bold text-foreground">Analyzing Logs</h3>

        <div className="space-y-3 min-h-[120px]">
          {STATUS_MESSAGES.map((msg, index) => {
            const Icon = msg.icon;
            const isActive = index === currentMessage;
            const isPast = index < currentMessage;

            return (
              <div
                key={index}
                className={`
                  flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-500 ease-out
                  ${isActive ? 'opacity-100 translate-x-0' : ''}
                  ${isPast ? 'opacity-40 -translate-x-2' : ''}
                  ${!isActive && !isPast ? 'opacity-0 translate-x-4' : ''}
                `}
                style={{ display: isActive || isPast ? 'flex' : 'none' }}
              >
                <Icon
                  className={`
                    w-4 h-4 shrink-0 transition-colors duration-300
                    ${isActive ? 'text-primary' : 'text-secondary'}
                  `}
                />
                <span
                  className={`text-sm font-medium transition-colors duration-300 ${
                    isActive ? 'text-foreground' : 'text-secondary'
                  }`}
                >
                  {msg.text}
                </span>
                {isActive && (
                  <span className="flex gap-1 ml-auto">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-dot" style={{ animationDelay: '0s' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-dot" style={{ animationDelay: '0.2s' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-dot" style={{ animationDelay: '0.4s' }} />
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Spinner bar at bottom */}
      <div className="w-full max-w-xs mx-auto">
        <div className="h-1 bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
            style={{
              width: `${((currentMessage + 1) / STATUS_MESSAGES.length) * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}