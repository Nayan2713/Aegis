import { useState } from "react";
import Icon from "../components/Icon";
import { Avatar, Button, EmptyState, Panel, Status } from "../components/ui";
import { useApp } from "../state/AppContext";
import { filterWorkers } from "../data/metrics";

const SEGMENTS = [
  { key: "all", label: "All" },
  { key: "clinical", label: "Clinical" },
  { key: "corporate", label: "Corporate" },
  { key: "gaps", label: "With gaps" },
];

export default function Workers() {
  const { data, openModal } = useApp();
  const [seg, setSeg] = useState("all");
  const [q, setQ] = useState("");

  const rows = filterWorkers(data.workers, seg).filter(
    (w) => !q || `${w.name} ${w.role} ${w.facility} ${w.id}`.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="view">
      <Panel
        title="Workforce compliance register"
        subtitle="Unified roster with per-pack compliance readiness."
        flush
        actions={
          <>
            <div className="mini-search">
              <Icon name="search" size={14} />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find a worker" aria-label="Find a worker" />
            </div>
            <div className="segmented" role="tablist" aria-label="Segment">
              {SEGMENTS.map((s) => (
                <button key={s.key} role="tab" aria-selected={seg === s.key} className={seg === s.key ? "is-on" : ""} onClick={() => setSeg(s.key)}>
                  {s.label}
                  <span>{filterWorkers(data.workers, s.key).length}</span>
                </button>
              ))}
            </div>
            <Button icon="upload" onClick={() => openModal("import")}>Upload CSV roster</Button>
            <Button variant="primary" icon="userPlus" onClick={() => openModal("addWorker")}>Add worker</Button>
          </>
        }
      >
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Worker</th>
                <th>Role & facility</th>
                <th>Onboarding</th>
                <th>Healthcare credentials</th>
                <th>Immigration</th>
                <th>Payroll / tax</th>
                <th>Overall</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={8}>
                    {data.workers.length === 0 ? (
                      <EmptyState icon="users" title="No workers enrolled yet" action={<Button variant="primary" icon="userPlus" onClick={() => openModal("addWorker")}>Add worker</Button>}>
                        Add a worker or upload a CSV roster to start monitoring.
                      </EmptyState>
                    ) : (
                      <EmptyState icon="search" title="No workers match">Try another name or segment.</EmptyState>
                    )}
                  </td>
                </tr>
              )}
              {rows.map((w) => (
                <tr key={w.id} className="is-clickable" onClick={() => openModal("worker", w.id)}>
                  <td>
                    <div className="cell-person">
                      <Avatar name={w.name} size={32} />
                      <div>
                        <strong>{w.name}</strong>
                        <span className="code muted">{w.id}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    {w.role}
                    <div className="muted">{w.facility}</div>
                  </td>
                  <td><Status value={w.onboard || "Pass"} /></td>
                  <td><Status value={w.hc} /></td>
                  <td><Status value={w.imm} /></td>
                  <td><Status value={w.tax} /></td>
                  <td>
                    <Status value={w.overall} dot={false} tone={w.overall.includes("100%") ? "ok" : "warn"}>
                      {w.overall.includes("100%") ? "Verified 100%" : "Pending action"}
                    </Status>
                  </td>
                  <td className="row-end">
                    <Button size="sm" variant="ghost">Details</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
