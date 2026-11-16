import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  CURRENT_USER,
  HRMS_SYNC_BATCH,
  PAGES,
  REQUIREMENTS,
  STORAGE_KEY,
  getDefaultDemoData,
} from "../data/demoData";
import { computeMetrics, formatDue, makeHash, nowStamp } from "../data/metrics";

const AppContext = createContext(null);

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.workers && parsed.workers.length > 0) return parsed;
    }
  } catch (e) {
    console.error("Failed to load saved state", e);
  }
  return getDefaultDemoData();
}

function tabFromHash() {
  const h = (window.location.hash || "").replace("#", "");
  return PAGES[h] ? h : "overview";
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function withAudit(logs, type, subject, action, actor = "Aegis AI") {
  const next = [{ time: nowStamp(), type, subject, action, actor, proof: makeHash() }, ...logs];
  return next.slice(0, 40);
}

export function AppProvider({ children }) {
  const [data, setData] = useState(loadState);
  const [tab, setTabState] = useState(tabFromHash);
  const [modal, setModal] = useState(null); // { name, payload }
  const [chatOpen, setChatOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [selectedEvidenceId, setSelectedEvidenceId] = useState(null);
  const [botTyping, setBotTyping] = useState(false);
  const [busy, setBusy] = useState({}); // { sync: true, scan: true ... }
  const dataRef = useRef(data);
  dataRef.current = data;

  // Persist
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* storage unavailable */
    }
  }, [data]);

  // Hash routing
  useEffect(() => {
    const onHash = () => setTabState(tabFromHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const setTab = useCallback((t) => {
    if (!PAGES[t]) return;
    if (window.location.hash !== `#${t}`) window.location.hash = t;
    setTabState(t);
    document.querySelector(".workspace")?.scrollTo({ top: 0 });
  }, []);

  // ---------- Toasts ----------
  const toast = useCallback((message, type = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3400);
  }, []);
  const dismissToast = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  // ---------- Modals ----------
  const openModal = useCallback((name, payload = null) => setModal({ name, payload }), []);
  const closeModal = useCallback(() => setModal(null), []);

  const addAudit = useCallback((type, subject, action, actor) => {
    setData((d) => ({ ...d, auditLogs: withAudit(d.auditLogs, type, subject, action, actor) }));
  }, []);

  // ---------- Actions ----------
  const resetDemo = useCallback(() => {
    setData(getDefaultDemoData());
    setSelectedEvidenceId(null);
    toast("Demo dataset reloaded across all sections", "success");
  }, [toast]);

  const addWorker = useCallback(
    ({ name, role, facility, pack }) => {
      const newWorker = {
        id: `W-${Math.floor(100 + Math.random() * 900)}`,
        name,
        role,
        facility: facility || "HQ Operations",
        dept: pack === "Healthcare" ? "Clinical" : "Corporate",
        onboard: "Pass",
        hc: pack === "Healthcare" ? "Action Req" : "N/A",
        imm: "Pass",
        tax: "Pass",
        overall: pack === "Healthcare" ? "Pending Action" : "Verified 100%",
      };
      setData((d) => {
        const cases =
          pack === "Healthcare"
            ? [
                {
                  id: `CASE-${Math.floor(8000 + Math.random() * 999)}`,
                  worker: name,
                  pack: "Healthcare",
                  obligation: "State License / Credential",
                  gap: "New worker enrollment: license verification pending",
                  stage: "Auto-chasing (welcome DM sent)",
                  owner: "Healthcare Compliance",
                  due: formatDue(14),
                  priority: "High",
                },
                ...d.cases,
              ]
            : d.cases;
        return {
          ...d,
          workers: [newWorker, ...d.workers],
          cases,
          auditLogs: withAudit(d.auditLogs, "WORKER_ADDED", name, `Enrolled ${name} into ${pack} compliance pack.`),
        };
      });
      toast(`${name} added to the worker register`, "success");
    },
    [toast]
  );

  const submitEvidence = useCallback(
    async ({ worker, requirement, docNo, expiry }) => {
      const req = REQUIREMENTS.find((r) => r.value === requirement) || REQUIREMENTS[0];
      const docType = req.label;
      setBusy((b) => ({ ...b, scan: true }));
      toast("AI OCR is scanning the submitted document…", "info");
      await sleep(900);
      const newEv = {
        id: `EV-${Math.floor(400 + Math.random() * 500)}`,
        doc: docType,
        worker,
        confidence: `${(98 + Math.random() * 1.9).toFixed(1)}%`,
        status: "Verified & Matched",
        rule: req.rule,
        docNo: docNo || "RN-884920",
        expiry: expiry || "2028-10-14",
      };
      setData((d) => {
        const idx = d.cases.findIndex((c) => c.worker === worker);
        const cases = idx === -1 ? d.cases : d.cases.filter((_, i) => i !== idx);
        const workers = d.workers.map((w) => (w.name === worker ? { ...w, hc: w.hc === "N/A" ? "N/A" : "Pass", overall: "Verified 100%" } : w));
        return {
          ...d,
          evidence: [newEv, ...d.evidence],
          cases,
          workers,
          auditLogs: withAudit(d.auditLogs, "EVIDENCE_INTAKE", worker, `AI scanned and verified ${docType} (#${newEv.docNo}). Status: Pass.`),
        };
      });
      setBusy((b) => ({ ...b, scan: false }));
      toast(`Document verified for ${worker}. Case closed.`, "success");
      setTab("evidence");
      setSelectedEvidenceId(newEv.id);
    },
    [toast, setTab]
  );

  const approveEvidence = useCallback(
    (evId) => {
      const ev = dataRef.current.evidence.find((e) => e.id === evId);
      if (!ev) return;
      setData((d) => ({
        ...d,
        evidence: d.evidence.map((e) => (e.id === evId ? { ...e, status: "Verified & Closed" } : e)),
        auditLogs: withAudit(d.auditLogs, "EVIDENCE_VERIFIED", ev.worker, `Verified ${ev.doc}. Control marked as PASS.`),
      }));
      toast(`Verified ${ev.doc} for ${ev.worker}`, "success");
    },
    [toast]
  );

  const syncHrms = useCallback(async () => {
    setBusy((b) => ({ ...b, sync: true }));
    toast("Syncing with HRMS Core API…", "info");
    await sleep(900);
    setData((d) => ({
      ...d,
      workers: HRMS_SYNC_BATCH.workers.map((w) => ({ ...w })),
      cases: HRMS_SYNC_BATCH.cases.map((c) => ({ ...c })),
      auditLogs: withAudit(d.auditLogs, "HRMS_SYNC", "HRMS Webhook", "Synchronized 5 workers from HRMS. Initial assessment completed."),
    }));
    setBusy((b) => ({ ...b, sync: false }));
    toast("Synchronized 5 workers from the HRMS API", "success");
  }, [toast]);

  const importRoster = useCallback(
    async (fileName) => {
      toast(fileName ? `Ingesting ${fileName}…` : "Ingesting spreadsheet roster…", "info");
      await sleep(400);
      await syncHrms();
    },
    [toast, syncHrms]
  );

  const dispatchReminders = useCallback(() => {
    const n = dataRef.current.cases.length;
    setData((d) => ({
      ...d,
      auditLogs: withAudit(d.auditLogs, "BATCH_REMINDERS", "All Gaps", "Autonomous reminder cadence dispatched to open cases via Slack."),
    }));
    toast(n ? `Slack reminders sent to ${n} workers with open gaps` : "No open gaps to chase", n ? "success" : "info");
  }, [toast]);

  const chaseCase = useCallback(
    (caseId) => {
      const c = dataRef.current.cases.find((x) => x.id === caseId);
      if (!c) return;
      addAudit("DIRECT_REMINDER", c.worker, `Dispatched direct Slack follow-up for ${c.obligation}.`);
      toast(`Followed up with ${c.worker} on Slack about ${c.obligation}`, "info");
    },
    [addAudit, toast]
  );

  const chaseWorker = useCallback(
    (workerName) => {
      addAudit("DIRECT_REMINDER", workerName, "Dispatched direct Slack follow-up from HRMS profile.");
      toast(`Slack follow-up sent to ${workerName}`, "success");
    },
    [addAudit, toast]
  );

  const resolveCase = useCallback(
    (caseId) => {
      const c = dataRef.current.cases.find((x) => x.id === caseId);
      if (!c) return;
      setData((d) => ({
        ...d,
        cases: d.cases.filter((x) => x.id !== caseId),
        auditLogs: withAudit(d.auditLogs, "CASE_CLOSED", c.worker, `Manually resolved ${c.id}: ${c.obligation}.`),
      }));
      toast(`${c.id} marked as resolved`, "success");
    },
    [toast]
  );

  const draftRule = useCallback(
    (text, pack = "Custom") => {
      const ctl = {
        id: `CTRL-CUSTOM-${Math.floor(100 + Math.random() * 900)}`,
        pack,
        name: "Custom expiration & escalation rule",
        condition: text,
        cadence: "Evaluated on event trigger",
        status: "Active",
      };
      setData((d) => ({
        ...d,
        customControls: [...d.customControls, ctl],
        auditLogs: withAudit(d.auditLogs, "CONTROL_CREATED", "Registry", `Created control ${ctl.id} from natural language.`),
      }));
      toast(`Control ${ctl.id} drafted and activated`, "success");
    },
    [toast]
  );

  const toggleControl = useCallback(
    (id) => {
      setData((d) => ({
        ...d,
        customControls: d.customControls.map((c) => (c.id === id ? { ...c, status: c.status === "Active" ? "Paused" : "Active" } : c)),
      }));
      const c = dataRef.current.customControls.find((x) => x.id === id);
      if (c) toast(`${id} ${c.status === "Active" ? "paused" : "activated"}`, "info");
    },
    [toast]
  );

  // ---------- Chat ----------
  const sendChat = useCallback(
    async (text) => {
      setChatOpen(true);
      setData((d) => ({ ...d, chatHistory: [...d.chatHistory, { sender: "user", author: `${CURRENT_USER.name} (${CURRENT_USER.role})`, text }] }));
      setBotTyping(true);
      await sleep(650);
      const q = text.toLowerCase();
      const d = dataRef.current;
      let reply = `Understood: "${text}". I'm monitoring active workers and compliance rules and will flag anything that changes.`;

      if (q.includes("expire")) {
        const expiring = d.cases.filter((c) => c.pack === "Healthcare");
        reply = expiring.length
          ? `Found **${expiring.length} upcoming expirations**:\n` + expiring.map((e) => `• **${e.worker}:** ${e.obligation} (due ${e.due})`).join("\n")
          : "No credentials are approaching expiration in the active register.";
      } else if (q.includes("new worker") || q.includes("missing for")) {
        const onboarding = d.cases.filter((c) => c.pack === "Onboarding" || c.gap.toLowerCase().includes("new worker"));
        reply = onboarding.length
          ? `**${onboarding.length} onboarding gap${onboarding.length > 1 ? "s" : ""}** on new workers:\n` + onboarding.map((c) => `• **${c.worker}:** ${c.gap}`).join("\n")
          : "Checked active onboarding records. All required handbook acknowledgments and I-9 documents are on file.";
      } else if (q.includes("request") && q.includes("missing")) {
        dispatchReminders();
        reply = "**Dispatched:** automated Slack DMs and upload links sent to every worker with an open gap.";
      } else if (q.includes("approval") || q.includes("approve")) {
        const pending = d.evidence.filter((e) => e.status === "Verified & Matched");
        reply = pending.length
          ? `**${pending.length} AI-matched documents** are waiting for your sign-off:\n` + pending.slice(0, 5).map((e) => `• ${e.doc} — **${e.worker}** (${e.confidence})`).join("\n") + "\n\nOpen Evidence & AI intake to confirm them."
          : "Nothing needs your approval right now.";
      }

      setData((dd) => ({ ...dd, chatHistory: [...dd.chatHistory, { sender: "bot", author: "Aegis Coworker", text: reply }] }));
      setBotTyping(false);
    },
    [dispatchReminders]
  );

  const metrics = useMemo(() => computeMetrics(data), [data]);

  const value = {
    data,
    metrics,
    tab,
    setTab,
    modal,
    openModal,
    closeModal,
    chatOpen,
    setChatOpen,
    toasts,
    toast,
    dismissToast,
    selectedEvidenceId,
    setSelectedEvidenceId,
    botTyping,
    busy,
    actions: {
      resetDemo,
      addWorker,
      submitEvidence,
      approveEvidence,
      syncHrms,
      importRoster,
      dispatchReminders,
      chaseCase,
      chaseWorker,
      resolveCase,
      draftRule,
      toggleControl,
      sendChat,
      addAudit,
    },
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside <AppProvider>");
  return ctx;
}
