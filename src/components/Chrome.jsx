import { useEffect, useRef, useState } from "react";
import Icon from "./Icon";
import { IconButton, RichText } from "./ui";
import { useApp } from "../state/AppContext";
import { PAGES } from "../data/demoData";

export function PageHeader() {
  const { tab } = useApp();
  const [showPrinciple, setShowPrinciple] = useState(true);
  const page = PAGES[tab];

  return (
    <div className="page-head">
      <div className="page-titles">
        <span className="crumb">
          {page.group}
          <Icon name="chevronRight" size={13} />
          <span>{page.title}</span>
        </span>
        <h1>{page.title}</h1>
        <p>{page.sub}</p>
      </div>

      {showPrinciple && (
        <aside className="principle">
          <span className="principle-seal">
            <Icon name="shield" size={20} stroke={2} />
          </span>
          <div>
            <strong>Defensible 100% principle</strong>
            <p>
              Aegis reports only on approved, activated packs with accepted evidence. Obligations outside active scopes are
              classified as <span className="oos">Out of scope</span>.
            </p>
          </div>
          <IconButton icon="x" label="Dismiss" onClick={() => setShowPrinciple(false)} />
        </aside>
      )}
    </div>
  );
}

const PROMPTS = [
  "What is missing for new workers?",
  "Which credentials expire next month?",
  "Request the missing documents.",
  "What needs my approval?",
];

export function ChatDrawer() {
  const { chatOpen, setChatOpen, data, actions, botTyping } = useApp();
  const [text, setText] = useState("");
  const list = useRef(null);
  const input = useRef(null);

  useEffect(() => {
    if (list.current) list.current.scrollTop = list.current.scrollHeight;
  }, [data.chatHistory, botTyping, chatOpen]);

  useEffect(() => {
    if (chatOpen) setTimeout(() => input.current?.focus(), 200);
    const onKey = (e) => e.key === "Escape" && setChatOpen(false);
    if (chatOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [chatOpen, setChatOpen]);

  const submit = (e) => {
    e.preventDefault();
    const msg = text.trim();
    if (!msg) return;
    actions.sendChat(msg);
    setText("");
  };

  return (
    <>
      <div className={`scrim ${chatOpen ? "is-on" : ""}`} onClick={() => setChatOpen(false)} />
      <aside className={`drawer ${chatOpen ? "is-open" : ""}`} aria-hidden={!chatOpen} aria-label="Aegis AI coworker">
        <header className="drawer-head">
          <span className="bot-mark">
            <Icon name="shield" size={18} stroke={2} />
          </span>
          <div className="drawer-titles">
            <h3>
              Aegis AI coworker <span className="live">Live</span>
            </h3>
            <span>#compliance-alerts on Slack & Teams</span>
          </div>
          <IconButton icon="x" label="Close assistant" onClick={() => setChatOpen(false)} />
        </header>

        <div className="prompts">
          {PROMPTS.map((p) => (
            <button key={p} className="prompt" onClick={() => actions.sendChat(p)} disabled={botTyping}>
              {p.replace(/\.$/, "")}
            </button>
          ))}
        </div>

        <div className="messages" ref={list}>
          {data.chatHistory.map((m, i) => (
            <div key={i} className={`bubble-row ${m.sender}`}>
              <span className="bubble-author">{m.author}</span>
              <div className="bubble">
                <RichText text={m.text} />
              </div>
            </div>
          ))}
          {botTyping && (
            <div className="bubble-row bot">
              <span className="bubble-author">Aegis Coworker</span>
              <div className="bubble typing">
                <i /> <i /> <i />
              </div>
            </div>
          )}
        </div>

        <form className="composer" onSubmit={submit}>
          <input ref={input} value={text} onChange={(e) => setText(e.target.value)} placeholder="Ask Aegis or dispatch an action…" aria-label="Message" />
          <button type="submit" className="send" aria-label="Send" disabled={!text.trim()}>
            <Icon name="send" size={16} />
          </button>
        </form>
      </aside>
    </>
  );
}

export function Toasts() {
  const { toasts, dismissToast } = useApp();
  const icon = { success: "check", warning: "alert", info: "info" };
  return (
    <div className="toasts" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          <span className="toast-icon">
            <Icon name={icon[t.type] || "info"} size={15} stroke={2.2} />
          </span>
          <span className="toast-msg">{t.message}</span>
          <button onClick={() => dismissToast(t.id)} aria-label="Dismiss">
            <Icon name="x" size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
