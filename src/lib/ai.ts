import type { IncidentReport, LogFormat } from '../types';
import { FIREWORKS_API_KEY, DEFAULT_MODEL as CONFIG_DEFAULT_MODEL } from '../config';

const FIREWORKS_API = 'https://api.fireworks.ai/inference/v1/chat/completions';

const STORAGE_KEY = 'netguard_fireworks_key';
const MODEL_KEY = 'netguard_model_name';
const DEFAULT_MODEL = CONFIG_DEFAULT_MODEL;

export function getStoredApiKey(): string {
  // Prefer the hardcoded config key — no user setup needed
  return FIREWORKS_API_KEY || localStorage.getItem(STORAGE_KEY) || '';
}

export function storeApiKey(key: string): void {
  localStorage.setItem(STORAGE_KEY, key);
}

export function clearApiKey(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function getStoredModel(): string {
  const stored = localStorage.getItem(MODEL_KEY);
  return stored || DEFAULT_MODEL;
}

export function storeModel(model: string): void {
  localStorage.setItem(MODEL_KEY, model);
}

export function resetModel(): void {
  localStorage.removeItem(MODEL_KEY);
}

function getApiKey(): string {
  const key = getStoredApiKey();
  if (!key) {
    throw new Error('API key not set. Please add your Fireworks AI key in Settings.');
  }
  return key;
}

function buildSystemPrompt(format: string): string {
  return `You are NetGuard AI, a senior SOC analyst specializing in incident triage. 
Your task is to analyze ${format} and determine if there is malicious activity.

DETECTABLE ATTACK PATTERNS (one of these):
- Port Scan: Rapid connection attempts to multiple ports from a single IP
- SSH Brute Force: Repeated SSH authentication failures from a single IP
- Credential Stuffing: Large volumes of login attempts with credential pairs
- DDoS: Sustained high-volume traffic overwhelming a target
- Suspicious IP Activity: Traffic from known malicious or unusual sources

Return ONLY valid JSON (no markdown fences, no other text) with this structure:
{
  "threatName": "Short threat name (e.g. 'Inbound Port Scan Detected')",
  "severity": "Critical|High|Medium|Low",
  "confidence": 0-100,
  "attackerIP": "Source IP or 'N/A'",
  "victimIP": "Target IP or 'N/A'",
  "attackType": "Port Scan|SSH Brute Force|Credential Stuffing|DDoS|Suspicious IP Activity",
  "evidence": ["exact log lines supporting the finding"],
  "mitreAttackMapping": "MITRE ATT&CK technique ID (e.g. T1046, T1110, T1498)",
  "firewallCommands": [
    "sample firewall CLI command to block",
    "another command if applicable"
  ],
  "executiveSummary": "1-2 sentence summary for a CISO/manager",
  "noThreatDetected": false
}

If no threat is detected, return:
{
  "noThreatDetected": true,
  "executiveSummary": "Brief explanation of why it's benign",
  "severity": "Low",
  "confidence": 0,
  "threatName": "No Threat Detected",
  "attackerIP": "N/A",
  "victimIP": "N/A",
  "attackType": "N/A",
  "evidence": [],
  "mitreAttackMapping": "N/A",
  "firewallCommands": []
}`;
}

/** Test a specific model and return whether it works */
export async function testModel(modelId: string): Promise<{ ok: boolean; status: number; error?: string }> {
  const apiKey = getApiKey();
  try {
    const response = await fetch(FIREWORKS_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelId,
        messages: [
          { role: 'user', content: 'Say "ok" and nothing else.' },
        ],
        temperature: 0.1,
        max_tokens: 10,
      }),
    });
    if (response.ok) return { ok: true, status: response.status };
    const body = await response.text().catch(() => '');
    return { ok: false, status: response.status, error: body.slice(0, 200) };
  } catch (err) {
    return { ok: false, status: 0, error: String(err) };
  }
}

/** List of model IDs to try during diagnostics */
export const DIAGNOSTIC_MODELS = [
  // Only models deployed on this account
  { label: 'Kimi K2P7 Code', id: 'accounts/fireworks/models/kimi-k2p7-code' },
  { label: 'GLM 5P2', id: 'accounts/fireworks/models/glm-5p2' },
];

export async function analyzeLogs(
  logFormat: LogFormat,
  logContent: string,
  modelOverride?: string
): Promise<IncidentReport> {
  const apiKey = getApiKey();
  const model = modelOverride || getStoredModel();

  try {
    const response = await fetch(FIREWORKS_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: buildSystemPrompt(logFormat) },
          { role: 'user', content: `Analyze these ${logFormat}:\n\n${logContent}` },
        ],
        temperature: 0.1,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      throw new Error(
        `Fireworks API error ${response.status}: ${errorBody.slice(0, 300)}`
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No response content from AI model');
    }

    try {
      const parsed: IncidentReport = JSON.parse(content);
      return parsed;
    } catch {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('Failed to parse AI response as JSON');
    }
  } catch (err) {
    throw err instanceof Error ? err : new Error(String(err));
  }
}