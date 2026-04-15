import { useState, useEffect } from "react";
import { MessageSquare, Search, RefreshCw, Clock, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import api from "../lib/api";
import { toast } from "sonner";

export default function ChatLogManager() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      // Shout log or chat log
      const res = await api.get("/api/db/data?table=shout_log", {
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
    (l.who || "").toLowerCase().includes(search.toLowerCase()) || 
    (l.what || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Sohbet Geçmişi</h2>
          <p className="text-muted-foreground">Oyuncuların bağırma (shout) kanalındaki konuşmalarını (log.shout_log) izleyin.</p>
        </div>
        <Button variant="outline" onClick={fetchData} disabled={loading} className="gap-2">
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} /> Yenile
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <MessageSquare className="text-blue-500" size={20} /> Sohbet Kayıtları
            </CardTitle>
            <div className="relative w-80">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Karakter adı veya mesaj içeriği ile ara..."
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
                  <TableHead className="w-[150px]">Karakter</TableHead>
                  <TableHead>Mesaj</TableHead>
                  <TableHead className="w-[120px]">Harita Index</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((l, i) => (
                  <TableRow key={i} className="hover:bg-muted/50">
                    <TableCell className="text-xs text-muted-foreground font-mono">
                      {l.when ? new Date(l.when).toLocaleString() : "---"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-muted-foreground" />
                        <span className="font-bold text-blue-600">{l.who}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-md truncate" title={l.what}>
                      <span className="text-sm">{l.what}</span>
                    </TableCell>
                    <TableCell className="text-xs font-mono">{l.where || "---"}</TableCell>
                  </TableRow>
                ))}
                {filteredLogs.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-10 text-muted-foreground italic">
                      Sohbet kaydı bulunamadı.
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
