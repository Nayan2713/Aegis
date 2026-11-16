// Demo dataset and static catalogs for Aegis.
// Everything here mirrors the original HTML/JS prototype so behaviour is identical.

export const STORAGE_KEY = "AEGIS_COMPLIANCE_STATE_V2";

export const CURRENT_USER = { name: "Sathinath", initials: "SP", role: "Admin" };

export function getDefaultDemoData() {
  return {
    tenant: { name: "Bluebix Healthcare", status: "HRMS pilot active" },
    workers: [
      { id: "W-101", name: "Sarah Jenkins, RN", role: "ICU Charge Nurse", facility: "St. Jude Medical Center", dept: "Clinical", onboard: "Pass", hc: "Action Req", imm: "Pass", tax: "Pass", overall: "Pending Action" },
      { id: "W-102", name: "David Kim, RN", role: "ER Travel Nurse", facility: "Kaiser Permanente", dept: "Clinical", onboard: "Pass", hc: "Pass", imm: "Pass", tax: "Pass", overall: "Verified 100%" },
      { id: "W-103", name: "Marcus Chen", role: "Senior Software Engineer", facility: "HQ Tech Hub", dept: "Engineering", onboard: "Pass", hc: "N/A", imm: "Pass", tax: "Pass", overall: "Verified 100%" },
      { id: "W-104", name: "Elena Rostova, NP", role: "Nurse Practitioner", facility: "UCSF Health", dept: "Clinical", onboard: "Pass", hc: "Action Req", imm: "Pass", tax: "Pass", overall: "Pending Action" },
      { id: "W-105", name: "James Wilson", role: "HR Operations Lead", facility: "HQ Operations", dept: "HR", onboard: "Pass", hc: "N/A", imm: "Pass", tax: "Pass", overall: "Verified 100%" },
      { id: "W-106", name: "Maria Rodriguez, MD", role: "Attending Pediatrician", facility: "Stanford Children's", dept: "Clinical", onboard: "Pass", hc: "Pass", imm: "Pass", tax: "Pass", overall: "Verified 100%" },
      { id: "W-107", name: "Alex Patel", role: "Data Analyst (STEM OPT)", facility: "Remote HQ", dept: "Analytics", onboard: "Pass", hc: "N/A", imm: "Action Req", tax: "Pass", overall: "Pending Action" },
      { id: "W-108", name: "Chloe Dubois", role: "Staff Physical Therapist", facility: "Sutter Health", dept: "Clinical", onboard: "Action Req", hc: "Pass", imm: "Pass", tax: "Pass", overall: "Pending Action" },
    ],
    cases: [
      { id: "CASE-8901", worker: "Sarah Jenkins, RN", pack: "Healthcare", obligation: "CA RN License Renewal", gap: "License #RN-672910 expires in 18 days", stage: "Auto-chasing (Slack reminder 2 sent)", owner: "Healthcare Compliance", due: "Oct 27, 2026", priority: "High" },
      { id: "CASE-8902", worker: "Elena Rostova, NP", pack: "Healthcare", obligation: "AHA ACLS Provider Renewal", gap: "ACLS certification expired Oct 4", stage: "Escalated to Clinical Director", owner: "Healthcare Compliance", due: "Oct 04, 2026", priority: "High" },
      { id: "CASE-8903", worker: "Alex Patel", pack: "Immigration", obligation: "Form I-9 STEM OPT Reverification", gap: "F-1 STEM extension verification document required", stage: "Awaiting upload (Slack DM sent)", owner: "Immigration Specialist", due: "Nov 15, 2026", priority: "Medium" },
      { id: "CASE-8904", worker: "Chloe Dubois", pack: "Onboarding", obligation: "Employee Handbook & Security Policy", gap: "Signed policy acknowledgment pending (day 5 of hire)", stage: "Auto-chasing (Slack reminder 1 sent)", owner: "HR Operations", due: "Oct 16, 2026", priority: "Low" },
    ],
    evidence: [
      { id: "EV-501", doc: "California RN License Card", worker: "David Kim, RN", confidence: "99.8%", status: "Verified & Matched", rule: "CTRL-HC-RN-LIC", docNo: "RN-992140", expiry: "2028-11-30" },
      { id: "EV-502", doc: "AHA BLS Provider eCard", worker: "Maria Rodriguez, MD", confidence: "99.4%", status: "Verified & Matched", rule: "CTRL-HC-BLS", docNo: "AHA-2255018", expiry: "2027-08-15" },
      { id: "EV-503", doc: "US Passport & I-9 Verification", worker: "Marcus Chen", confidence: "100%", status: "Verified & Matched", rule: "CTRL-IMM-I9", docNo: "USA-9831002", expiry: "2031-05-20" },
      { id: "EV-504", doc: "Form W-4 Withholding Certificate", worker: "James Wilson", confidence: "99.1%", status: "Verified & Matched", rule: "CTRL-TAX-W4", docNo: "W4-2026-HR", expiry: "Active" },
      { id: "EV-505", doc: "Quantiferon TB Gold Negative Lab", worker: "Sarah Jenkins, RN", confidence: "98.7%", status: "Verified & Matched", rule: "CTRL-HC-TB", docNo: "LAB-88219", expiry: "2027-04-10" },
    ],
    auditLogs: [
      { time: "2026-10-09 17:45:10", type: "AUTO_REMINDER", subject: "Sarah Jenkins, RN", action: "Dispatched automated Slack reminder for CA RN License renewal (18 days remaining).", actor: "Aegis Orchestrator", proof: "SHA256: 7f8a3c9b..." },
      { time: "2026-10-09 16:30:22", type: "EVIDENCE_VERIFIED", subject: "David Kim, RN", action: "AI OCR verified CA RN License #RN-992140. Control CTRL-HC-RN-LIC marked PASS.", actor: "Aegis AI Vision", proof: "SHA256: 3b1c90e4..." },
      { time: "2026-10-09 14:15:00", type: "HRMS_SYNC", subject: "Workday Connector", action: "Scheduled API sync completed. 8 active worker records evaluated.", actor: "Workday API", proof: "SHA256: 91d2b841..." },
      { time: "2026-10-09 11:20:45", type: "CASE_ESCALATED", subject: "Elena Rostova, NP", action: "ACLS cert expired. Escalation notice sent to Clinical Director.", actor: "Aegis Orchestrator", proof: "SHA256: 44a1fe29..." },
      { time: "2026-10-09 09:00:15", type: "DAILY_EVALUATION", subject: "System-wide", action: "Daily compliance matrix evaluation completed across 4 packs.", actor: "Policy Engine", proof: "SHA256: 88f211cd..." },
      { time: "2026-10-09 08:30:00", type: "ROSTER_INGEST", subject: "Workday API", action: "Ingested Chloe Dubois into Staff Physical Therapy roster.", actor: "System", proof: "SHA256: e2a94188..." },
    ],
    customControls: [
      { id: "CTRL-HC-RN-LIC", pack: "Healthcare", name: "State RN License Active Verification", condition: "Valid active license on file & not expired", cadence: "Daily eval / 30d renew request", status: "Active" },
      { id: "CTRL-HC-BLS", pack: "Healthcare", name: "AHA BLS Provider Card", condition: "Official AHA eCard verified", cadence: "30d before expiration", status: "Active" },
      { id: "CTRL-ONB-HANDBOOK", pack: "Onboarding", name: "Handbook & Security Ack", condition: "Signed acknowledgment within 7d of hire", cadence: "3 Slack reminders, then HR escalation", status: "Active" },
      { id: "CTRL-IMM-STEM-OPT", pack: "Immigration", name: "F-1 STEM OPT Reverification", condition: "Form I-983 and EAD extension on file", cadence: "60d before EAD expiry", status: "Active" },
    ],
    chatHistory: [
      {
        sender: "bot",
        author: "Aegis Coworker",
        text:
          "Hello! I am your **AI Compliance Coworker**.\n\nI am currently tracking **8 active workers** across 4 compliance packs.\n• **2 high-priority gaps:** Sarah Jenkins (RN License expiring in 18d) & Elena Rostova (ACLS expired).\n• **1 immigration review:** Alex Patel (STEM OPT reverification).\n\nAsk me anything or use the prompts above to auto-chase missing documents.",
      },
    ],
  };
}

// Batch returned by the simulated HRMS sync / roster import
export const HRMS_SYNC_BATCH = {
  workers: [
    { id: "W-101", name: "Sarah Jenkins, RN", role: "ICU Charge Nurse", facility: "St. Jude Medical Center", dept: "Clinical", onboard: "Pass", hc: "Action Req", imm: "Pass", tax: "Pass", overall: "Pending Action" },
    { id: "W-102", name: "David Kim, RN", role: "ER Travel Nurse", facility: "Kaiser Permanente", dept: "Clinical", onboard: "Pass", hc: "Pass", imm: "Pass", tax: "Pass", overall: "Verified 100%" },
    { id: "W-103", name: "Marcus Chen", role: "Software Engineer", facility: "HQ Tech Hub", dept: "Tech", onboard: "Pass", hc: "N/A", imm: "Pass", tax: "Pass", overall: "Verified 100%" },
    { id: "W-104", name: "Elena Rostova, NP", role: "Nurse Practitioner", facility: "UCSF Health", dept: "Clinical", onboard: "Pass", hc: "Action Req", imm: "Pass", tax: "Pass", overall: "Pending Action" },
    { id: "W-105", name: "James Wilson", role: "HR Specialist", facility: "HQ Operations", dept: "HR", onboard: "Pass", hc: "N/A", imm: "Pass", tax: "Pass", overall: "Verified 100%" },
  ],
  cases: [
    { id: "CASE-8901", worker: "Sarah Jenkins, RN", pack: "Healthcare", obligation: "CA RN License Renewal", gap: "License #RN-672910 expires in 18 days", stage: "Auto-chasing (Slack reminder 2 sent)", owner: "Healthcare Compliance", due: "Oct 25, 2026", priority: "High" },
    { id: "CASE-8902", worker: "Elena Rostova, NP", pack: "Healthcare", obligation: "AHA ACLS Provider Renewal", gap: "ACLS certification expired Oct 4", stage: "Escalated to Ops Lead", owner: "Healthcare Compliance", due: "Oct 04, 2026", priority: "High" },
  ],
};

// Compliance packs (versioned skills)
export const PACKS = [
  {
    num: 1, key: "Healthcare", name: "Healthcare Workforce", icon: "stethoscope", ver: "v2.1.0",
    owner: "Healthcare Compliance", ownerLead: "Healthcare Compliance Lead", verified: 89, checksPerWorker: 4,
    short: "Active RN/NP/PA state licenses, AHA BLS/ACLS, TB screening",
    desc: "Monitors clinical credentials, nursing licenses, BLS/ACLS provider cards, and hospital credentialing requirements.",
    rules: ["CTRL-HC-RN-LIC — Active state license", "CTRL-HC-BLS — AHA eCard verified", "CTRL-HC-TB — Annual Quantiferon test", "CTRL-HC-BG — State background check"],
  },
  {
    num: 2, key: "Onboarding", name: "Employee Onboarding", icon: "users", ver: "v1.4.2",
    owner: "HR Operations", ownerLead: "HR Operations Lead", verified: 94, checksPerWorker: 3,
    short: "Signed offer letters, handbook acknowledgments, emergency contacts",
    desc: "Tracks company-wide onboarding obligations, employee handbook sign-offs, security training, and emergency contacts.",
    rules: ["CTRL-ONB-HANDBOOK — Signed within 7 days", "CTRL-ONB-SEC — Cybersecurity training", "CTRL-ONB-EMERG — Emergency contacts on file"],
  },
  {
    num: 3, key: "Immigration", name: "Immigration & Work Auth", icon: "passport", ver: "v0.8", pilot: true,
    owner: "Immigration Specialist", ownerLead: "Immigration Specialist", verified: 92, checksPerWorker: 2,
    short: "I-9 reverifications, OPT/CPT STEM milestones, H-1B controls",
    desc: "Monitors USCIS Form I-9 compliance, STEM OPT timelines, visa renewals, and foreign national work eligibility.",
    rules: ["CTRL-IMM-I9 — Form I-9 reverification", "CTRL-IMM-STEM-OPT — F-1 STEM extension verification"],
  },
  {
    num: 4, key: "Tax/Payroll", name: "Payroll & Tax Compliance", icon: "receipt", ver: "v1.1.0", pilot: true,
    owner: "Payroll & Finance Lead", ownerLead: "Payroll & Finance Lead", verified: 100, checksPerWorker: 1,
    short: "State withholding registrations, quarterly filing receipts, tax forms",
    desc: "Tracks multi-state withholding certificates, contractor W-9 filings, and quarterly wage reporting.",
    rules: ["CTRL-TAX-W4 — W-4 withholding certificate", "CTRL-TAX-STATE — State tax registration"],
  },
];

export const REQUIREMENTS = [
  { value: "RN License", group: "Healthcare", label: "California RN License Renewal", rule: "CTRL-HC-RN-LIC" },
  { value: "BLS Certification", group: "Healthcare", label: "AHA Basic Life Support (BLS)", rule: "CTRL-HC-BLS" },
  { value: "Form I-9", group: "Immigration", label: "Form I-9 Verification Document", rule: "CTRL-IMM-I9" },
  { value: "Handbook Ack", group: "Onboarding", label: "Security & Handbook Acknowledgment", rule: "CTRL-ONB-HANDBOOK" },
  { value: "Tax Form", group: "Tax/Payroll", label: "State Withholding Form & Receipt", rule: "CTRL-TAX-W4" },
];

export const PAGES = {
  overview: { group: "Monitor", title: "Compliance overview", sub: "Real-time status across activated packs, verified evidence, and ongoing remediations." },
  cases: { group: "Monitor", title: "Remediation inbox", sub: "Active exception queue and automated follow-ups across Slack and email." },
  workers: { group: "Monitor", title: "Worker register", sub: "Unified workforce compliance roster across all activated packs." },
  evidence: { group: "Monitor", title: "Evidence & AI intake", sub: "Submitted certificates, licenses, and AI OCR field extractions." },
  packs: { group: "Govern", title: "Compliance packs", sub: "Versioned regulatory and company skills with assigned owners." },
  controls: { group: "Govern", title: "Custom controls", sub: "Draft rules in plain language and review active evaluation conditions." },
  integrations: { group: "Connect", title: "HRMS & connectors", sub: "Authenticated API sync, chat assistants, and spreadsheet imports." },
  audit: { group: "Prove", title: "Audit trail", sub: "Cryptographically verifiable log of all evaluations, requests, and closures." },
  reports: { group: "Prove", title: "Reports", sub: "Executive summaries and audit-ready verification packs." },
};
