import { useState } from "react";
import { DataProvider } from "./data/DataContext";
import BottomNav from "./components/BottomNav";
import HomeTab from "./components/HomeTab";
import HappyJarTab from "./components/HappyJarTab";
import SOSTab from "./components/SOSTab";
import FeedTab from "./components/FeedTab";
import MyCornerTab from "./components/MyCornerTab";
import AdminPanel from "./components/AdminPanel";

export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [adminOpen, setAdminOpen] = useState(false);

  const panels = {
    home: <HomeTab onOpenAdmin={() => setAdminOpen(true)} />,
    jar: <HappyJarTab />,
    sos: <SOSTab />,
    corner: <MyCornerTab />,
    feed: <FeedTab />,
  };

  return (
    <DataProvider>
      <div className="relative mx-auto max-w-[480px] min-h-dvh bg-cream">
        <main className="min-h-dvh">
          {panels[activeTab]}
        </main>
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
        {adminOpen && <AdminPanel onClose={() => setAdminOpen(false)} />}
      </div>
    </DataProvider>
  );
}
