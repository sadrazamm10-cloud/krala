import { useState, useEffect } from "react";
import { ScrollText, Search, RefreshCw, Clock, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import api from "../lib/api";
import { toast } from "sonner";

export default function LogViewer() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [activeTable, setActiveTable] = useState("log");

  const fetchLogs = async (table: string) => {
    setLoading(true);
    try {
      const res = await api.get(`/api/db/data?table=${table}`, {
        headers: { "x-db-name-override": "log" }
      });
      setLogs(res.data);
      setActiveTable(table);
    } catch (err: any) {
      toast.error("Loglar yüklenemedi: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs("log");
  }, []);

  const filteredLogs = logs.filter(l => 
    String(l.who || l.name || "").toLowerCase().includes(search.toLowerCase()) || 
    String(l.how || l.what || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Sistem Logları</h2>
          <p className="text-muted-foreground">Oyun içi hareketleri ve sistem kayıtlarını (log.*) inceleyin.</p>
        </div>
        <div className="flex gap-2">
          <Button variant={activeTable === "log" ? "default" : "outline"} onClick={() => fetchLogs("log")}>Genel</Button>
          <Button variant={activeTable === "command_log" ? "default" : "outline"} onClick={() => fetchLogs("command_log")}>Komutlar</Button>
          <Button variant={activeTable === "goldlog" ? "default" : "outline"} onClick={() => fetchLogs("goldlog")}>Altın</Button>
          <Button variant="outline" onClick={() => fetchLogs(activeTable)} disabled={loading}>
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Clock className="text-blue-500" size={20} /> {activeTable.toUpperCase()} Kayıtları
            </CardTitle>
            <div className="relative w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Kim, Ne, Nasıl ile ara..."
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
                  <TableHead>Zaman</TableHead>
                  <TableHead>Kim</TableHead>
                  <TableHead>Eylem / Ne</TableHead>
                  <TableHead>Detay / Nasıl</TableHead>
                  <TableHead className="text-right">Bilgi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-xs text-muted-foreground">
                      {log.time ? new Date(log.time).toLocaleString() : "---"}
                    </TableCell>
                    <TableCell className="font-medium">{log.who || log.name || "---"}</TableCell>
                    <TableCell className="text-blue-600">{log.what || log.command || log.how || "---"}</TableCell>
                    <TableCell className="text-xs">{log.hint || log.ip || "---"}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon">
                        <Info size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredLogs.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground italic">
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
