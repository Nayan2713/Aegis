import { useState } from "react";
import { Button, EmptyState, Panel } from "../components/ui";
import { useApp } from "../state/AppContext";
import { exportAuditLog } from "../data/exporters";

export default function Audit() {
  const { data, openModal, toast } = useApp();
  const [type, setType] = useState("all");
  const types = [...new Set(data.auditLogs.map((l) => l.type))];
  const rows = data.auditLogs.map((l, i) => ({ ...l, idx: i })).filter((l) => type === "all" || l.type === type);

  return (
    <div className="view">
      <Panel
        title="Immutable compliance audit log"
        subtitle="Every evaluation, request and closure, signed with a SHA-256 proof."
        flush
        actions={
          <>
            <select className="select-sm" value={type} onChange={(e) => setType(e.target.value)} aria-label="Event type">
              <option value="all">All events</option>
              {types.map((t) => (
                <option key={t} value={t}>{t.replace(/_/g, " ").toLowerCase()}</option>
              ))}
            </select>
            <Button
              icon="download"
              onClick={() => {
                exportAuditLog(data.auditLogs);
                toast("Audit log exported as CSV", "success");
              }}
            >
              Export log
            </Button>
          </>
        }
      >
        {rows.length === 0 ? (
          <EmptyState icon="history" title="No audit records yet">All actions will be logged here with cryptographic proof.</EmptyState>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Event</th>
                  <th>Subject</th>
                  <th>Action performed</th>
                  <th>Actor</th>
                  <th>Proof</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((log) => (
                  <tr key={log.time + log.idx} className="is-clickable" onClick={() => openModal("audit", log.idx)}>
                    <td className="code muted nowrap">{log.time}</td>
                    <td><span className={`event event-${log.type.split("_")[0].toLowerCase()}`}>{log.type.replace(/_/g, " ").toLowerCase()}</span></td>
                    <td><strong>{log.subject}</strong></td>
                    <td className="action-cell">{log.action}</td>
                    <td className="muted nowrap">{log.actor}</td>
                    <td className="code accent nowrap">{log.proof}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
