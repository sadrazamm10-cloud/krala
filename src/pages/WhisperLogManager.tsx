import { useState, useEffect } from "react";
import { MessageSquare, Search, RefreshCw, User, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import api from "../lib/api";
import { toast } from "sonner";

export default function WhisperLogManager() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      // Metin2 whisper logs are usually in log.whisper_log or similar
      const res = await api.get("/api/db/data?table=whisper_log", {
        headers: { "x-db-name-override": "log" }
      });
      setLogs(res.data);
    } catch (err: any) {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredLogs = logs.filter(l => 
    (l.from_name || "").toLowerCase().includes(search.toLowerCase()) || 
    (l.to_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (l.message || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Fısıltı Geçmişi</h2>
          <p className="text-muted-foreground">Oyuncuların birbirlerine attığı özel mesajları (log.whisper_log) izleyin.</p>
        </div>
        <Button variant="outline" onClick={fetchData} disabled={loading} className="gap-2">
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} /> Yenile
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <MessageSquare className="text-pink-500" size={20} /> Özel Mesajlar
            </CardTitle>
            <div className="relative w-80">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Gönderen, Alıcı veya Mesaj ile ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[650px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Zaman</TableHead>
                  <TableHead>Gönderen</TableHead>
                  <TableHead>Alıcı</TableHead>
                  <TableHead>Mesaj</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((l, i) => (
                  <TableRow key={i} className="hover:bg-muted/50">
                    <TableCell className="text-xs text-muted-foreground font-mono">
                      {l.time ? new Date(l.time).toLocaleString() : "---"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-blue-500" />
                        <span className="font-bold">{l.from_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-emerald-500" />
                        <span className="font-bold">{l.to_name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-md truncate" title={l.message}>
                      <span className="text-sm italic">"{l.message}"</span>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredLogs.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-10 text-muted-foreground italic">
                      Fısıltı kaydı bulunamadı.
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
