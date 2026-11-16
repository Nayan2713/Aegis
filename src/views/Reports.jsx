import Icon from "../components/Icon";
import { Button } from "../components/ui";
import { useApp } from "../state/AppContext";
import { exportReport } from "../data/exporters";

export default function Reports() {
  const { data, metrics, toast, actions } = useApp();

  const reports = [
    {
      kind: "healthcare",
      icon: "stethoscope",
      title: "Healthcare Joint Commission audit pack",
      desc: "Verified license and credential coverage summary for every clinician.",
      stat: `${metrics.cliniciansCount} clinicians`,
    },
    {
      kind: "i9",
      icon: "passport",
      title: "Onboarding & I-9 verification audit",
      desc: "Ledger of signed electronic handbooks and USCIS I-9 verifications.",
      stat: `${metrics.totalWorkers} workers`,
    },
    {
      kind: "tax",
      icon: "receipt",
      title: "Tax & state withholding summary",
      desc: "Quarterly tax filing reconciliation records and state registration proofs.",
      stat: `${data.workers.filter((w) => w.tax === "Pass").length} reconciled`,
    },
  ];

  return (
    <div className="view">
      <div className="report-grid">
        {reports.map((r) => (
          <article key={r.kind} className="report">
            <div className="report-cover">
              <Icon name={r.icon} size={22} />
              <span className="report-stat">{r.stat}</span>
            </div>
            <h3>{r.title}</h3>
            <p>{r.desc}</p>
            <Button
              variant="primary"
              icon="download"
              className="w100"
              onClick={() => {
                exportReport(r.kind, data);
                actions.addAudit("REPORT_EXPORTED", r.title, `Exported ${r.title}.`);
                toast(`${r.title} downloaded`, "success");
              }}
            >
              Download report
            </Button>
          </article>
        ))}
      </div>
      <p className="footnote">Reports open as print-ready HTML. Use your browser's Print dialog to save them as PDF.</p>
    </div>
  );
}
