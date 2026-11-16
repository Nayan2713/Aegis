import { useState } from "react";
import { Avatar, Button, EmptyState, PackChip, Panel, Status } from "../components/ui";
import { useApp } from "../state/AppContext";

const FILTERS = ["All", "High", "Medium", "Low"];

export default function Cases() {
  const { data, actions, openModal } = useApp();
  const [prio, setPrio] = useState("All");
  const rows = data.cases.filter((c) => prio === "All" || c.priority === prio);

  return (
    <div className="view">
      <Panel
        title="Remediation cases & follow-up queue"
        subtitle="Aegis auto-chases missing documents and expiring credentials across Slack and email."
        flush
        actions={
          <>
            <div className="segmented" role="tablist" aria-label="Priority">
              {FILTERS.map((f) => (
                <button key={f} role="tab" aria-selected={prio === f} className={prio === f ? "is-on" : ""} onClick={() => setPrio(f)}>
                  {f}
                  <span>{f === "All" ? data.cases.length : data.cases.filter((c) => c.priority === f).length}</span>
                </button>
              ))}
            </div>
            <Button variant="primary" icon="zap" onClick={actions.dispatchReminders}>Auto-chase all missing</Button>
          </>
        }
      >
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Case</th>
                <th>Worker</th>
                <th>Pack / obligation</th>
                <th>Identified gap</th>
                <th>Cadence stage</th>
                <th>Owner</th>
                <th>Due</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={8}>
                    <EmptyState title={data.cases.length ? `No ${prio.toLowerCase()} priority cases` : "All cases resolved"}>
                      {data.cases.length ? "Switch the filter to see the rest of the queue." : "No open compliance exceptions are active."}
                    </EmptyState>
                  </td>
                </tr>
              )}
              {rows.map((c) => (
                <tr key={c.id} className={`is-clickable prio-row prio-${c.priority.toLowerCase()}`} onClick={() => openModal("case", c.id)}>
                  <td>
                    <span className="code">{c.id}</span>
                    <div className="mt4">
                      <Status value={c.priority} />
                    </div>
                  </td>
                  <td>
                    <div className="cell-person">
                      <Avatar name={c.worker} size={28} />
                      <strong>{c.worker}</strong>
                    </div>
                  </td>
                  <td>
                    <PackChip pack={c.pack} />
                    <div className="muted mt4">{c.obligation}</div>
                  </td>
                  <td className="text-risk gap-cell">{c.gap}</td>
                  <td>
                    <span className="stage">{c.stage}</span>
                  </td>
                  <td className="muted">{c.owner}</td>
                  <td className="due nowrap">{c.due}</td>
                  <td className="row-end" onClick={(e) => e.stopPropagation()}>
                    <div className="row-actions">
                      <Button size="sm" icon="zap" onClick={() => actions.chaseCase(c.id)}>Follow up</Button>
                      <Button size="sm" variant="ghost" icon="check" onClick={() => actions.resolveCase(c.id)} title="Mark resolved" />
                    </div>
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
