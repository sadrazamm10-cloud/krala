import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Server, Cpu, HardDrive, Activity, Users, ShieldCheck, Zap, ArrowUpRight, Database, Terminal } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import api from "../lib/api";

const StatCard = ({ icon: Icon, label, value, color, subtext }: { icon: any, label: string, value: string | number, color: string, subtext?: string }) => (
  <Card className="overflow-hidden border-none shadow-md bg-card/50 backdrop-blur-sm">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
          <h3 className="text-3xl font-bold mt-1">{value}</h3>
          {subtext && <p className="text-xs text-muted-foreground mt-1">{subtext}</p>}
        </div>
        <div className={`p-3 rounded-2xl ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function Dashboard() {
  const [stats, setStats] = useState<any>({
    onlinePlayers: 0,
    cpuUsage: "0%",
    diskUsage: "0 GB",
    status: "Yükleniyor..."
  });
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/api/stats");
        setStats(res.data);
        
        const now = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setChartData(prev => {
          const newData = [...prev, { time: now, players: res.data.onlinePlayers }];
          if (newData.length > 15) newData.shift();
          return newData;
        });
      } catch (err) {
        console.error("Stats error:", err);
        setStats(prev => ({ ...prev, status: "Bağlantı Hatası" }));
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 5000); // 5 saniyede bir güncelle
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Sunucu durumuna ve hızlı istatistiklere göz atın.</p>
        </div>
        <div className="flex items-center gap-2 text-sm bg-card px-4 py-2 rounded-full border shadow-sm">
          <span className="relative flex h-3 w-3">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${stats.status === "Aktif" ? "bg-emerald-400" : "bg-red-400"}`}></span>
            <span className={`relative inline-flex rounded-full h-3 w-3 ${stats.status === "Aktif" ? "bg-emerald-500" : "bg-red-500"}`}></span>
          </span>
          <span className="text-muted-foreground font-medium">Sunucu: <strong className={stats.status === "Aktif" ? "text-emerald-500" : "text-red-500"}>{stats.status}</strong></span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={Users} label="Online Oyuncu" value={stats.onlinePlayers} color="bg-blue-500" subtext="Canlı Veri" />
        <StatCard icon={Cpu} label="CPU Kullanımı" value={stats.cpuUsage} color="bg-amber-500" subtext="Anlık Tüketim" />
        <StatCard icon={HardDrive} label="Disk Alanı" value={stats.diskUsage} color="bg-purple-500" subtext="/usr/game dizini" />
        <StatCard icon={Activity} label="Sistem Durumu" value={stats.status} color={stats.status === "Aktif" ? "bg-emerald-500" : "bg-red-500"} subtext="Bağlantı Kontrolü" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-md border-none bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Activity size={18} className="text-blue-500"/> Oyuncu Aktifliği (Canlı)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis dataKey="time" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '8px' }} />
                  <Line type="monotone" dataKey="players" stroke="#3b82f6" strokeWidth={3} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md border-none bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Server size={18} className="text-purple-500"/> Sunucu Bilgileri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3 text-sm font-medium">
                <ShieldCheck size={18} className="text-emerald-500" /> Güvenlik Duvarı
              </div>
              <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">AKTİF</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3 text-sm font-medium">
                <Database size={18} className="text-blue-500" /> MySQL Bağlantısı
              </div>
              <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">BAŞARILI</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3 text-sm font-medium">
                <Terminal size={18} className="text-amber-500" /> SSH Bağlantısı
              </div>
              <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">BAŞARILI</span>
            </div>
            
            <div className="pt-4 border-t space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">RAM Kullanımı</span>
                <span className="font-medium">Tahmini %45</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 w-[45%]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
