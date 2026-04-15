import { useState, useEffect } from "react";
import { ArrowRightLeft, Search, RefreshCw, User, Package, Coins } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import api from "../lib/api";
import { toast } from "sonner";
import { ITEM_NAMES } from "../lib/mappings";

export default function TradeLogManager() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      // Metin2 trade logs are usually in log.pc_bang_login_log or custom trade_log
      const res = await api.get("/api/db/data?table=trade_log", {
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
    (l.player1_name || "").toLowerCase().includes(search.toLowerCase()) || 
    (l.player2_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (ITEM_NAMES[l.item_vnum] || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Ticaret Geçmişi</h2>
          <p className="text-muted-foreground">Oyuncular arasındaki eşya ve para transferlerini (log.trade_log) izleyin.</p>
        </div>
        <Button variant="outline" onClick={fetchData} disabled={loading} className="gap-2">
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} /> Yenile
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <ArrowRightLeft className="text-blue-500" size={20} /> Ticaret Kayıtları
            </CardTitle>
            <div className="relative w-80">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Oyuncu veya Eşya adı ile ara..."
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
                  <TableHead>Oyuncu 1</TableHead>
                  <TableHead>Oyuncu 2</TableHead>
                  <TableHead>Verilen Eşya</TableHead>
                  <TableHead>Miktar / Yang</TableHead>
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
                        <span className="font-bold">{l.player1_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-emerald-500" />
                        <span className="font-bold">{l.player2_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Package size={14} className="text-amber-500" />
                        <span className="text-sm font-medium">{ITEM_NAMES[l.item_vnum] || "Yang / Boş"}</span>
                        {l.item_vnum > 0 && <span className="text-[10px] text-muted-foreground font-mono">({l.item_vnum})</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 font-mono text-xs text-emerald-600">
                        <Coins size={12} /> {l.amount?.toLocaleString() || 0}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredLogs.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground italic">
                      Ticaret kaydı bulunamadı.
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
