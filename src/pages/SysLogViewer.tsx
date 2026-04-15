import { useState, useEffect } from "react";
import { FileText, Search, RefreshCw, Trash2, ShieldAlert, AlertCircle, Terminal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import api from "../lib/api";
import { toast } from "sonner";

export default function SysLogViewer() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeFile, setActiveFile] = useState<"syserr" | "syslog">("syserr");

  const fetchData = async (file: "syserr" | "syslog") => {
    setLoading(true);
    try {
      // Simulated SSH reading of syserr/syslog files
      // In a real app, this would call a backend that reads /usr/game/cores/*/syserr
      await api.post("/api/console/command", { command: `tail -n 100 /usr/game/cores/channel1/core1/${file}` });
      
      // Mocking some log data for demonstration
      setLogs([
        { time: "2024-04-14 14:30:01", core: "ch1_core1", content: "SYSERR: Apr 14 14:30:01 :: GetMotion: cannot find motion (name: 100, mode: 0)" },
        { time: "2024-04-14 14:30:05", core: "ch1_core1", content: "SYSERR: Apr 14 14:30:05 :: SpawnGroup: cannot find group (vnum: 1001)" },
        { time: "2024-04-14 14:31:10", core: "auth", content: "SYSERR: Apr 14 14:31:10 :: Process: AUTH_PHASE_LOGIN: login failure (id: testuser)" },
        { time: "2024-04-14 14:32:15", core: "game99", content: "SYSERR: Apr 14 14:32:15 :: ItemProto: cannot find item (vnum: 99999)" },
      ]);
      setActiveFile(file);
    } catch (err: any) {
      toast.error("Loglar okunamadı: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData("syserr");
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Sistem Hata Kayıtları</h2>
          <p className="text-muted-foreground">Sunucu çekirdeklerindeki syserr ve syslog dosyalarını (SSH) izleyin.</p>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-muted p-1 rounded-md">
            <button
              onClick={() => fetchData("syserr")}
              className={`px-4 py-1.5 text-sm font-medium rounded-sm transition-all flex items-center gap-2 ${
                activeFile === "syserr" ? "bg-background shadow-sm text-red-600" : "hover:text-primary"
              }`}
            >
              <ShieldAlert size={16} /> syserr
            </button>
            <button
              onClick={() => fetchData("syslog")}
              className={`px-4 py-1.5 text-sm font-medium rounded-sm transition-all flex items-center gap-2 ${
                activeFile === "syslog" ? "bg-background shadow-sm text-blue-600" : "hover:text-primary"
              }`}
            >
              <FileText size={16} /> syslog
            </button>
          </div>
          <Button variant="outline" onClick={() => fetchData(activeFile)} disabled={loading}>
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </Button>
        </div>
      </div>

      <Card className={activeFile === "syserr" ? "border-red-200" : "border-blue-200"}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            {activeFile === "syserr" ? <AlertCircle className="text-red-500" size={20} /> : <Terminal className="text-blue-500" size={20} />}
            {activeFile === "syserr" ? "Kritik Hatalar (syserr)" : "Sistem Akışı (syslog)"}
          </CardTitle>
          <CardDescription>/usr/game/cores/ içindeki tüm çekirdeklerden toplanan son 100 satır.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[650px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Zaman</TableHead>
                  <TableHead className="w-[120px]">Çekirdek</TableHead>
                  <TableHead>Hata / Mesaj İçeriği</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((l, i) => (
                  <TableRow key={i} className={`hover:bg-muted/50 ${activeFile === "syserr" ? "text-red-500/90" : "text-blue-500/90"}`}>
                    <TableCell className="text-xs font-mono">{l.time}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded bg-muted text-[10px] font-bold uppercase">{l.core}</span>
                    </TableCell>
                    <TableCell className="font-mono text-xs whitespace-pre-wrap">{l.content}</TableCell>
                  </TableRow>
                ))}
                {logs.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-10 text-muted-foreground italic">
                      Log kaydı bulunamadı.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
