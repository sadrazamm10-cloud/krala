import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate } from "react-router-dom";
import { LayoutDashboard, FolderTree, Database, Terminal, Settings as SettingsIcon, Menu, X, LogOut, Users, UserCircle, ShieldCheck, Trophy, Zap, Box, ShoppingBag, ScrollText, Package, Lock, UserX, Heart, History, MessageSquare, Ban, Globe, Gift, Map, Medal, Home, Calendar, Megaphone, ShieldX, Sparkles, ShieldAlert, Ticket, Crown, Navigation, Store, RefreshCw, Server, ShieldAlert as ShieldAlertIcon, FileCode, HardDrive, ArrowRightLeft, MessageCircle, TrendingUp, MapPin, Bug, Wrench, Activity, Shield } from "lucide-react";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Toaster, toast } from "sonner";
import { AppProvider, useAppContext } from "./context/AppContext";
import Dashboard from "./pages/Dashboard";
import FileExplorer from "./pages/FileExplorer";
import DatabaseManager from "./pages/DatabaseManager";
import Console from "./pages/Console";
import SetupPage from "./pages/SetupPage";
import PlayerManager from "./pages/PlayerManager";
import AccountManager from "./pages/AccountManager";
import Settings from "./pages/Settings";
import GMManager from "./pages/GMManager";
import GuildManager from "./pages/GuildManager";
import ServerSettings from "./pages/ServerSettings";
import GameData from "./pages/GameData";
import ShopManager from "./pages/ShopManager";
import QuestManager from "./pages/QuestManager";
import InventoryManager from "./pages/InventoryManager";
import SafeboxManager from "./pages/SafeboxManager";
import PlayerDeletedManager from "./pages/PlayerDeletedManager";
import MarriageManager from "./pages/MarriageManager";
import LogViewer from "./pages/LogViewer";
import MessengerManager from "./pages/MessengerManager";
import AffectManager from "./pages/AffectManager";
import BanwordManager from "./pages/BanwordManager";
import PrivManager from "./pages/PrivManager";
import ItemAwardManager from "./pages/ItemAwardManager";
import LandManager from "./pages/LandManager";
import RankingManager from "./pages/RankingManager";
import ObjectManager from "./pages/ObjectManager";
import EventManager from "./pages/EventManager";
import NoticeManager from "./pages/NoticeManager";
import IPBanManager from "./pages/IPBanManager";
import ItemAttrManager from "./pages/ItemAttrManager";
import ChatLogManager from "./pages/ChatLogManager";
import WhisperLogManager from "./pages/WhisperLogManager";
import TradeLogManager from "./pages/TradeLogManager";
import MarketAnalytics from "./pages/MarketAnalytics";
import MapStatistics from "./pages/MapStatistics";
import HackLogManager from "./pages/HackLogManager";
import CouponManager from "./pages/CouponManager";
import VipManager from "./pages/VipManager";
import SkillManager from "./pages/SkillManager";
import RefineManager from "./pages/RefineManager";
import WarpManager from "./pages/WarpManager";
import ShopItemManager from "./pages/ShopItemManager";
import ServerControl from "./pages/ServerControl";
import SysLogViewer from "./pages/SysLogViewer";
import QuestCompiler from "./pages/QuestCompiler";
import ConfigEditor from "./pages/ConfigEditor";
import BackupManager from "./pages/BackupManager";
import ProtoSyncManager from "./pages/ProtoSyncManager";
import CoreCrashAnalyzer from "./pages/CoreCrashAnalyzer";
import MaintenanceManager from "./pages/MaintenanceManager";
import ServerPerformance from "./pages/ServerPerformance";
import DropManager from "./pages/DropManager";
import FirewallManager from "./pages/FirewallManager";

import SystemMappings from "./pages/SystemMappings";

const SidebarItem = ({ icon: Icon, label, to, active, isConnected }: { icon: any, label: string, to: string, active: boolean, isConnected: boolean }) => {
  if (!isConnected && to !== "/") {
    return (
      <div 
        onClick={() => toast.error("Lütfen önce SSH ve MySQL bağlantılarını sağlayın.")}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer hover:bg-muted text-muted-foreground opacity-50`}
      >
        <Lock size={20} />
        <span className="font-medium">{label}</span>
      </div>
    );
  }

  return (
    <Link to={to}>
      <div className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
        active ? "bg-primary text-primary-foreground shadow-lg" : "hover:bg-muted text-muted-foreground"
      }`}>
        <Icon size={20} />
        <span className="font-medium">{label}</span>
      </div>
    </Link>
  );
};

const Layout = ({ children, onLogout, isConnected }: { children: React.ReactNode, onLogout: () => void, isConnected: boolean }) => {
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 260 : 80 }}
        className="border-r bg-card flex flex-col z-20"
      >
        <div className="p-6 flex items-center justify-between">
          {isSidebarOpen && <h1 className="text-xl font-bold tracking-tighter">GAME PANEL</h1>}
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-muted rounded-md">
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          <SidebarItem icon={LayoutDashboard} label={isSidebarOpen ? "Dashboard" : ""} to="/" active={location.pathname === "/"} isConnected={isConnected} />
          
          <div className="pt-4 pb-2 px-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            {isSidebarOpen ? "Yönetim" : "---"}
          </div>
          <SidebarItem icon={Users} label={isSidebarOpen ? "Oyuncular" : ""} to="/players" active={location.pathname === "/players"} isConnected={isConnected} />
          <SidebarItem icon={UserX} label={isSidebarOpen ? "Silinenler" : ""} to="/players-deleted" active={location.pathname === "/players-deleted"} isConnected={isConnected} />
          <SidebarItem icon={Package} label={isSidebarOpen ? "Envanter" : ""} to="/inventory" active={location.pathname === "/inventory"} isConnected={isConnected} />
          <SidebarItem icon={Lock} label={isSidebarOpen ? "Depolar" : ""} to="/safebox" active={location.pathname === "/safebox"} isConnected={isConnected} />
          <SidebarItem icon={UserCircle} label={isSidebarOpen ? "Hesaplar" : ""} to="/accounts" active={location.pathname === "/accounts"} isConnected={isConnected} />
          <SidebarItem icon={Trophy} label={isSidebarOpen ? "Loncalar" : ""} to="/guilds" active={location.pathname === "/guilds"} isConnected={isConnected} />
          <SidebarItem icon={Heart} label={isSidebarOpen ? "Evlilikler" : ""} to="/marriages" active={location.pathname === "/marriages"} isConnected={isConnected} />
          <SidebarItem icon={MessageSquare} label={isSidebarOpen ? "Arkadaş Listeleri" : ""} to="/messenger" active={location.pathname === "/messenger"} isConnected={isConnected} />
          <SidebarItem icon={Zap} label={isSidebarOpen ? "Aktif Etkiler" : ""} to="/affects" active={location.pathname === "/affects"} isConnected={isConnected} />
          <SidebarItem icon={Gift} label={isSidebarOpen ? "Ödül Dağıtımı" : ""} to="/awards" active={location.pathname === "/awards"} isConnected={isConnected} />
          <SidebarItem icon={Map} label={isSidebarOpen ? "Lonca Arazileri" : ""} to="/lands" active={location.pathname === "/lands"} isConnected={isConnected} />
          <SidebarItem icon={Medal} label={isSidebarOpen ? "Sıralamalar" : ""} to="/ranking" active={location.pathname === "/ranking"} isConnected={isConnected} />
          <SidebarItem icon={Home} label={isSidebarOpen ? "Lonca Nesneleri" : ""} to="/objects" active={location.pathname === "/objects"} isConnected={isConnected} />
          <SidebarItem icon={Calendar} label={isSidebarOpen ? "Etkinlik Yönetimi" : ""} to="/events" active={location.pathname === "/events"} isConnected={isConnected} />
          <SidebarItem icon={Megaphone} label={isSidebarOpen ? "Duyuru Yönetimi" : ""} to="/notices" active={location.pathname === "/notices"} isConnected={isConnected} />
          <SidebarItem icon={ShieldX} label={isSidebarOpen ? "IP Engelleme" : ""} to="/ip-bans" active={location.pathname === "/ip-bans"} isConnected={isConnected} />
          <SidebarItem icon={Shield} label={isSidebarOpen ? "Gelişmiş Güvenlik" : ""} to="/firewall" active={location.pathname === "/firewall"} isConnected={isConnected} />
          <SidebarItem icon={ShieldAlert} label={isSidebarOpen ? "Hile Logları" : ""} to="/hack-logs" active={location.pathname === "/hack-logs"} isConnected={isConnected} />
          <SidebarItem icon={MessageSquare} label={isSidebarOpen ? "Sohbet Geçmişi" : ""} to="/chat-logs" active={location.pathname === "/chat-logs"} isConnected={isConnected} />
          <SidebarItem icon={MessageCircle} label={isSidebarOpen ? "Fısıltı Geçmişi" : ""} to="/whisper-logs" active={location.pathname === "/whisper-logs"} isConnected={isConnected} />
          <SidebarItem icon={ArrowRightLeft} label={isSidebarOpen ? "Ticaret Geçmişi" : ""} to="/trade-logs" active={location.pathname === "/trade-logs"} isConnected={isConnected} />
          <SidebarItem icon={TrendingUp} label={isSidebarOpen ? "Piyasa Analizi" : ""} to="/market-analytics" active={location.pathname === "/market-analytics"} isConnected={isConnected} />
          <SidebarItem icon={MapPin} label={isSidebarOpen ? "Oyuncu Dağılımı" : ""} to="/map-stats" active={location.pathname === "/map-stats"} isConnected={isConnected} />
          <SidebarItem icon={Ticket} label={isSidebarOpen ? "Hediye Kodları" : ""} to="/coupons" active={location.pathname === "/coupons"} isConnected={isConnected} />
          <SidebarItem icon={Crown} label={isSidebarOpen ? "VIP Oyuncular" : ""} to="/vips" active={location.pathname === "/vips"} isConnected={isConnected} />
          <SidebarItem icon={Zap} label={isSidebarOpen ? "Beceriler" : ""} to="/skills" active={location.pathname === "/skills"} isConnected={isConnected} />
          <SidebarItem icon={RefreshCw} label={isSidebarOpen ? "Yükseltmeler" : ""} to="/refines" active={location.pathname === "/refines"} isConnected={isConnected} />
          <SidebarItem icon={Navigation} label={isSidebarOpen ? "Işınlanma Noktaları" : ""} to="/warps" active={location.pathname === "/warps"} isConnected={isConnected} />
          <SidebarItem icon={Sparkles} label={isSidebarOpen ? "Efsun Oranları" : ""} to="/item-attrs" active={location.pathname === "/item-attrs"} isConnected={isConnected} />
          <SidebarItem icon={Ban} label={isSidebarOpen ? "Yasaklı Kelimeler" : ""} to="/banwords" active={location.pathname === "/banwords"} isConnected={isConnected} />
          <SidebarItem icon={Globe} label={isSidebarOpen ? "Sunucu Oranları" : ""} to="/privs" active={location.pathname === "/privs"} isConnected={isConnected} />
          <SidebarItem icon={Server} label={isSidebarOpen ? "Sunucu Kontrol" : ""} to="/server-control" active={location.pathname === "/server-control"} isConnected={isConnected} />
          <SidebarItem icon={Activity} label={isSidebarOpen ? "Performans Monitörü" : ""} to="/performance" active={location.pathname === "/performance"} isConnected={isConnected} />
          <SidebarItem icon={Bug} label={isSidebarOpen ? "Core Analizi (GDB)" : ""} to="/core-crash" active={location.pathname === "/core-crash"} isConnected={isConnected} />
          <SidebarItem icon={Wrench} label={isSidebarOpen ? "Kapsamlı Bakım" : ""} to="/maintenance" active={location.pathname === "/maintenance"} isConnected={isConnected} />
          <SidebarItem icon={ShieldAlertIcon} label={isSidebarOpen ? "Sistem Hataları" : ""} to="/syslogs" active={location.pathname === "/syslogs"} isConnected={isConnected} />
          <SidebarItem icon={FileCode} label={isSidebarOpen ? "Quest Derleyici" : ""} to="/quest-compiler" active={location.pathname === "/quest-compiler"} isConnected={isConnected} />
          <SidebarItem icon={SettingsIcon} label={isSidebarOpen ? "Çekirdek Ayarları" : ""} to="/config-editor" active={location.pathname === "/config-editor"} isConnected={isConnected} />
          <SidebarItem icon={HardDrive} label={isSidebarOpen ? "Yedekleme" : ""} to="/backups" active={location.pathname === "/backups"} isConnected={isConnected} />
          <SidebarItem icon={ArrowRightLeft} label={isSidebarOpen ? "Proto Senkron" : ""} to="/proto-sync" active={location.pathname === "/proto-sync"} isConnected={isConnected} />
          <SidebarItem icon={ShoppingBag} label={isSidebarOpen ? "Marketler" : ""} to="/shops" active={location.pathname === "/shops"} isConnected={isConnected} />
          <SidebarItem icon={Store} label={isSidebarOpen ? "Market İçerikleri" : ""} to="/shop-items" active={location.pathname === "/shop-items"} isConnected={isConnected} />
          <SidebarItem icon={Box} label={isSidebarOpen ? "Eşya Düşme (Drop)" : ""} to="/drops" active={location.pathname === "/drops"} isConnected={isConnected} />
          <SidebarItem icon={ScrollText} label={isSidebarOpen ? "Questler" : ""} to="/quests" active={location.pathname === "/quests"} isConnected={isConnected} />
          <SidebarItem icon={ShieldCheck} label={isSidebarOpen ? "GM Yönetimi" : ""} to="/gms" active={location.pathname === "/gms"} isConnected={isConnected} />
          <SidebarItem icon={History} label={isSidebarOpen ? "Sistem Logları" : ""} to="/logs" active={location.pathname === "/logs"} isConnected={isConnected} />
          
          <div className="pt-4 pb-2 px-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            {isSidebarOpen ? "Sistem" : "---"}
          </div>
          <SidebarItem icon={Zap} label={isSidebarOpen ? "Sunucu Ayarları" : ""} to="/server-settings" active={location.pathname === "/server-settings"} isConnected={isConnected} />
          <SidebarItem icon={Box} label={isSidebarOpen ? "Oyun Verileri" : ""} to="/game-data" active={location.pathname === "/game-data"} isConnected={isConnected} />
          <SidebarItem icon={FolderTree} label={isSidebarOpen ? "Dosyalar" : ""} to="/files" active={location.pathname === "/files"} isConnected={isConnected} />
          <SidebarItem icon={Database} label={isSidebarOpen ? "Veritabanı" : ""} to="/db" active={location.pathname === "/db"} isConnected={isConnected} />
          <SidebarItem icon={Terminal} label={isSidebarOpen ? "Console" : ""} to="/console" active={location.pathname === "/console"} isConnected={isConnected} />
        </nav>

        <div className="p-4 border-t space-y-2">
          <SidebarItem icon={SettingsIcon} label={isSidebarOpen ? "Ayarlar" : ""} to="/settings" active={location.pathname === "/settings"} isConnected={isConnected} />
          <SidebarItem icon={Database} label={isSidebarOpen ? "Yollar & Eşleştirmeler" : ""} to="/system-mappings" active={location.pathname === "/system-mappings"} isConnected={isConnected} />
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-destructive/10 text-destructive transition-all duration-200"
          >
            <LogOut size={20} />
            {isSidebarOpen && <span className="font-medium">Çıkış Yap</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="p-8"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
      <Toaster position="top-right" />
    </div>
  );
};

import ChatBot from "./components/ChatBot";

const MainApp = () => {
  const { isConnected, setConnected } = useAppContext();

  const handleLogout = () => {
    setConnected(false);
  };

  return (
    <Router>
      <Layout onLogout={handleLogout} isConnected={isConnected}>
        <Routes>
          <Route path="/" element={isConnected ? <Dashboard /> : <SetupPage />} />
          {isConnected && (
            <>
              <Route path="/players" element={<PlayerManager />} />
              <Route path="/players-deleted" element={<PlayerDeletedManager />} />
              <Route path="/inventory" element={<InventoryManager />} />
              <Route path="/safebox" element={<SafeboxManager />} />
              <Route path="/accounts" element={<AccountManager />} />
              <Route path="/guilds" element={<GuildManager />} />
              <Route path="/marriages" element={<MarriageManager />} />
              <Route path="/messenger" element={<MessengerManager />} />
              <Route path="/affects" element={<AffectManager />} />
              <Route path="/awards" element={<ItemAwardManager />} />
              <Route path="/lands" element={<LandManager />} />
              <Route path="/ranking" element={<RankingManager />} />
              <Route path="/objects" element={<ObjectManager />} />
              <Route path="/events" element={<EventManager />} />
              <Route path="/notices" element={<NoticeManager />} />
              <Route path="/ip-bans" element={<IPBanManager />} />
              <Route path="/firewall" element={<FirewallManager />} />
              <Route path="/hack-logs" element={<HackLogManager />} />
              <Route path="/chat-logs" element={<ChatLogManager />} />
              <Route path="/whisper-logs" element={<WhisperLogManager />} />
              <Route path="/trade-logs" element={<TradeLogManager />} />
              <Route path="/market-analytics" element={<MarketAnalytics />} />
              <Route path="/map-stats" element={<MapStatistics />} />
              <Route path="/coupons" element={<CouponManager />} />
              <Route path="/vips" element={<VipManager />} />
              <Route path="/skills" element={<SkillManager />} />
              <Route path="/refines" element={<RefineManager />} />
              <Route path="/warps" element={<WarpManager />} />
              <Route path="/item-attrs" element={<ItemAttrManager />} />
              <Route path="/banwords" element={<BanwordManager />} />
              <Route path="/privs" element={<PrivManager />} />
              <Route path="/server-control" element={<ServerControl />} />
              <Route path="/performance" element={<ServerPerformance />} />
              <Route path="/core-crash" element={<CoreCrashAnalyzer />} />
              <Route path="/maintenance" element={<MaintenanceManager />} />
              <Route path="/syslogs" element={<SysLogViewer />} />
              <Route path="/quest-compiler" element={<QuestCompiler />} />
              <Route path="/config-editor" element={<ConfigEditor />} />
              <Route path="/backups" element={<BackupManager />} />
              <Route path="/proto-sync" element={<ProtoSyncManager />} />
              <Route path="/gms" element={<GMManager />} />
              <Route path="/logs" element={<LogViewer />} />
              <Route path="/shops" element={<ShopManager />} />
              <Route path="/shop-items" element={<ShopItemManager />} />
              <Route path="/drops" element={<DropManager />} />
              <Route path="/quests" element={<QuestManager />} />
              <Route path="/server-settings" element={<ServerSettings />} />
              <Route path="/game-data" element={<GameData />} />
              <Route path="/files" element={<FileExplorer />} />
              <Route path="/db" element={<DatabaseManager />} />
              <Route path="/console" element={<Console />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/system-mappings" element={<SystemMappings />} />
            </>
          )}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
      <ChatBot />
    </Router>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
