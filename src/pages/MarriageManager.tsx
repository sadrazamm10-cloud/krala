import { useState, useEffect } from "react";
import { Heart, Search, RefreshCw, Trash2, Info, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import api from "../lib/api";
import { toast } from "sonner";

export default function MarriageManager() {
  const [marriages, setMarriages] = useState<any[]>([]);
  const [players, setPlayers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchMarriagesAndPlayers = async () => {
    setLoading(true);
    try {
      // Fetch marriages
      const mRes = await api.get("/api/db/data?table=marriage", {
        headers: { "x-db-name-override": "player" }
      });
      
      // Fetch players for mapping
      const playerRes = await api.get("/api/db/data?table=player", {
        headers: { "x-db-name-override": "player" }
      });

      const playerMap: Record<string, string> = {};
      playerRes.data.forEach((p: any) => {
        playerMap[String(p.id)] = p.name;
      });

      setPlayers(playerMap);
      setMarriages(mRes.data);
    } catch (err: any) {
      toast.error("Veriler yüklenemedi: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarriagesAndPlayers();
  }, []);

  const filteredMarriages = marriages.filter(m => 
    String(m.pid1).includes(search) || 
    String(m.pid2).includes(search) ||
    (players[String(m.pid1)] || "").toLowerCase().includes(search.toLowerCase()) ||
    (players[String(m.pid2)] || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Evlilik Yönetimi</h2>
          <p className="text-muted-foreground">Oyuncuların evlilik kayıtlarını (player.marriage) yönetin.</p>
        </div>
        <Button variant="outline" onClick={fetchMarriagesAndPlayers} disabled={loading} className="gap-2">
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} /> Yenile
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Heart className="text-pink-500" size={20} /> Evlilik Kayıtları
            </CardTitle>
            <div className="relative w-80">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Karakter Adı veya ID ile ara..."
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
                  <TableHead>Eş 1 (Karakter)</TableHead>
                  <TableHead>Eş 2 (Karakter)</TableHead>
                  <TableHead>Sevgi Puanı</TableHead>
                  <TableHead>Evlilik Tarihi</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMarriages.map((m, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-blue-600">
                          {players[String(m.pid1)] || "Bilinmeyen Karakter"}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">ID: {m.pid1}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-pink-600">
                          {players[String(m.pid2)] || "Bilinmeyen Karakter"}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">ID: {m.pid2}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-emerald-600 font-bold">{m.love_point}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {m.time ? new Date(m.time * 1000).toLocaleString() : "---"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" className="text-destructive">
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredMarriages.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground italic">
                      Evlilik kaydı bulunamadı.
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
