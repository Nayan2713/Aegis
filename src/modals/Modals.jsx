import { useRef, useState } from "react";
import Icon from "../components/Icon";
import { Avatar, Button, EmptyState, Field, Modal, PackChip, Status, Tag } from "../components/ui";
import { useApp } from "../state/AppContext";
import { PACKS, REQUIREMENTS } from "../data/demoData";
import { filterCases, filterWorkers } from "../data/metrics";

/* ---------------- Add worker ---------------- */
function AddWorkerModal({ onClose }) {
  const { actions } = useApp();
  const [f, setF] = useState({ name: "", role: "", facility: "", pack: "Healthcare" });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const valid = f.name.trim() && f.role.trim();

  const submit = (e) => {
    e?.preventDefault();
    if (!valid) return;
    actions.addWorker({ ...f, name: f.name.trim(), role: f.role.trim(), facility: f.facility.trim() });
    onClose();
  };

  return (
    <Modal
      icon="userPlus"
      title="Add worker to register"
      subtitle="Enroll a clinician or employee into compliance monitoring."
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={submit} disabled={!valid}>Save & enroll worker</Button>
        </>
      }
    >
      <form className="form" onSubmit={submit}>
        <Field label="Full name & title">
          <input autoFocus value={f.name} onChange={set("name")} placeholder="e.g. Sarah Jenkins, RN" required />
        </Field>
        <Field label="Role & department">
          <input value={f.role} onChange={set("role")} placeholder="e.g. ICU Charge Nurse (Clinical)" required />
        </Field>
        <Field label="Assigned facility / location">
          <input value={f.facility} onChange={set("facility")} placeholder="e.g. St. Jude Medical Center, San Jose CA" />
        </Field>
        <Field label="Applicable compliance pack" hint={f.pack === "Healthcare" ? "A license verification case opens automatically for new clinicians." : undefined}>
          <div className="choice-row">
            {[
              { v: "Healthcare", t: "Healthcare workforce", d: "RN license, BLS, ACLS", i: "stethoscope" },
              { v: "Corporate", t: "Corporate & operations", d: "Onboarding, tax, I-9", i: "building" },
            ].map((o) => (
              <label key={o.v} className={`choice ${f.pack === o.v ? "is-on" : ""}`}>
                <input type="radio" name="pack" value={o.v} checked={f.pack === o.v} onChange={set("pack")} />
                <Icon name={o.i} size={18} />
                <span>
                  <strong>{o.t}</strong>
                  <span>{o.d}</span>
                </span>
              </label>
            ))}
          </div>
        </Field>
        <button type="submit" hidden />
      </form>
    </Modal>
  );
}

/* ---------------- Upload evidence ---------------- */
function UploadModal({ onClose, payload }) {
  const { data, actions } = useApp();
  const [f, setF] = useState({
    worker: payload?.worker || data.workers[0]?.name || "",
    requirement: "RN License",
    docNo: "RN-884920",
    expiry: "2028-10-14",
    file: null,
  });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const fileRef = useRef(null);
  const groups = [...new Set(REQUIREMENTS.map((r) => r.group))];

  const submit = () => {
    if (!f.worker) return;
    onClose();
    actions.submitEvidence(f);
  };

  return (
    <Modal
      icon="scan"
      title="Intake evidence & verify worker"
      subtitle="AI extracts fields, matches rules and updates live compliance state."
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" icon="scan" onClick={submit} disabled={!f.worker}>Scan & evaluate evidence</Button>
        </>
      }
    >
      <div className="form">
        <Field label="Worker">
          {data.workers.length === 0 ? (
            <select disabled><option>No workers in register (add a worker first)</option></select>
          ) : (
            <select value={f.worker} onChange={set("worker")}>
              {data.workers.map((w) => (
                <option key={w.id} value={w.name}>{w.name} ({w.role}, {w.facility})</option>
              ))}
            </select>
          )}
        </Field>
        <Field label="Requirement">
          <select value={f.requirement} onChange={set("requirement")}>
            {groups.map((g) => (
              <optgroup key={g} label={g}>
                {REQUIREMENTS.filter((r) => r.group === g).map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </Field>
        <div className="form-2">
          <Field label="Document / certificate #">
            <input value={f.docNo} onChange={set("docNo")} placeholder="e.g. RN-884920" />
          </Field>
          <Field label="Expiration date">
            <input type="date" value={f.expiry} onChange={set("expiry")} />
          </Field>
        </div>
        <Field label="Document file (optional)">
          <button type="button" className="dropzone small" onClick={() => fileRef.current?.click()}>
            <Icon name="upload" size={18} />
            <span>{f.file ? f.file : "Choose a PDF or image of the document"}</span>
          </button>
          <input ref={fileRef} type="file" accept=".pdf,image/*" hidden onChange={(e) => setF({ ...f, file: e.target.files?.[0]?.name || null })} />
        </Field>
      </div>
    </Modal>
  );
}

/* ---------------- Import roster ---------------- */
function ImportModal({ onClose }) {
  const { actions } = useApp();
  const [file, setFile] = useState(null);
  const [drag, setDrag] = useState(false);
  const ref = useRef(null);

  const pick = (fl) => fl && setFile(fl.name);

  return (
    <Modal
      icon="sheet"
      title="Import worker roster"
      subtitle="Bring in a CSV or Excel roster and run the initial assessment."
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={() => { onClose(); actions.importRoster(file); }}>Ingest & run assessment</Button>
        </>
      }
    >
      <button
        type="button"
        className={`dropzone ${drag ? "is-drag" : ""} ${file ? "has-file" : ""}`}
        onClick={() => ref.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files?.[0]); }}
      >
        <span className="dropzone-icon"><Icon name={file ? "check" : "sheet"} size={22} /></span>
        <strong>{file || "Drop your CSV or Excel roster here"}</strong>
        <span>{file ? "Ready to ingest. Click to choose a different file." : "or click to browse. Columns: Name, Role, Facility, Department, Expiry"}</span>
      </button>
      <input ref={ref} type="file" accept=".csv,.xlsx,.xls" hidden onChange={(e) => pick(e.target.files?.[0])} />
      <p className="note">
        <Icon name="info" size={14} /> In this demo, ingesting runs the HRMS sample assessment (5 workers) whether or not you attach a file.
      </p>
    </Modal>
  );
}

/* ---------------- Worker profile ---------------- */
function WorkerModal({ onClose, payload }) {
  const { data, actions, openModal } = useApp();
  const w = data.workers.find((x) => x.id === payload);
  if (!w) return null;
  const workerCases = data.cases.filter((c) => c.worker === w.name);
  const workerEvidence = data.evidence.filter((e) => e.worker === w.name);

  return (
    <Modal
      width={640}
      title={w.name}
      subtitle={`HRMS record ${w.id}, ${w.role}`}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Close</Button>
          <Button icon="upload" onClick={() => openModal("upload", { worker: w.name })}>Upload evidence</Button>
          <Button variant="primary" icon="zap" onClick={() => { actions.chaseWorker(w.name); onClose(); }}>Send Slack follow-up</Button>
        </>
      }
    >
      <div className="profile-head">
        <Avatar name={w.name} size={48} />
        <dl className="profile-facts">
          <div><dt>Job role</dt><dd>{w.role}</dd></div>
          <div><dt>Facility</dt><dd>{w.facility}</dd></div>
          <div><dt>Department</dt><dd>{w.dept}</dd></div>
          <div><dt>Sync source</dt><dd>Bluebix HRMS API webhook</dd></div>
        </dl>
      </div>

      <h4 className="section-label">Compliance pack status</h4>
      <div className="pack-status-grid">
        {[["Onboarding", w.onboard || "Pass"], ["Healthcare", w.hc], ["Immigration", w.imm], ["Payroll / tax", w.tax]].map(([k, v]) => (
          <div key={k} className="pack-status">
            <span>{k}</span>
            <Status value={v} />
          </div>
        ))}
      </div>

      <h4 className="section-label">Active gaps & remediation</h4>
      {workerCases.length ? (
        workerCases.map((c) => (
          <div key={c.id} className="gap-card">
            <div className="gap-card-top">
              <strong>{c.obligation}</strong>
              <span className="stage">{c.stage}</span>
            </div>
            <div className="text-risk">{c.gap}</div>
            <div className="muted">Due {c.due}. Owner: {c.owner}</div>
          </div>
        ))
      ) : (
        <div className="all-clear">
          <Icon name="check" size={16} /> All active compliance checks pass for this worker. No open gaps.
        </div>
      )}

      {workerEvidence.length > 0 && (
        <>
          <h4 className="section-label">Evidence on file</h4>
          <ul className="mini-list">
            {workerEvidence.map((e) => (
              <li key={e.id}>
                <Icon name="file" size={15} />
                <span>{e.doc}</span>
                <span className="code muted">{e.expiry}</span>
                <Status value={e.status} />
              </li>
            ))}
          </ul>
        </>
      )}
    </Modal>
  );
}

/* ---------------- Case details ---------------- */
function CaseModal({ onClose, payload }) {
  const { data, actions, openModal } = useApp();
  const c = data.cases.find((x) => x.id === payload);
  if (!c) {
    return (
      <Modal title="Case closed" onClose={onClose} footer={<Button onClick={onClose}>Close</Button>}>
        <EmptyState title="This case is no longer open">It was resolved or closed by verified evidence.</EmptyState>
      </Modal>
    );
  }
  const w = data.workers.find((x) => x.name === c.worker);

  return (
    <Modal
      icon="inbox"
      title={c.obligation}
      subtitle={`${c.id} for ${c.worker}`}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" icon="check" onClick={() => { actions.resolveCase(c.id); onClose(); }}>Mark resolved</Button>
          {w && <Button onClick={() => openModal("worker", w.id)}>View worker</Button>}
          <Button variant="primary" icon="zap" onClick={() => actions.chaseCase(c.id)}>Send Slack DM</Button>
        </>
      }
    >
      <div className={`case-banner prio-${c.priority.toLowerCase()}`}>
        <Icon name="alert" size={18} />
        <span>{c.gap}</span>
      </div>
      <dl className="kv">
        <div><dt>Priority</dt><dd><Status value={c.priority} /></dd></div>
        <div><dt>Pack</dt><dd><PackChip pack={c.pack} /></dd></div>
        <div><dt>Cadence stage</dt><dd>{c.stage}</dd></div>
        <div><dt>Owner</dt><dd>{c.owner}</dd></div>
        <div><dt>Due date</dt><dd className="due">{c.due}</dd></div>
      </dl>
    </Modal>
  );
}

/* ---------------- KPI drill-downs ---------------- */
function KpiModal({ onClose, payload }) {
  const { data, metrics, actions, openModal, setTab } = useApp();
  const { category, filter } = payload;
  const go = (t) => { setTab(t); onClose(); };

  if (category === "checks") {
    const totals = [
      { k: "pass", label: "Passed & verified", v: metrics.pass, tone: "ok" },
      { k: "fail", label: "Action required", v: metrics.fail, tone: "risk" },
      { k: "unknown", label: "Pending intake", v: metrics.unknown, tone: "muted" },
    ];
    const tw = data.workers.length || 8;
    const breakdown = PACKS.map((p) => {
      const gaps = data.cases.filter((c) => c.pack === p.key).length;
      return { ...p, evals: tw * p.checksPerWorker, gaps };
    });
    const pending = filterWorkers(data.workers, "gaps");
    return (
      <Modal
        width={680}
        title="Compliance evaluation breakdown"
        subtitle={`${metrics.totalChecks} automated rules verified across 4 packs`}
        onClose={onClose}
        footer={<><Button variant="ghost" onClick={onClose}>Close</Button><Button variant="primary" onClick={() => go("packs")}>Manage compliance packs</Button></>}
      >
        <div className="tri">
          {totals.map((t) => (
            <div key={t.k} className={`tri-cell tone-${t.tone} ${filter === t.k ? "is-focus" : ""}`}>
              <strong>{t.v}</strong>
              <span>{t.label}</span>
            </div>
          ))}
        </div>
        <h4 className="section-label">By active compliance pack</h4>
        <ul className="breakdown">
          {breakdown.map((p) => (
            <li key={p.num}>
              <span className={`pack-glyph sm pack-${p.key.toLowerCase().replace(/[^a-z]/g, "")}`}><Icon name={p.icon} size={14} /></span>
              <span className="breakdown-name"><strong>{p.name}</strong><span>{p.evals} evaluations</span></span>
              <span className="text-ok strong">{p.verified}% compliant</span>
              <span className={p.gaps ? "text-risk" : "muted"}>{p.gaps} open {p.gaps === 1 ? "gap" : "gaps"}</span>
            </li>
          ))}
        </ul>
        {(filter === "fail" || filter === "unknown") && pending.length > 0 && (
          <>
            <h4 className="section-label">Workers behind the failing checks</h4>
            <ul className="mini-list">
              {pending.map((w) => (
                <li key={w.id}>
                  <Avatar name={w.name} size={24} />
                  <span>{w.name}</span>
                  <span className="muted">{w.role}</span>
                  <Button size="sm" variant="ghost" onClick={() => openModal("worker", w.id)}>View</Button>
                </li>
              ))}
            </ul>
          </>
        )}
      </Modal>
    );
  }

  if (category === "cases") {
    const titles = {
      all: "All active remediation exceptions",
      expiring: "Expiring credentials (< 30 days)",
      onboarding: "Missing onboarding & handbook acknowledgments",
      specialist: "Specialist reviews (I-9 / STEM OPT / tax)",
    };
    const list = filterCases(data.cases, filter);
    return (
      <Modal
        width={680}
        title={titles[filter] || titles.all}
        subtitle={`${list.length} open ${list.length === 1 ? "item" : "items"} auto-chasing across Slack and email`}
        onClose={onClose}
        footer={<><Button variant="ghost" onClick={onClose}>Close</Button><Button variant="primary" onClick={() => go("cases")}>Open remediation inbox</Button></>}
      >
        {list.length === 0 ? (
          <EmptyState title="Nothing open here">No cases match this segment.</EmptyState>
        ) : (
          <div className="case-list">
            {list.map((c) => (
              <article key={c.id} className={`case-card prio-${c.priority.toLowerCase()}`}>
                <div className="case-card-top">
                  <strong>{c.worker}</strong>
                  <Status value={c.priority}>{c.priority} priority</Status>
                </div>
                <div><span className="muted">Obligation:</span> {c.obligation}</div>
                <div className="text-risk">{c.gap}</div>
                <div className="case-card-foot">
                  <span className="muted">Stage: {c.stage}. Due <span className="due">{c.due}</span></span>
                  <Button size="sm" icon="zap" onClick={() => actions.chaseCase(c.id)}>Send Slack DM</Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </Modal>
    );
  }

  if (category === "workers") {
    const titles = {
      all: "Workforce directory & compliance coverage",
      clinical: "Healthcare & clinical personnel",
      corporate: "Corporate, tech & operations staff",
      gaps: "Workers requiring action",
    };
    const list = filterWorkers(data.workers, filter);
    return (
      <Modal
        width={680}
        title={titles[filter] || titles.all}
        subtitle={`Showing ${list.length} workers in this segment`}
        onClose={onClose}
        footer={<><Button variant="ghost" onClick={onClose}>Close</Button><Button variant="primary" onClick={() => go("workers")}>Open worker register</Button></>}
      >
        <ul className="person-list">
          {list.map((w) => (
            <li key={w.id}>
              <Avatar name={w.name} size={34} />
              <span className="person-text">
                <strong>{w.name}</strong>
                <span>{w.role}, {w.facility}</span>
              </span>
              <Status value={w.overall} tone={w.overall.includes("100%") ? "ok" : "risk"} />
              <Button size="sm" variant="ghost" onClick={() => openModal("worker", w.id)}>View profile</Button>
            </li>
          ))}
        </ul>
      </Modal>
    );
  }

  // labor
  const items = [
    { k: "followups", icon: "message", title: "Autonomous Slack chasing cadence", stat: `${metrics.followupsCount} DMs sent this month`, d: "Replaced manual email inquiries with proactive Slack reminders and direct upload links." },
    { k: "closures", icon: "scan", title: "AI OCR vision & auto-verification", stat: `${metrics.closuresCount} auto-approvals`, d: "Documents scanned in under a second with 99%+ OCR confidence, matched against state medical boards." },
    { k: "velocity", icon: "zap", title: "Remediation cycle velocity", stat: "82% faster turnaround", d: "Average exception resolution reduced from 8.2 days of manual chasing to 1.4 days." },
  ];
  return (
    <Modal
      width={680}
      title="Automated labor saved"
      subtitle="Operational velocity and cost reduction from the Aegis AI coworker"
      onClose={onClose}
      footer={<><Button variant="ghost" onClick={onClose}>Close</Button><Button variant="primary" onClick={() => go("audit")}>View live audit trail</Button></>}
    >
      <div className="tri">
        <div className="tri-cell tone-info"><strong>{metrics.hoursSaved} hrs</strong><span>Total hours saved</span></div>
        <div className="tri-cell tone-ok"><strong>${metrics.laborCost.toLocaleString()}</strong><span>Est. labor cost saved</span></div>
        <div className="tri-cell tone-violet"><strong>1.4 days</strong><span>Avg. remediation time</span></div>
      </div>
      <h4 className="section-label">Automation interventions</h4>
      <ul className="interventions">
        {items.map((i) => (
          <li key={i.k} className={filter === i.k ? "is-focus" : ""}>
            <span className="intervention-icon"><Icon name={i.icon} size={16} /></span>
            <div>
              <div className="intervention-top"><strong>{i.title}</strong><span>{i.stat}</span></div>
              <p>{i.d}</p>
            </div>
          </li>
        ))}
      </ul>
    </Modal>
  );
}

/* ---------------- Pack details ---------------- */
function PackModal({ onClose, payload }) {
  const { data, setTab } = useApp();
  const p = PACKS.find((x) => x.num === payload) || PACKS[0];
  const slug = p.key.toLowerCase().replace(/[^a-z]/g, "");
  const custom = data.customControls.filter((c) => c.pack === p.key && !p.rules.some((r) => r.startsWith(c.id)));

  return (
    <Modal
      width={600}
      title={`${p.name} pack`}
      subtitle={`Version ${p.ver}. Owner: ${p.ownerLead}`}
      onClose={onClose}
      footer={<><Button variant="ghost" onClick={onClose}>Close</Button><Button variant="primary" onClick={() => { setTab("packs"); onClose(); }}>Open packs management</Button></>}
    >
      <div className="pack-hero">
        <span className={`pack-glyph lg pack-${slug}`}><Icon name={p.icon} size={22} /></span>
        <p>{p.desc}</p>
      </div>
      <h4 className="section-label">Evaluation conditions & skill rules</h4>
      <ul className="rules">
        {p.rules.map((r) => {
          const [id, desc] = r.split(" — ");
          return (
            <li key={r}>
              <span className="code">{id}</span>
              <span>{desc}</span>
              <Status value="Active" />
            </li>
          );
        })}
        {custom.map((c) => (
          <li key={c.id}>
            <span className="code">{c.id}</span>
            <span>{c.name}</span>
            <Status value={c.status} />
          </li>
        ))}
      </ul>
    </Modal>
  );
}

/* ---------------- Audit record ---------------- */
function AuditModal({ onClose, payload }) {
  const { data, toast } = useApp();
  const log = data.auditLogs[payload] || data.auditLogs[0];
  if (!log) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(log.proof);
      toast("Proof hash copied to clipboard", "success");
    } catch {
      toast("Clipboard unavailable. Select the hash to copy it.", "warning");
    }
  };

  return (
    <Modal
      icon="lock"
      title={`Audit record: ${log.type.replace(/_/g, " ").toLowerCase()}`}
      subtitle={`${log.time}, by ${log.actor}`}
      onClose={onClose}
      footer={<><Button variant="ghost" onClick={onClose}>Close</Button><Button variant="primary" icon="copy" onClick={copy}>Copy proof hash</Button></>}
    >
      <dl className="kv">
        <div><dt>Subject</dt><dd>{log.subject}</dd></div>
        <div><dt>Action</dt><dd>{log.action}</dd></div>
        <div><dt>Proof</dt><dd className="code accent">{log.proof}</dd></div>
      </dl>
      <p className="note">
        <Icon name="shield" size={14} /> Signed with SHA-256 integrity hashing to satisfy SOC 2, HIPAA and Joint Commission standards.
      </p>
      <Tag>Immutable</Tag>
    </Modal>
  );
}

const REGISTRY = {
  addWorker: AddWorkerModal,
  upload: UploadModal,
  import: ImportModal,
  worker: WorkerModal,
  case: CaseModal,
  kpi: KpiModal,
  pack: PackModal,
  audit: AuditModal,
};

export default function ModalHost() {
  const { modal, closeModal } = useApp();
  if (!modal) return null;
  const C = REGISTRY[modal.name];
  return C ? <C key={modal.name + JSON.stringify(modal.payload)} onClose={closeModal} payload={modal.payload} /> : null;
}
