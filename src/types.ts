export type AttackType =
  | 'Port Scan'
  | 'SSH Brute Force'
  | 'Credential Stuffing'
  | 'DDoS'
  | 'Suspicious IP Activity';

export type Severity = 'Critical' | 'High' | 'Medium' | 'Low';

export type LogFormat =
  | 'Firewall Logs'
  | 'IDS / IPS Alerts'
  | 'Syslog Events'
  | 'Cloud Network Logs';

export interface IncidentReport {
  threatName: string;
  severity: Severity;
  confidence: number; // 0–100
  attackerIP: string;
  victimIP: string;
  attackType: AttackType;
  evidence: string[];
  mitreAttackMapping: string;
  firewallCommands: string[];
  executiveSummary: string;
  noThreatDetected?: boolean;
}

export type WizardStep = 'paste' | 'analyze' | 'results';