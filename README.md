# NetGuard Incident Triage Agent

**AI-Powered Network Security Incident Analysis and Firewall Rule Generation**

## Overview

NetGuard Incident Triage Agent is an AI-powered cybersecurity application that assists Security Operations Center (SOC) analysts and network administrators in analyzing firewall and network security logs. The application uses a Large Language Model (LLM) hosted on Fireworks AI to detect suspicious activity, classify attacks, estimate severity, map findings to the MITRE ATT&CK framework, and generate actionable firewall mitigation commands.

Developed for the **AMD Developer Hackathon – ACT II**, the project demonstrates how AI can accelerate incident response and reduce the time required for manual log analysis.

---

## Problem Statement

Modern organizations generate thousands of security events every day. Manual analysis of firewall and IDS logs is slow, repetitive, and prone to human error, leading to delayed incident response and increased operational costs.

---

## Solution

NetGuard automates the first stage of security incident triage by analyzing network logs with an AI model. It transforms raw security events into structured incident reports, helping analysts quickly understand threats and respond effectively.

---

## Key Features

* AI-powered firewall and IDS log analysis
* Threat detection and attack classification
* Severity and confidence scoring
* MITRE ATT&CK technique mapping
* Firewall rule generation
* Executive incident summaries
* Support for multiple log formats
* Docker-based deployment

---

## Supported Log Sources

* Firewall Logs
* Linux Syslog
* iptables
* UFW
* Snort IDS Alerts
* Suricata Alerts
* AWS VPC Flow Logs
* Generic Network Security Logs

---

## Detectable Threat Types

* Port Scanning
* SSH Brute Force
* Credential Stuffing
* Distributed Denial-of-Service (DDoS)
* Suspicious IP Activity

---

## System Architecture

```text
                    Firewall / IDS Logs
                             │
                             ▼
              NetGuard Incident Triage Agent
                             │
                             ▼
                   Fireworks AI (LLM)
                             │
                             ▼
                Threat Detection & Analysis
                             │
                             ▼
        ┌────────────────────────────────────┐
        │ Threat Classification              │
        │ Severity Assessment                │
        │ Confidence Estimation              │
        │ MITRE ATT&CK Mapping               │
        │ Firewall Rule Generation           │
        │ Executive Summary                  │
        └────────────────────────────────────┘
```

---

## Technology Stack

| Component        | Technology                      |
| ---------------- | ------------------------------- |
| Frontend         | React                           |
| Language         | TypeScript                      |
| Build Tool       | Vite                            |
| Styling          | Tailwind CSS                    |
| AI Provider      | Fireworks AI                    |
| AI Model         | Configurable Fireworks AI Model |
| Containerization | Docker                          |
| Web Server       | Nginx                           |

---

## Project Structure

```text
src/
├── components/
├── lib/
├── types/
├── App.tsx
├── main.tsx
└── index.css

Dockerfile
docker-compose.yml
nginx.conf
.env.example
```

---

## Getting Started

### Prerequisites

* Docker
* Docker Compose
* Fireworks AI API Key

### Clone the Repository

```bash
git clone https://github.com/Abdulrehman-droid/netguard-incident-triage-agent.git

cd netguard-incident-triage-agent
```

### Configure Environment Variables

Create a `.env` file using `.env.example`.

```env
VITE_FIREWORKS_API_KEY=your_fireworks_api_key

VITE_FIREWORKS_MODEL=your_fireworks_model
```

### Run with Docker

```bash
docker compose up --build
```

Open:

```text
http://localhost:8080
```

### Run Locally

```bash
npm install
npm run dev
```

---

## Usage

1. Launch the application.
2. Paste firewall or IDS logs.
3. Click **Analyze**.
4. Review the generated incident report.
5. Copy or export the recommended firewall commands.

---

## Sample Output

The generated incident report includes:

* Threat Name
* Attack Type
* Severity
* Confidence Score
* Attacker IP
* Victim IP
* Supporting Evidence
* MITRE ATT&CK Technique
* Firewall Mitigation Commands
* Executive Summary

---

## Future Enhancements

* Live Syslog ingestion
* Splunk integration
* Wazuh integration
* Threat intelligence enrichment
* Automated firewall rule deployment
* Real-time monitoring
* Multi-agent SOC workflows

---

## Hackathon

This project was developed for the **AMD Developer Hackathon – ACT II** hosted by lablab.ai.

---

