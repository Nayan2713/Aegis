import { useEffect, useMemo, useRef, useState } from "react";
import Icon from "./Icon";
import { Button, IconButton, Avatar } from "./ui";
import { useApp } from "../state/AppContext";
import { CURRENT_USER, PACKS } from "../data/demoData";

function useClickOutside(ref, onOut) {
  useEffect(() => {
    const h = (e) => ref.current && !ref.current.contains(e.target) && onOut();
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [ref, onOut]);
}

function GlobalSearch() {
  const { data, openModal, setTab, setSelectedEvidenceId } = useApp();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const wrap = useRef(null);
  const input = useRef(null);
  useClickOutside(wrap, () => setOpen(false));

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName)) {
        e.preventDefault();
        input.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (term.length < 2) return [];
    const has = (...v) => v.some((x) => (x || "").toLowerCase().includes(term));
    const out = [];
    data.workers.filter((w) => has(w.name, w.role, w.facility, w.id)).slice(0, 5).forEach((w) =>
      out.push({ kind: "Worker", id: w.id, title: w.name, meta: `${w.role}, ${w.facility}`, go: () => openModal("worker", w.id) })
    );
    data.cases.filter((c) => has(c.id, c.worker, c.obligation, c.gap)).slice(0, 4).forEach((c) =>
      out.push({ kind: "Case", id: c.id, title: c.obligation, meta: `${c.id} for ${c.worker}`, go: () => openModal("case", c.id) })
    );
    data.evidence.filter((e) => has(e.doc, e.worker, e.docNo, e.id)).slice(0, 4).forEach((e) =>
      out.push({ kind: "Evidence", id: e.id, title: e.doc, meta: e.worker, go: () => { setTab("evidence"); setSelectedEvidenceId(e.id); } })
    );
    PACKS.filter((p) => has(p.name, p.short)).forEach((p) =>
      out.push({ kind: "Pack", id: `p${p.num}`, title: p.name, meta: p.ver, go: () => openModal("pack", p.num) })
    );
    data.customControls.filter((c) => has(c.id, c.name, c.condition)).slice(0, 3).forEach((c) =>
      out.push({ kind: "Control", id: c.id, title: c.name, meta: c.id, go: () => setTab("controls") })
    );
    return out;
  }, [q, data, openModal, setTab, setSelectedEvidenceId]);

  return (
    <div className="search" ref={wrap}>
      <Icon name="search" size={16} className="search-icon" />
      <input
        ref={input}
        value={q}
        onChange={(e) => { setQ(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Escape") { setOpen(false); e.currentTarget.blur(); }
          if (e.key === "Enter" && results[0]) { results[0].go(); setOpen(false); setQ(""); }
        }}
        placeholder="Search workers, cases, evidence"
        aria-label="Search"
      />
      <kbd className="search-kbd">/</kbd>
      {open && q.trim().length >= 2 && (
        <div className="search-results" role="listbox">
          {results.length === 0 ? (
            <div className="search-empty">No matches for “{q}”. Try a worker name, case ID or document type.</div>
          ) : (
            results.map((r) => (
              <button
                key={r.kind + r.id}
                className="search-result"
                onClick={() => { r.go(); setOpen(false); setQ(""); }}
              >
                <span className={`search-kind kind-${r.kind.toLowerCase()}`}>{r.kind}</span>
                <span className="search-text">
                  <strong>{r.title}</strong>
                  <span>{r.meta}</span>
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function MoreMenu() {
  const { openModal, actions } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false));
  const item = (icon, label, fn) => (
    <button className="menu-item" onClick={() => { setOpen(false); fn(); }}>
      <Icon name={icon} size={16} />
      {label}
    </button>
  );
  return (
    <div className="menu-wrap" ref={ref}>
      <IconButton icon="more" label="More data actions" onClick={() => setOpen((o) => !o)} aria-expanded={open} />
      {open && (
        <div className="menu" role="menu">
          {item("upload", "Import roster (CSV / Excel)", () => openModal("import"))}
          {item("database", "Reload demo data", actions.resetDemo)}
        </div>
      )}
    </div>
  );
}

export default function Topbar({ onMenu }) {
  const { openModal, actions, setChatOpen, busy } = useApp();

  return (
    <header className="topbar">
      <IconButton icon="menu" label="Open navigation" className="only-mobile" onClick={onMenu} />
      <GlobalSearch />

      <div className="topbar-actions">
        <span className="date-range">
          <Icon name="calendar" size={15} />
          Oct 1 – Oct 31, 2026
        </span>
        <Button icon="userPlus" onClick={() => openModal("addWorker")} className="hide-md">Add worker</Button>
        <Button icon="refresh" onClick={actions.syncHrms} loading={busy.sync} className="hide-md">Sync HRMS</Button>
        <MoreMenu />
        <Button variant="primary" icon="plus" onClick={() => openModal("upload")}>Intake evidence</Button>
        <span className="topbar-divider" />
        <button className="bell" onClick={() => setChatOpen(true)} aria-label="Open AI coworker" title="Open Slack/Teams AI coworker">
          <Icon name="bell" size={18} />
          <span className="bell-dot" />
        </button>
        <button className="me" onClick={() => setChatOpen(true)}>
          <Avatar name="Sathinath P" size={32} tone="me" />
          <span className="me-text">
            <strong>{CURRENT_USER.name}</strong>
            <span>{CURRENT_USER.role}</span>
          </span>
        </button>
      </div>
    </header>
  );
}
