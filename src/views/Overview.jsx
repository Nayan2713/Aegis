import { useMemo, useState } from "react";
import Icon from "../components/Icon";
import { Button, EmptyState, Panel, Status, Tag, Meter, Avatar } from "../components/ui";
import { useApp } from "../state/AppContext";
import { PACKS } from "../data/demoData";

const PRIORITY_RANK = { High: 0, Medium: 1, Low: 2 };

function CoverageLedger() {
  const { metrics, openModal } = useApp();
  const cells = useMemo(() => {
    const cap = Math.min(metrics.totalChecks, 240);
    const scale = cap / metrics.totalChecks;
    const p = Math.round(metrics.pass * scale);
    const f = Math.round(metrics.fail * scale);
    const u = Math.max(0, cap - p - f);
    return [...Array(p).fill("pass"), ...Array(f).fill("fail"), ...Array(u).fill("unknown")];
  }, [metrics]);

  const cols = cells.length > 120 ? 60 : 40;

  return (
    <section className="ledger">
      <div className="ledger-figure">
        <button className="ledger-number" onClick={() => openModal("kpi", { category: "checks", filter: "all" })}>
          <span className="ledger-pct">{metrics.passPct}</span>
          <span className="ledger-pct-sign">%</span>
        </button>
        <div className="ledger-caption">
          <strong>Verified coverage</strong>
          <span>
            {metrics.pass} of {metrics.totalChecks} automated checks pass across 4 active packs. Each square is one check.
          </span>
        </div>
      </div>

      <div className="ledger-grid-wrap">
        <div className="ledger-grid" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }} aria-hidden="true">
          {cells.map((c, i) => (
            <i key={i} className={`cell cell-${c}`} style={{ "--i": i }} />
          ))}
        </div>
        <div className="ledger-legend">
          <button onClick={() => openModal("kpi", { category: "checks", filter: "pass" })}>
            <i className="cell cell-pass" /> <strong>{metrics.pass}</strong> pass
          </button>
          <button onClick={() => openModal("kpi", { category: "checks", filter: "fail" })}>
            <i className="cell cell-fail" /> <strong>{metrics.fail}</strong> action required
          </button>
          <button onClick={() => openModal("kpi", { category: "checks", filter: "unknown" })}>
            <i className="cell cell-unknown" /> <strong>{metrics.unknown}</strong> unknown or missing
          </button>
        </div>
      </div>
    </section>
  );
}

function StatCard({ icon, tone, title, value, unit, note, rows, onOpen }) {
  return (
    <article className={`stat stat-${tone}`}>
      <button className="stat-top" onClick={onOpen}>
        <span className="stat-icon">
          <Icon name={icon} size={17} />
        </span>
        <span className="stat-title">{title}</span>
        <Icon name="chevronRight" size={16} className="stat-go" />
      </button>
      <div className="stat-value">
        <strong>{value}</strong>
        {unit && <span className="stat-unit">{unit}</span>}
        {note && <span className="stat-note">{note}</span>}
      </div>
      <ul className="stat-rows">
        {rows.map((r) => (
          <li key={r.label}>
            <button onClick={r.onClick}>
              <span>{r.label}</span>
              <strong className={r.alert ? "is-alert" : ""}>{r.value}</strong>
            </button>
          </li>
        ))}
      </ul>
    </article>
  );
}

function PacksTable() {
  const { data, openModal, setTab } = useApp();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const totalW = data.workers.length;

  const rows = PACKS.map((p) => ({
    ...p,
    checks: totalW * p.checksPerWorker,
    gaps: data.cases.filter((c) => c.pack === p.key).length,
  })).filter((p) => {
    const matches = !q || `${p.name} ${p.short} ${p.owner}`.toLowerCase().includes(q.toLowerCase());
    const st = status === "all" || (status === "pilot" ? p.pilot : !p.pilot);
    return matches && st;
  });

  return (
    <Panel
      title="Active compliance packs"
      subtitle="Versioned skills with controlled evaluation rules, owners and evidence requirements."
      flush
      actions={
        <>
          <div className="mini-search">
            <Icon name="search" size={14} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter packs" aria-label="Filter packs" />
          </div>
          <select className="select-sm" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status filter">
            <option value="all">All packs</option>
            <option value="ga">Generally available</option>
            <option value="pilot">Pilot</option>
          </select>
          <Button size="sm" onClick={() => setTab("packs")}>Manage packs</Button>
        </>
      }
    >
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Pack</th>
              <th>Version</th>
              <th className="num">Checks</th>
              <th>Verified</th>
              <th className="num">Open gaps</th>
              <th>Owner</th>
              <th>Status</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={8}>
                  <EmptyState icon="search" title="No packs match this filter">Clear the search or choose “All packs”.</EmptyState>
                </td>
              </tr>
            )}
            {rows.map((p) => (
              <tr key={p.num} className="is-clickable" onClick={() => openModal("pack", p.num)}>
                <td>
                  <div className="cell-pack">
                    <span className={`pack-glyph pack-${p.key.toLowerCase().replace(/[^a-z]/g, "")}`}>
                      <Icon name={p.icon} size={16} />
                    </span>
                    <div>
                      <strong>{p.name}</strong>
                      <span className="muted">{p.short}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <Tag mono>{p.ver}</Tag> {p.pilot && <Tag>Pilot</Tag>}
                </td>
                <td className="num strong">{p.checks}</td>
                <td>
                  <div className="verified-cell">
                    <Meter value={p.verified} tone={p.verified >= 95 ? "ok" : "warn"} />
                    <span>{p.verified}%</span>
                  </div>
                </td>
                <td className={`num strong ${p.gaps ? "text-risk" : "text-ok"}`}>{p.gaps}</td>
                <td className="muted-strong">{p.owner}</td>
                <td>
                  <Status value="Active" />
                </td>
                <td className="row-end">
                  <Icon name="chevronRight" size={16} className="row-chevron" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

export default function Overview() {
  const { data, metrics, openModal, setTab, actions } = useApp();
  const urgent = [...data.cases].sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]).slice(0, 5);
  const kpi = (category, filter = "all") => () => openModal("kpi", { category, filter });

  return (
    <div className="view">
      <CoverageLedger />

      <div className="stats">
        <StatCard
          icon="inbox"
          tone="warn"
          title="Active remediation cases"
          value={metrics.activeCases}
          note="auto-chasing on Slack"
          onOpen={kpi("cases")}
          rows={[
            { label: "Expiring credentials (< 30 days)", value: metrics.expiringCount, alert: metrics.expiringCount > 0, onClick: kpi("cases", "expiring") },
            { label: "Missing onboarding acknowledgment", value: metrics.missingOnboardCount, onClick: kpi("cases", "onboarding") },
            { label: "Specialist reviews (I-9 / tax)", value: metrics.specialistCount, onClick: kpi("cases", "specialist") },
          ]}
        />
        <StatCard
          icon="users"
          tone="info"
          title="Worker roster coverage"
          value={metrics.totalWorkers}
          note="active personnel"
          onOpen={kpi("workers")}
          rows={[
            { label: "Healthcare clinicians", value: `${metrics.cliniciansCount} active`, onClick: kpi("workers", "clinical") },
            { label: "Corporate & operations", value: `${metrics.corporateCount} active`, onClick: kpi("workers", "corporate") },
            { label: "Workers with data gaps", value: `${metrics.gapsCount} detected`, alert: metrics.gapsCount > 0, onClick: kpi("workers", "gaps") },
          ]}
        />
        <StatCard
          icon="clock"
          tone="ok"
          title="Automated labor saved"
          value={metrics.hoursSaved}
          unit="hrs"
          note="+38% vs last month"
          onOpen={kpi("labor")}
          rows={[
            { label: "Automated follow-ups sent", value: `${metrics.followupsCount} this month`, onClick: kpi("labor", "followups") },
            { label: "Verified fast closures", value: `${metrics.closuresCount} cases`, onClick: kpi("labor", "closures") },
            { label: "Average remediation time", value: "1.4 days (was 8.2)", onClick: kpi("labor", "velocity") },
          ]}
        />
      </div>

      <PacksTable />

      <div className="split">
        <Panel
          title="Urgent gaps & remediation queue"
          subtitle="Highest priority first"
          flush
          actions={<Button size="sm" variant="ghost" onClick={() => setTab("cases")}>View all</Button>}
        >
          {urgent.length === 0 ? (
            <EmptyState title="No open gaps">Add a worker or sync HRMS to evaluate active requirements.</EmptyState>
          ) : (
            <ul className="queue">
              {urgent.map((c) => (
                <li key={c.id} className={`queue-item prio-${c.priority.toLowerCase()}`}>
                  <button className="queue-main" onClick={() => openModal("case", c.id)}>
                    <Avatar name={c.worker} size={30} />
                    <span className="queue-text">
                      <strong>{c.obligation}</strong>
                      <span>
                        {c.worker} <span className="sep">/</span> due <span className="due">{c.due}</span>
                      </span>
                    </span>
                    <Status value={c.priority} />
                  </button>
                  <Button size="sm" icon="zap" onClick={() => actions.chaseCase(c.id)}>Follow up</Button>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title="Live orchestrator feed"
          subtitle="Every action is signed and logged"
          actions={<Button size="sm" variant="ghost" onClick={() => setTab("audit")}>View all</Button>}
        >
          {data.auditLogs.length === 0 ? (
            <EmptyState icon="history" title="Orchestrator on standby">Events stream here automatically after a sync or action.</EmptyState>
          ) : (
            <ol className="feed">
              {data.auditLogs.slice(0, 6).map((log, idx) => (
                <li key={log.time + idx}>
                  <button onClick={() => openModal("audit", idx)}>
                    <time>{log.time.split(" ")[1]}</time>
                    <span className="feed-dot" />
                    <span className="feed-text">
                      <span className="feed-type">{log.type.replace(/_/g, " ").toLowerCase()}</span>
                      {log.action}
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          )}
        </Panel>
      </div>
    </div>
  );
}
