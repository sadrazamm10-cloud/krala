import { useState, useEffect } from "react";
import { Zap, Search, RefreshCw, Trash2, Clock, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import api from "../lib/api";
import { toast } from "sonner";

export default function AffectManager() {
  const [affects, setAffects] = useState<any[]>([]);
  const [players, setPlayers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/db/data?table=affect", {
        headers: { "x-db-name-override": "player" }
      });
      
      const playerRes = await api.get("/api/db/data?table=player", {
        headers: { "x-db-name-override": "player" }
      });

      const playerMap: Record<string, string> = {};
      playerRes.data.forEach((p: any) => {
        playerMap[String(p.id)] = p.name;
      });

      setPlayers(playerMap);
      setAffects(res.data);
    } catch (err: any) {
      toast.error("Affect verileri yüklenemedi: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredAffects = affects.filter(a => 
    (players[String(a.dwPID)] || "").toLowerCase().includes(search.toLowerCase()) || 
    String(a.dwPID).includes(search) ||
    String(a.bType).includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Aktif Etkiler</h2>
          <p className="text-muted-foreground">Oyuncuların üzerindeki aktif buff/debuff ve etkileri (player.affect) yönetin.</p>
        </div>
        <Button variant="outline" onClick={fetchData} disabled={loading} className="gap-2">
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} /> Yenile
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Zap className="text-amber-500" size={20} /> Etki Listesi
            </CardTitle>
            <div className="relative w-80">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Karakter adı veya PID ile ara..."
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
                  <TableHead>Karakter</TableHead>
                  <TableHead>Tip (bType)</TableHead>
                  <TableHead>Uygulanan (bApplyOn)</TableHead>
                  <TableHead>Değer</TableHead>
                  <TableHead>Süre (sn)</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAffects.map((a, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-muted-foreground" />
                        <div className="flex flex-col">
                          <span className="font-medium text-blue-600">
                            {players[String(a.dwPID)] || "Bilinmeyen Karakter"}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-mono">ID: {a.dwPID}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{a.bType}</TableCell>
                    <TableCell>{a.bApplyOn}</TableCell>
                    <TableCell className="font-bold text-emerald-600">{a.lApplyValue}</TableCell>
                    <TableCell className="flex items-center gap-1 text-xs">
                      <Clock size={12} /> {a.dwDuration}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="text-destructive">
                        <Trash2 size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredAffects.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground italic">
                      Aktif etki bulunamadı.
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
