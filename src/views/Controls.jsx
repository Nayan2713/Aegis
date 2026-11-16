import { useState } from "react";
import Icon from "../components/Icon";
import { Button, PackChip, Panel, Status } from "../components/ui";
import { useApp } from "../state/AppContext";

const EXAMPLES = [
  "Request renewals 30 days before expiration and escalate after two unanswered reminders.",
  "Flag any clinician without a TB screening in the last 12 months.",
  "Escalate unsigned handbook acknowledgments to HR after 7 days.",
];

export default function Controls() {
  const { data, actions } = useApp();
  const [text, setText] = useState("");
  const [pack, setPack] = useState("Custom");

  const submit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    actions.draftRule(text.trim(), pack);
    setText("");
  };

  return (
    <div className="view">
      <section className="drafter">
        <div className="drafter-head">
          <span className="drafter-icon">
            <Icon name="sparkles" size={18} />
          </span>
          <div>
            <h2>Draft a control in plain language</h2>
            <p>Describe the rule. Aegis turns it into an evaluation condition and activates it in the registry.</p>
          </div>
        </div>
        <form className="drafter-form" onSubmit={submit}>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="e.g. Request renewals 30 days before expiration and escalate after two unanswered reminders."
            aria-label="Rule description"
          />
          <select value={pack} onChange={(e) => setPack(e.target.value)} aria-label="Pack">
            {["Custom", "Healthcare", "Onboarding", "Immigration", "Tax/Payroll"].map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
          <Button variant="primary" type="submit" icon="sparkles" disabled={!text.trim()}>Draft & activate</Button>
        </form>
        <div className="drafter-examples">
          <span>Try:</span>
          {EXAMPLES.map((ex) => (
            <button key={ex} onClick={() => setText(ex)}>{ex}</button>
          ))}
        </div>
      </section>

      <Panel title="Control registry" subtitle={`${data.customControls.length} controls, ${data.customControls.filter((c) => c.status === "Active").length} active`} flush>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Control ID</th>
                <th>Pack</th>
                <th>Requirement</th>
                <th>Evaluation condition</th>
                <th>Remediation cadence</th>
                <th>Status</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {data.customControls.map((c) => (
                <tr key={c.id}>
                  <td><span className="code">{c.id}</span></td>
                  <td><PackChip pack={c.pack} /></td>
                  <td><strong>{c.name}</strong></td>
                  <td className="muted cond-cell">{c.condition}</td>
                  <td>{c.cadence}</td>
                  <td><Status value={c.status} /></td>
                  <td className="row-end">
                    <Button size="sm" variant="ghost" onClick={() => actions.toggleControl(c.id)}>
                      {c.status === "Active" ? "Pause" : "Activate"}
                    </Button>
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
