// Live metric computation — same logic as the original prototype.

export function isClinician(w) {
  const dept = (w.dept || "").toLowerCase();
  const role = (w.role || "").toLowerCase();
  return (
    dept.includes("clinical") ||
    role.includes("nurse") ||
    role.includes("np") ||
    role.includes("md") ||
    role.includes("therapist")
  );
}

export const isVerified = (w) => !!w.overall && w.overall.includes("100%");

export function computeMetrics(state) {
  const { workers, cases, evidence, auditLogs } = state;
  const totalWorkers = workers.length;
  const totalChecks = totalWorkers > 0 ? totalWorkers * 10 : 80;

  let pass = 0, fail = 0, unknown = 0, clinicians = 0, corporate = 0, gaps = 0;

  workers.forEach((w) => {
    if (isClinician(w)) clinicians++;
    else corporate++;
    if (!isVerified(w)) gaps++;

    if (w.overall && (w.overall.includes("100%") || w.overall === "Pass")) {
      pass += 10;
    } else if (w.overall && (w.overall.includes("Action") || w.overall.includes("Pending"))) {
      pass += 8;
      fail += 2;
    } else {
      pass += 6;
      unknown += 4;
    }
  });

  const activeCases = cases.length;
  const expiringCount = cases.filter((c) => c.pack === "Healthcare" || (c.gap || "").toLowerCase().includes("expire")).length;
  const missingOnboardCount = cases.filter((c) => c.pack === "Onboarding" || (c.obligation || "").toLowerCase().includes("handbook")).length;
  const specialistCount = cases.filter((c) => c.pack === "Immigration" || c.pack === "Tax/Payroll").length;

  const followupsCount = Math.max(18, auditLogs.filter((l) => l.type.includes("REMINDER")).length + 14);
  const closuresCount = Math.max(12, evidence.filter((e) => e.status.includes("Verified")).length + 7);
  const hoursSaved = Math.max(42, Math.round(auditLogs.length * 3.2 + activeCases * 4.5 + 24));

  const t = totalWorkers > 0 ? totalChecks : 80;
  const p = totalWorkers > 0 ? pass : 72;
  const f = totalWorkers > 0 ? fail : 6;
  const u = totalWorkers > 0 ? unknown : 2;

  return {
    totalChecks: t,
    pass: p,
    fail: f,
    unknown: u,
    passPct: Math.round((p / t) * 1000) / 10,
    activeCases,
    expiringCount,
    missingOnboardCount,
    specialistCount,
    totalWorkers,
    cliniciansCount: clinicians,
    corporateCount: corporate,
    gapsCount: gaps,
    hoursSaved,
    followupsCount,
    closuresCount,
    laborCost: hoursSaved * 60,
  };
}

export function filterCases(cases, filter) {
  switch (filter) {
    case "expiring":
      return cases.filter((c) => c.pack === "Healthcare" || (c.gap || "").toLowerCase().includes("expire"));
    case "onboarding":
      return cases.filter((c) => c.pack === "Onboarding");
    case "specialist":
      return cases.filter((c) => c.pack === "Immigration" || c.pack === "Tax/Payroll");
    default:
      return cases;
  }
}

export function filterWorkers(workers, filter) {
  switch (filter) {
    case "clinical":
      return workers.filter(isClinician);
    case "corporate":
      return workers.filter((w) => !isClinician(w));
    case "gaps":
      return workers.filter((w) => !isVerified(w));
    default:
      return workers;
  }
}

export function initials(name = "") {
  const clean = name.split(",")[0].trim();
  const parts = clean.split(/\s+/);
  return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase();
}

export function makeHash() {
  const hex = "0123456789abcdef";
  let s = "";
  for (let i = 0; i < 8; i++) s += hex[Math.floor(Math.random() * 16)];
  return `SHA256: ${s}...`;
}

export function nowStamp() {
  return new Date().toISOString().replace("T", " ").substring(0, 19);
}

export function formatDue(daysFromNow) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}
