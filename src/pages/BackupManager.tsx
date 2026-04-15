import { useState, useEffect } from "react";
import { HardDrive, Search, RefreshCw, Trash2, Download, Upload, ShieldCheck, Database, FileArchive, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import api from "../lib/api";
import { toast } from "sonner";

export default function BackupManager() {
  const [backups, setBackups] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Simulated SSH listing of backup folder /usr/game/backups
      await api.post("/api/console/command", { command: "ls -lh /usr/game/backups" });
      
      // Mocking backup data
      setBackups([
        { name: "full_game_20240410.tar.gz", type: "Game", size: "1.2 GB", date: "2024-04-10 03:00" },
        { name: "mysql_dump_20240411.sql.gz", type: "MySQL", size: "45 MB", date: "2024-04-11 03:00" },
        { name: "full_game_20240412.tar.gz", type: "Game", size: "1.2 GB", date: "2024-04-12 03:00" },
        { name: "mysql_dump_20240413.sql.gz", type: "MySQL", size: "48 MB", date: "2024-04-13 03:00" },
        { name: "mysql_dump_20240414.sql.gz", type: "MySQL", size: "50 MB", date: "2024-04-14 03:00" },
      ]);
    } catch (err: any) {
      toast.error("Yedek listesi okunamadı: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const createBackup = async (type: "game" | "mysql") => {
    setCreating(true);
    try {
      const cmd = type === "game" 
        ? "cd /usr && tar -czf game_backup.tar.gz game" 
        : "mysqldump -u root -p player common log account > db_backup.sql";
      await api.post("/api/console/command", { command: cmd });
      toast.success(`${type === "game" ? "Oyun" : "Veritabanı"} yedeği oluşturuldu.`);
      fetchData();
    } catch (err: any) {
      toast.error("Yedekleme hatası: " + err.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Yedekleme ve Geri Yükleme</h2>
          <p className="text-muted-foreground">Sunucu dosyalarını ve veritabanını SSH üzerinden yedekleyin.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchData} disabled={loading} className="gap-2">
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} /> Yenile
          </Button>
          <Button onClick={() => createBackup("game")} disabled={creating} className="gap-2 bg-blue-600 hover:bg-blue-700">
            <FileArchive size={18} /> Oyun Yedeği Al
          </Button>
          <Button onClick={() => createBackup("mysql")} disabled={creating} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
            <Database size={18} /> MySQL Yedeği Al
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="text-emerald-500" size={20} /> Mevcut Yedekler
            </CardTitle>
            <CardDescription>/usr/game/backups dizinindeki arşiv dosyaları.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Dosya Adı</TableHead>
                    <TableHead>Tür</TableHead>
                    <TableHead>Boyut</TableHead>
                    <TableHead>Tarih</TableHead>
                    <TableHead className="text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {backups.map((b, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium text-blue-600">{b.name}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                          b.type === "Game" ? "bg-blue-500/10 text-blue-500" : "bg-emerald-500/10 text-emerald-500"
                        }`}>
                          {b.type}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs font-mono">{b.size}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{b.date}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" className="text-blue-600">
                            <Download size={16} />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-amber-600">
                            <Upload size={16} />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive">
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock size={16} className="text-blue-500" /> Otomatik Yedekleme
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border">
                <div className="text-xs font-medium">Günlük MySQL Yedeği</div>
                <div className="text-[10px] px-2 py-0.5 rounded bg-emerald-500 text-white font-bold">AKTİF</div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border">
                <div className="text-xs font-medium">Haftalık Oyun Yedeği</div>
                <div className="text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground font-bold">PASİF</div>
              </div>
              <Button variant="outline" className="w-full text-xs">Planlamayı Düzenle</Button>
            </CardContent>
          </Card>

          <Card className="bg-amber-500/5 border-amber-500/20">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2 text-amber-600">
                <HardDrive size={16} /> Disk Kullanımı
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-xs mb-1">
                <span>/usr/game</span>
                <span className="font-bold">4.2 GB / 20 GB</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 w-[21%]"></div>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">
                Son yedekleme 3 saat önce başarıyla tamamlandı.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
