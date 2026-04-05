import { useState } from "react";
import { AuthProvider, useAuth } from "./data/AuthContext";
import { DataProvider } from "./data/DataContext";
import BottomNav from "./components/BottomNav";
import HomeTab from "./components/HomeTab";
import HappyJarTab from "./components/HappyJarTab";
import SOSTab from "./components/SOSTab";
import FeedTab from "./components/FeedTab";
import MyCornerTab from "./components/MyCornerTab";
import AuthScreen from "./components/AuthScreen";
import PairingScreen from "./components/PairingScreen";
import SendLoveModal from "./components/SendLoveModal";
import AdminPanel from "./components/AdminPanel";
import { Heart } from "lucide-react";

function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-dvh bg-cream">
      <Heart size={32} className="text-peach-dark animate-pulse" />
    </div>
  );
}

function MainApp() {
  const { user } = useAuth();
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
        <main className="min-h-dvh">{panels[activeTab]}</main>
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
        <SendLoveModal />
        {adminOpen && user?.is_admin ? <AdminPanel onClose={() => setAdminOpen(false)} /> : null}
      </div>
    </DataProvider>
  );
}

function AppRouter() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!user) return <AuthScreen />;
  if (!user.partner_email) return <PairingScreen />;
  return <MainApp />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}
