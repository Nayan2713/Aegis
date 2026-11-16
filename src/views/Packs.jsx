import Icon from "../components/Icon";
import { Button, Meter, Panel, Status, Tag } from "../components/ui";
import { useApp } from "../state/AppContext";
import { PACKS } from "../data/demoData";

export default function Packs() {
  const { data, openModal } = useApp();

  return (
    <div className="view">
      <Panel title="Versioned compliance skill packs" subtitle="Active regulatory and internal controls with assigned owners and schedules.">
        <div className="pack-grid">
          {PACKS.map((p) => {
            const gaps = data.cases.filter((c) => c.pack === p.key).length;
            const slug = p.key.toLowerCase().replace(/[^a-z]/g, "");
            return (
              <article key={p.num} className={`pack-card pack-${slug}`}>
                <header>
                  <span className={`pack-glyph lg pack-${slug}`}>
                    <Icon name={p.icon} size={20} />
                  </span>
                  <div className="pack-card-meta">
                    <Tag mono>{p.ver}</Tag>
                    {p.pilot && <Tag>Pilot</Tag>}
                  </div>
                </header>
                <h3>{p.name}</h3>
                <p>{p.desc}</p>
                <div className="pack-card-stats">
                  <div>
                    <span>Verified</span>
                    <strong>{p.verified}%</strong>
                    <Meter value={p.verified} tone={p.verified >= 95 ? "ok" : "warn"} />
                  </div>
                  <div>
                    <span>Rules</span>
                    <strong>{p.rules.length}</strong>
                  </div>
                  <div>
                    <span>Open gaps</span>
                    <strong className={gaps ? "text-risk" : "text-ok"}>{gaps}</strong>
                  </div>
                </div>
                <footer>
                  <span className="muted">Owner: {p.ownerLead}</span>
                  <Status value="Activated" />
                </footer>
                <Button className="w100" onClick={() => openModal("pack", p.num)}>View rules</Button>
              </article>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}
