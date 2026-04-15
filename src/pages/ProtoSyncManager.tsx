import { useState } from "react";
import { RefreshCw, ArrowRightLeft, Database, FileCode, Play, AlertCircle, CheckCircle2, Terminal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import api from "../lib/api";

export default function ProtoSyncManager() {
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  const runSync = async (type: "sql_to_file" | "file_to_sql") => {
    setLoading(true);
    const label = type === "sql_to_file" ? "SQL -> Dosya" : "Dosya -> SQL";
    setLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${label} senkronizasyonu başlatıldı...`]);
    
    try {
      const cmd = type === "sql_to_file" 
        ? "cd /usr/game/cores/db && sh dump_proto.sh" 
        : "cd /usr/game/cores/db && ./db --proto-import";
      
      await api.post("/api/console/command", { command: cmd });
      
      setLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] BAŞARILI: ${label} tamamlandı.`]);
      toast.success(`${label} senkronizasyonu tamamlandı.`);
    } catch (err: any) {
      setLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] HATA: ` + err.message]);
      toast.error("Senkronizasyon hatası: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Proto Senkronizasyonu</h2>
          <p className="text-muted-foreground">MySQL tabloları ile sunucu dosyaları (item_proto, mob_proto) arasındaki bağı yönetin.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-blue-200 bg-blue-50/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="text-blue-500" size={20} /> SQL'den Dosyaya (Export)
            </CardTitle>
            <CardDescription>Veritabanındaki item_proto ve mob_proto tablolarını .txt / .bin dosyalarına dönüştürür.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-muted/50 border text-xs space-y-2">
              <p className="font-bold text-blue-600">Yürütülecek İşlemler:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>MySQL tabloları okunur</li>
                <li>dump_proto.sh çalıştırılır</li>
                <li>item_proto.txt ve mob_proto.txt güncellenir</li>
                <li>Client için hazır hale getirilir</li>
              </ul>
            </div>
            <Button 
              onClick={() => runSync("sql_to_file")} 
              disabled={loading} 
              className="w-full gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <ArrowRightLeft size={18} /> Senkronizasyonu Başlat (SQL {">"} Dosya)
            </Button>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 bg-emerald-50/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCode className="text-emerald-500" size={20} /> Dosyadan SQL'e (Import)
            </CardTitle>
            <CardDescription>Sunucu dosyalarındaki değişiklikleri MySQL tablolarına aktarır.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-muted/50 border text-xs space-y-2">
              <p className="font-bold text-emerald-600">Yürütülecek İşlemler:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>item_proto.txt ve mob_proto.txt okunur</li>
                <li>DB çekirdeği üzerinden import edilir</li>
                <li>MySQL tabloları güncellenir</li>
                <li>Sunucu yeniden başlatma gerektirebilir</li>
              </ul>
            </div>
            <Button 
              onClick={() => runSync("file_to_sql")} 
              disabled={loading} 
              className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700"
            >
              <ArrowRightLeft size={18} /> Senkronizasyonu Başlat (Dosya {">"} SQL)
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Terminal size={20} className="text-amber-500" /> İşlem Günlüğü
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-black text-emerald-500 p-4 rounded-lg font-mono text-xs h-64 overflow-y-auto space-y-1">
            {log.length === 0 ? (
              <p className="text-muted-foreground italic">Henüz bir işlem başlatılmadı...</p>
            ) : (
              log.map((line, i) => <p key={i}>{line}</p>)
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-muted/30 border flex items-center gap-4">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase font-bold">Son Export</p>
            <p className="text-sm font-bold">Bugün, 12:45</p>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-muted/30 border flex items-center gap-4">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase font-bold">Son Import</p>
            <p className="text-sm font-bold">Dün, 18:20</p>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-muted/30 border flex items-center gap-4">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase font-bold">Durum</p>
            <p className="text-sm font-bold">Senkronize Değil</p>
          </div>
        </div>
      </div>
    </div>
  );
}
