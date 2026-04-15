import { useState, useEffect } from "react";
import { Wrench, Trash2, Database, Terminal, ShieldAlert, CheckCircle2, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import api from "../lib/api";
import { toast } from "sonner";

export default function MaintenanceManager() {
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  
  // Maintenance Options
  const [optSyserr, setOptSyserr] = useState(true);
  const [optSyslog, setOptSyslog] = useState(true);
  const [optPts, setOptPts] = useState(true);
  const [optDbLog, setOptDbLog] = useState(false);
  const [optDbBootlog, setOptDbBootlog] = useState(false);

  const runMaintenance = async () => {
    setLoading(true);
    setLog([]);
    const addLog = (msg: string) => setLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    
    addLog("Bakım işlemi başlatılıyor...");

    try {
      // 1. SSH File Cleanups
      if (optSyserr) {
        addLog("SSH: /usr/game/cores/*/syserr dosyaları temizleniyor...");
        await api.post("/api/console/command", { command: "find /usr/game/cores -name 'syserr' -exec rm -f {} \\;" });
        addLog("BAŞARILI: syserr dosyaları silindi.");
      }
      
      if (optSyslog) {
        addLog("SSH: /usr/game/cores/*/syslog dosyaları temizleniyor...");
        await api.post("/api/console/command", { command: "find /usr/game/cores -name 'syslog' -exec rm -f {} \\;" });
        addLog("BAŞARILI: syslog dosyaları silindi.");
      }

      if (optPts) {
        addLog("SSH: /usr/game/cores/*/PTS ve temp dosyaları temizleniyor...");
        await api.post("/api/console/command", { command: "find /usr/game/cores -name 'PTS' -exec rm -f {} \\;" });
        addLog("BAŞARILI: PTS dosyaları silindi.");
      }

      // 2. MySQL Table Truncates
      if (optDbLog) {
        addLog("MySQL: log.log tablosu boşaltılıyor (TRUNCATE)...");
        await api.post("/api/db/query", { 
          query: "TRUNCATE TABLE log", 
          dbName: "log" 
        });
        addLog("BAŞARILI: log.log tablosu sıfırlandı.");
      }

      if (optDbBootlog) {
        addLog("MySQL: log.bootlog tablosu boşaltılıyor (TRUNCATE)...");
        await api.post("/api/db/query", { 
          query: "TRUNCATE TABLE bootlog", 
          dbName: "log" 
        });
        addLog("BAŞARILI: log.bootlog tablosu sıfırlandı.");
      }

      addLog("TÜM BAKIM İŞLEMLERİ TAMAMLANDI.");
      toast.success("Bakım başarıyla tamamlandı.");
    } catch (err: any) {
      addLog(`HATA: İşlem sırasında bir sorun oluştu: ${err.message}`);
      toast.error("Bakım sırasında hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Kapsamlı Bakım (SSH & MySQL)</h2>
          <p className="text-muted-foreground">Sunucu log dosyalarını (SSH) ve veritabanı log tablolarını (MySQL) temizleyin.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card className="border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-blue-600">
                <Terminal size={20} /> SSH Dosya Temizliği
              </CardTitle>
              <CardDescription>/usr/game dizinindeki gereksiz log ve temp dosyalarını siler.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox id="syserr" checked={optSyserr} onCheckedChange={(c) => setOptSyserr(!!c)} />
                <label htmlFor="syserr" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  syserr Dosyalarını Sil (Tüm Core'lar)
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="syslog" checked={optSyslog} onCheckedChange={(c) => setOptSyslog(!!c)} />
                <label htmlFor="syslog" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  syslog Dosyalarını Sil (Tüm Core'lar)
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="pts" checked={optPts} onCheckedChange={(c) => setOptPts(!!c)} />
                <label htmlFor="pts" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  PTS ve Temp Dosyalarını Sil
                </label>
              </div>
            </CardContent>
          </Card>

          <Card className="border-emerald-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-emerald-600">
                <Database size={20} /> MySQL Tablo Temizliği
              </CardTitle>
              <CardDescription>Log veritabanındaki şişmiş tabloları TRUNCATE komutuyla sıfırlar.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox id="dblog" checked={optDbLog} onCheckedChange={(c) => setOptDbLog(!!c)} />
                <label htmlFor="dblog" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  log.log Tablosunu Sıfırla (Genel Loglar)
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="bootlog" checked={optDbBootlog} onCheckedChange={(c) => setOptDbBootlog(!!c)} />
                <label htmlFor="bootlog" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  log.bootlog Tablosunu Sıfırla (Başlatma Logları)
                </label>
              </div>
              <div className="p-3 bg-amber-500/10 text-amber-600 rounded-md text-xs flex items-start gap-2 mt-4">
                <ShieldAlert size={16} className="mt-0.5 shrink-0" />
                <p>Veritabanı tablolarını sıfırlamak (TRUNCATE) geri alınamaz bir işlemdir. İşlem öncesi yedek almanız önerilir.</p>
              </div>
            </CardContent>
          </Card>

          <Button 
            onClick={runMaintenance} 
            disabled={loading || (!optSyserr && !optSyslog && !optPts && !optDbLog && !optDbBootlog)} 
            className="w-full gap-2 h-12 text-lg"
          >
            {loading ? <RefreshCw className="animate-spin" /> : <Wrench />}
            Seçili Bakım İşlemlerini Başlat
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Terminal size={20} className="text-muted-foreground" /> İşlem Konsolu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-black text-emerald-500 p-4 rounded-lg font-mono text-xs h-[450px] overflow-y-auto space-y-1">
              {log.length === 0 ? (
                <p className="text-muted-foreground italic">Bakım işlemi bekleniyor...</p>
              ) : (
                log.map((line, i) => (
                  <p key={i} className={line.includes("HATA") ? "text-red-500" : line.includes("BAŞARILI") ? "text-blue-400" : ""}>
                    {line}
                  </p>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
