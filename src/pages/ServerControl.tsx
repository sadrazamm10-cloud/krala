import { useState } from "react";
import { Play, Square, RefreshCw, Trash2, Terminal, Activity, Server, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import api from "../lib/api";

export default function ServerControl() {
  const [status, setStatus] = useState<"online" | "offline" | "starting">("online");
  const [loading, setLoading] = useState(false);

  const runCommand = async (cmd: string, label: string) => {
    setLoading(true);
    try {
      await api.post("/api/console/command", { command: cmd });
      toast.success(`${label} işlemi başarıyla başlatıldı.`);
    } catch (err: any) {
      toast.error(`${label} hatası: ` + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStart = () => {
    setStatus("starting");
    runCommand("cd /usr/game && sh start.sh", "Sunucu Başlatma");
    setTimeout(() => setStatus("online"), 5000);
  };

  const handleStop = () => {
    runCommand("cd /usr/game && sh close.sh", "Sunucu Durdurma");
    setStatus("offline");
  };

  const handleClearLogs = () => {
    runCommand("cd /usr/game && sh clear.sh", "Log Temizleme");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Sunucu Kontrol Merkezi</h2>
          <p className="text-muted-foreground">SSH tabanlı komutlarla sunucu servislerini yönetin (/usr/game).</p>
        </div>
        <div className={`px-4 py-2 rounded-full flex items-center gap-2 font-bold ${
          status === "online" ? "bg-emerald-500/10 text-emerald-500" : 
          status === "starting" ? "bg-amber-500/10 text-amber-500" : "bg-red-500/10 text-red-500"
        }`}>
          <Activity size={18} className={status === "starting" ? "animate-pulse" : ""} />
          {status === "online" ? "SUNUCU AKTİF" : status === "starting" ? "BAŞLATILIYOR..." : "SUNUCU KAPALI"}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:border-emerald-500/50 transition-colors cursor-pointer" onClick={handleStart}>
          <CardContent className="pt-6 flex flex-col items-center text-center gap-4">
            <div className="p-3 rounded-full bg-emerald-500/10 text-emerald-600">
              <Play size={32} />
            </div>
            <div>
              <h3 className="font-bold">Sunucuyu Başlat</h3>
              <p className="text-xs text-muted-foreground">sh start.sh</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-red-500/50 transition-colors cursor-pointer" onClick={handleStop}>
          <CardContent className="pt-6 flex flex-col items-center text-center gap-4">
            <div className="p-3 rounded-full bg-red-500/10 text-red-600">
              <Square size={32} />
            </div>
            <div>
              <h3 className="font-bold">Sunucuyu Durdur</h3>
              <p className="text-xs text-muted-foreground">sh close.sh</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-blue-500/50 transition-colors cursor-pointer" onClick={() => runCommand("cd /usr/game && sh db_backup.sh", "DB Yedek")}>
          <CardContent className="pt-6 flex flex-col items-center text-center gap-4">
            <div className="p-3 rounded-full bg-blue-500/10 text-blue-600">
              <ShieldCheck size={32} />
            </div>
            <div>
              <h3 className="font-bold">DB Yedeği Al</h3>
              <p className="text-xs text-muted-foreground">MySQL Dump</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-amber-500/50 transition-colors cursor-pointer" onClick={handleClearLogs}>
          <CardContent className="pt-6 flex flex-col items-center text-center gap-4">
            <div className="p-3 rounded-full bg-amber-500/10 text-amber-600">
              <Trash2 size={32} />
            </div>
            <div>
              <h3 className="font-bold">Logları Temizle</h3>
              <p className="text-xs text-muted-foreground">sh clear.sh</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Terminal size={20} className="text-blue-500" /> Konsol Çıktısı
            </CardTitle>
            <CardDescription>SSH üzerinden yürütülen son komutların yanıtları.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-black text-emerald-500 p-4 rounded-lg font-mono text-xs h-64 overflow-y-auto space-y-1">
              <p>[root@metin2-srv ~]# cd /usr/game</p>
              <p>[root@metin2-srv /usr/game]# sh start.sh</p>
              <p className="text-white">Starting DB Cache...</p>
              <p className="text-white">Starting Auth Server...</p>
              <p className="text-white">Starting Channel 1...</p>
              <p className="text-white">Starting Game99...</p>
              <p className="text-blue-400">Server is now ONLINE.</p>
              <p>[root@metin2-srv /usr/game]# _</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server size={20} className="text-purple-500" /> Çekirdek Durumu
            </CardTitle>
            <CardDescription>Aktif çalışan core servisleri.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "db", port: 15000, status: "online" },
                { name: "auth", port: 11002, status: "online" },
                { name: "ch1_core1", port: 13000, status: "online" },
                { name: "ch1_core2", port: 13001, status: "online" },
                { name: "game99", port: 19000, status: "online" },
              ].map((core, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded bg-muted/50 border border-border/50">
                  <div className="flex flex-col">
                    <span className="font-bold text-sm uppercase">{core.name}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">Port: {core.port}</span>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
