import { useEffect, useRef } from "react";
import Icon from "./Icon";
import { initials } from "../data/metrics";

export function Button({ variant = "secondary", size = "md", icon, children, className = "", loading, ...rest }) {
  return (
    <button className={`btn btn-${variant} btn-${size} ${loading ? "is-loading" : ""} ${className}`} disabled={loading || rest.disabled} {...rest}>
      {loading ? <span className="spinner" aria-hidden="true" /> : icon ? <Icon name={icon} size={size === "sm" ? 14 : 16} /> : null}
      {children && <span>{children}</span>}
    </button>
  );
}

export function IconButton({ icon, label, className = "", ...rest }) {
  return (
    <button className={`icon-btn ${className}`} aria-label={label} title={label} {...rest}>
      <Icon name={icon} size={18} />
    </button>
  );
}

const TONES = {
  Pass: "ok",
  "Verified 100%": "ok",
  "Verified & Matched": "ok",
  "Verified & Closed": "sealed",
  Active: "ok",
  Activated: "ok",
  "Action Req": "risk",
  "Pending Action": "risk",
  Paused: "muted",
  "N/A": "muted",
  High: "risk",
  Medium: "warn",
  Low: "info",
};

export function toneFor(value) {
  return TONES[value] || "info";
}

export function Status({ value, tone, dot = true, children }) {
  const t = tone || toneFor(value);
  return (
    <span className={`status status-${t}`}>
      {dot && <i className="status-dot" />}
      {children || value}
    </span>
  );
}

export function Tag({ children, mono }) {
  return <span className={`tag ${mono ? "tag-mono" : ""}`}>{children}</span>;
}

export function Avatar({ name, size = 32, tone }) {
  const hue = [...(name || "")].reduce((a, c) => a + c.charCodeAt(0), 0) % 5;
  return (
    <span className={`avatar avatar-${tone || hue}`} style={{ width: size, height: size, fontSize: size * 0.38 }}>
      {initials(name)}
    </span>
  );
}

export function Panel({ title, subtitle, actions, children, className = "", flush }) {
  return (
    <section className={`panel ${className}`}>
      {(title || actions) && (
        <header className="panel-head">
          <div>
            {title && <h2 className="panel-title">{title}</h2>}
            {subtitle && <p className="panel-sub">{subtitle}</p>}
          </div>
          {actions && <div className="panel-actions">{actions}</div>}
        </header>
      )}
      <div className={flush ? "panel-body flush" : "panel-body"}>{children}</div>
    </section>
  );
}

export function EmptyState({ icon = "check", title, children, action }) {
  return (
    <div className="empty">
      <span className="empty-icon">
        <Icon name={icon} size={20} />
      </span>
      <strong>{title}</strong>
      {children && <p>{children}</p>}
      {action}
    </div>
  );
}

export function Modal({ title, subtitle, onClose, children, footer, width = 560, icon }) {
  const ref = useRef(null);
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    ref.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: width }} role="dialog" aria-modal="true" aria-label={title} tabIndex={-1} ref={ref}>
        <header className="modal-head">
          {icon && (
            <span className="modal-icon">
              <Icon name={icon} size={18} />
            </span>
          )}
          <div className="modal-titles">
            <h3>{title}</h3>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <IconButton icon="x" label="Close" onClick={onClose} />
        </header>
        <div className="modal-body">{children}</div>
        {footer && <footer className="modal-foot">{footer}</footer>}
      </div>
    </div>
  );
}

export function Field({ label, hint, children }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
      {hint && <span className="field-hint">{hint}</span>}
    </label>
  );
}

export function Meter({ value, tone = "ok" }) {
  return (
    <span className="meter" aria-label={`${value}%`}>
      <span className={`meter-fill meter-${tone}`} style={{ width: `${Math.min(100, value)}%` }} />
    </span>
  );
}

const PACK_ICONS = { Healthcare: "stethoscope", Onboarding: "users", Immigration: "passport", "Tax/Payroll": "receipt", Custom: "sparkles" };

export function PackChip({ pack }) {
  return (
    <span className={`pack-chip pack-${(pack || "custom").toLowerCase().replace(/[^a-z]/g, "")}`}>
      <Icon name={PACK_ICONS[pack] || "layers"} size={13} />
      {pack}
    </span>
  );
}

// Renders **bold** and newlines from chat / bot text safely
export function RichText({ text }) {
  return text.split("\n").map((line, i) => (
    <span key={i} className="rt-line">
      {line.split(/(\*\*[^*]+\*\*)/g).map((part, j) =>
        part.startsWith("**") && part.endsWith("**") ? <strong key={j}>{part.slice(2, -2)}</strong> : <span key={j}>{part}</span>
      )}
    </span>
  ));
}
