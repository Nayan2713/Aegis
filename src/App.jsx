import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import { ChatDrawer, PageHeader, Toasts } from "./components/Chrome";
import ModalHost from "./modals/Modals";
import { useApp } from "./state/AppContext";

import Overview from "./views/Overview";
import Cases from "./views/Cases";
import Workers from "./views/Workers";
import Evidence from "./views/Evidence";
import Packs from "./views/Packs";
import Controls from "./views/Controls";
import Integrations from "./views/Integrations";
import Audit from "./views/Audit";
import Reports from "./views/Reports";

const VIEWS = { overview: Overview, cases: Cases, workers: Workers, evidence: Evidence, packs: Packs, controls: Controls, integrations: Integrations, audit: Audit, reports: Reports };

export default function App() {
  const { tab } = useApp();
  const [navOpen, setNavOpen] = useState(false);
  const View = VIEWS[tab] || Overview;

  return (
    <div className="shell">
      <Sidebar open={navOpen} onNavigate={() => setNavOpen(false)} />
      {navOpen && <div className="scrim is-on nav-scrim" onClick={() => setNavOpen(false)} />}
      <main className="main">
        <Topbar onMenu={() => setNavOpen(true)} />
        <div className="workspace">
          <PageHeader />
          <View key={tab} />
        </div>
      </main>
      <ChatDrawer />
      <ModalHost />
      <Toasts />
    </div>
  );
}
