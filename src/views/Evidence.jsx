import Icon from "../components/Icon";
import { Button, EmptyState, Panel, Status } from "../components/ui";
import { useApp } from "../state/AppContext";

function Inspector() {
  const { data, selectedEvidenceId, actions } = useApp();
  const ev = data.evidence.find((e) => e.id === selectedEvidenceId);

  if (!ev) {
    return (
      <Panel title="AI OCR field inspector" actions={<Status value="Standby" tone="muted" />} className="inspector">
        <EmptyState icon="scan" title="Select a document">
          Choose any document in the queue to see extracted fields, confidence and verification status.
        </EmptyState>
      </Panel>
    );
  }

  const closed = ev.status === "Verified & Closed";
  const conf = parseFloat(ev.confidence);

  return (
    <Panel title="AI OCR field inspector" actions={<Status value={`${ev.confidence} match`} tone="ok" />} className="inspector">
      <div className="doc-preview">
        <div className="doc-sheet">
          <span className="doc-scanline" />
          <Icon name="file" size={26} />
          <strong>{ev.doc}</strong>
          <span className="code">{ev.id}</span>
        </div>
        <div className="confidence">
          <span>OCR confidence</span>
          <strong>{ev.confidence}</strong>
          <span className="confidence-track">
            <span style={{ width: `${conf}%` }} />
          </span>
        </div>
      </div>

      <dl className="fields">
        <div><dt>Document</dt><dd>{ev.doc}</dd></div>
        <div><dt>License / cert #</dt><dd className="code accent">{ev.docNo || "RN-884920"}</dd></div>
        <div><dt>Worker</dt><dd>{ev.worker}</dd></div>
        <div><dt>Matched rule</dt><dd className="code">{ev.rule}</dd></div>
        <div><dt>Expiration date</dt><dd className="text-ok strong">{ev.expiry || "2028-10-14"}</dd></div>
        <div><dt>Status</dt><dd><Status value={ev.status} /></dd></div>
      </dl>

      <Button variant="primary" icon={closed ? "lock" : "check"} className="w100" disabled={closed} onClick={() => actions.approveEvidence(ev.id)}>
        {closed ? "Verified and closed" : "Confirm AI verification & close case"}
      </Button>
    </Panel>
  );
}

export default function Evidence() {
  const { data, openModal, selectedEvidenceId, setSelectedEvidenceId } = useApp();

  return (
    <div className="view">
      <div className="split split-evidence">
        <Panel
          title="Submitted evidence intake queue"
          subtitle={`${data.evidence.length} documents, newest first`}
          flush
          actions={<Button variant="primary" size="sm" icon="upload" onClick={() => openModal("upload")}>Upload document</Button>}
        >
          {data.evidence.length === 0 ? (
            <EmptyState icon="upload" title="No evidence submitted yet" action={<Button variant="primary" icon="upload" onClick={() => openModal("upload")}>Upload document</Button>}>
              Upload a license, certificate or form to run AI verification.
            </EmptyState>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Document</th>
                    <th>Worker</th>
                    <th className="num">AI confidence</th>
                    <th>Status</th>
                    <th aria-label="Action" />
                  </tr>
                </thead>
                <tbody>
                  {data.evidence.map((ev) => (
                    <tr
                      key={ev.id}
                      className={`is-clickable ${selectedEvidenceId === ev.id ? "is-selected" : ""}`}
                      onClick={() => setSelectedEvidenceId(ev.id)}
                    >
                      <td>
                        <div className="cell-doc">
                          <Icon name="file" size={16} />
                          <div>
                            <strong>{ev.doc}</strong>
                            <span className="code muted">{ev.docNo}</span>
                          </div>
                        </div>
                      </td>
                      <td className="muted-strong">{ev.worker}</td>
                      <td className="num text-ok strong">{ev.confidence}</td>
                      <td><Status value={ev.status} /></td>
                      <td className="row-end">
                        <Button size="sm" variant="ghost">Inspect</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
        <Inspector />
      </div>
    </div>
  );
}
