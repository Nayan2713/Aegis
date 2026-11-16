import Icon from "../components/Icon";
import { Button, Status } from "../components/ui";
import { useApp } from "../state/AppContext";

export default function Integrations() {
  const { actions, setChatOpen, openModal, busy, data } = useApp();
  const lastSync = data.auditLogs.find((l) => l.type === "HRMS_SYNC");

  const connectors = [
    {
      icon: "building",
      name: "HRMS Core API",
      status: <Status value="Active API" tone="ok" />,
      desc: "Primary authenticated integration importing workers, locations and assignments.",
      meta: lastSync ? `Last sync ${lastSync.time}` : "Not synced yet",
      action: <Button icon="refresh" loading={busy.sync} onClick={actions.syncHrms}>Sync webhook event</Button>,
    },
    {
      icon: "message",
      name: "Slack / Teams bot coworker",
      status: <Status value="Bot listening" tone="ok" />,
      desc: "Sends evidence requests, reminder escalations and daily executive digests.",
      meta: "#compliance-alerts",
      action: <Button icon="bot" onClick={() => setChatOpen(true)}>Open assistant</Button>,
    },
    {
      icon: "sheet",
      name: "CSV & Excel register",
      status: <Status value="Ready" tone="info" />,
      desc: "Lightweight spreadsheet register for companies without direct API access.",
      meta: "Columns: Name, Role, Facility, Department, Expiry",
      action: <Button icon="upload" onClick={() => openModal("import")}>Upload roster file</Button>,
    },
  ];

  return (
    <div className="view">
      <div className="connector-grid">
        {connectors.map((c) => (
          <article key={c.name} className="connector">
            <header>
              <span className="connector-icon">
                <Icon name={c.icon} size={20} />
              </span>
              {c.status}
            </header>
            <h3>{c.name}</h3>
            <p>{c.desc}</p>
            <span className="connector-meta">{c.meta}</span>
            <div className="connector-action">{c.action}</div>
          </article>
        ))}
      </div>
    </div>
  );
}
