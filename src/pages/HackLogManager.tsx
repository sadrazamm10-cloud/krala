import { useState, useEffect } from "react";
import { ShieldAlert, Search, RefreshCw, Trash2, User, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import api from "../lib/api";
import { toast } from "sonner";

export default function HackLogManager() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/db/data?table=hack_log", {
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
    (l.login || "").toLowerCase().includes(search.toLowerCase()) || 
    (l.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (l.reason || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-red-600">Hile Logları</h2>
          <p className="text-muted-foreground">Sistem tarafından tespit edilen şüpheli hareketleri (log.hack_log) inceleyin.</p>
        </div>
        <Button variant="outline" onClick={fetchData} disabled={loading} className="gap-2">
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} /> Yenile
        </Button>
      </div>

      <Card className="border-red-200 bg-red-50/10">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <ShieldAlert className="text-red-500" size={20} /> Şüpheli Hareketler
            </CardTitle>
            <div className="relative w-80">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Karakter, Hesap veya Neden ile ara..."
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
                  <TableHead>Hesap / Karakter</TableHead>
                  <TableHead>IP Adresi</TableHead>
                  <TableHead>Neden / Tespit</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((l, i) => (
                  <TableRow key={i} className="hover:bg-red-500/5">
                    <TableCell className="text-xs text-muted-foreground font-mono">
                      {l.time ? new Date(l.time).toLocaleString() : "---"}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-red-600">{l.name}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">Hesap: {l.login}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-mono">{l.ip}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-500/10 text-red-600 text-xs font-bold">
                        <Zap size={12} /> {l.reason || "Bilinmeyen Hile"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="text-destructive">
                        <Trash2 size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredLogs.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground italic">
                      Hile kaydı bulunamadı.
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
