import Icon from "./Icon";
import { useApp } from "../state/AppContext";

const NAV = [
  {
    group: "Monitor",
    items: [
      { key: "overview", label: "Overview & health", icon: "home" },
      { key: "cases", label: "Remediation inbox", icon: "inbox", badge: "cases" },
      { key: "workers", label: "Worker register", icon: "users" },
      { key: "evidence", label: "Evidence & AI intake", icon: "scan", badge: "evidence" },
    ],
  },
  {
    group: "Govern",
    items: [
      { key: "packs", label: "Compliance packs", icon: "layers" },
      { key: "controls", label: "Custom controls", icon: "sliders" },
    ],
  },
  { group: "Connect", items: [{ key: "integrations", label: "HRMS & connectors", icon: "plug" }] },
  {
    group: "Prove",
    items: [
      { key: "audit", label: "Audit trail", icon: "history" },
      { key: "reports", label: "Reports", icon: "chart" },
    ],
  },
];

export default function Sidebar({ open, onNavigate }) {
  const { tab, setTab, data, metrics, toast } = useApp();
  const badges = { cases: data.cases.length, evidence: data.evidence.length };

  return (
    <aside className={`sidebar ${open ? "is-open" : ""}`}>
      <div className="brand">
        <span className="brand-mark">
          <Icon name="shield" size={18} stroke={2} />
        </span>
        <div>
          <span className="brand-name">Aegis</span>
          <span className="brand-tag">AI compliance coworker</span>
        </div>
      </div>

      <button className="tenant" onClick={() => toast(`Workspace: ${data.tenant.name} connected`, "info")}>
        <span className="tenant-avatar">BH</span>
        <span className="tenant-text">
          <span className="tenant-name">{data.tenant.name}</span>
          <span className="tenant-status">
            <i /> {data.tenant.status}
          </span>
        </span>
        <Icon name="chevronDown" size={16} />
      </button>

      <nav className="nav" aria-label="Main">
        {NAV.map((section) => (
          <div className="nav-section" key={section.group}>
            <span className="nav-group">{section.group}</span>
            {section.items.map((item) => {
              const count = item.badge ? badges[item.badge] : null;
              return (
                <a
                  key={item.key}
                  href={`#${item.key}`}
                  className={`nav-item ${tab === item.key ? "is-active" : ""}`}
                  aria-current={tab === item.key ? "page" : undefined}
                  onClick={(e) => {
                    e.preventDefault();
                    setTab(item.key);
                    onNavigate?.();
                  }}
                >
                  <Icon name={item.icon} size={17} />
                  <span className="nav-label">{item.label}</span>
                  {count != null && <span className={`nav-badge ${item.badge === "cases" && count > 0 ? "is-alert" : ""}`}>{count}</span>}
                </a>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="sidebar-foot">
        <div className="coverage-mini">
          <div className="coverage-mini-row">
            <span>Verified coverage</span>
            <strong>{metrics.passPct}%</strong>
          </div>
          <span className="coverage-mini-track">
            <span style={{ width: `${metrics.passPct}%` }} />
          </span>
        </div>
        <button className="nav-item settings" onClick={() => toast("Workspace settings", "info")}>
          <Icon name="settings" size={17} />
          <span className="nav-label">Settings</span>
          <Icon name="chevronRight" size={15} />
        </button>
      </div>
    </aside>
  );
}
