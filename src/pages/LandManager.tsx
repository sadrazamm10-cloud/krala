import { useState, useEffect } from "react";
import { Map, Search, RefreshCw, Trash2, Info, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import api from "../lib/api";
import { toast } from "sonner";

export default function LandManager() {
  const [lands, setLands] = useState<any[]>([]);
  const [guilds, setGuilds] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const landRes = await api.get("/api/db/data?table=land", {
        headers: { "x-db-name-override": "player" }
      });
      
      const guildRes = await api.get("/api/db/data?table=guild", {
        headers: { "x-db-name-override": "player" }
      });

      const guildMap: Record<string, string> = {};
      guildRes.data.forEach((g: any) => {
        guildMap[String(g.id)] = g.name;
      });

      setGuilds(guildMap);
      setLands(landRes.data);
    } catch (err: any) {
      toast.error("Arazi verileri yüklenemedi: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredLands = lands.filter(l => 
    String(l.id).includes(search) || 
    String(l.map_index).includes(search) ||
    (guilds[String(l.guild_id)] || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Lonca Arazileri</h2>
          <p className="text-muted-foreground">Haritadaki lonca arazilerini ve sahiplerini (player.land) yönetin.</p>
        </div>
        <Button variant="outline" onClick={fetchData} disabled={loading} className="gap-2">
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} /> Yenile
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Map className="text-emerald-500" size={20} /> Arazi Listesi
            </CardTitle>
            <div className="relative w-80">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Harita ID veya Lonca Adı ile ara..."
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
                  <TableHead>ID</TableHead>
                  <TableHead>Harita (Index)</TableHead>
                  <TableHead>Konum (X, Y)</TableHead>
                  <TableHead>Boyut (W x H)</TableHead>
                  <TableHead>Sahip (Lonca)</TableHead>
                  <TableHead>Fiyat</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLands.map((l, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-mono text-xs">{l.id}</TableCell>
                    <TableCell className="font-bold">{l.map_index}</TableCell>
                    <TableCell className="text-xs font-mono">{l.x}, {l.y}</TableCell>
                    <TableCell className="text-xs">{l.width} x {l.height}</TableCell>
                    <TableCell>
                      {l.guild_id > 0 ? (
                        <div className="flex flex-col">
                          <span className="font-medium text-blue-600 flex items-center gap-1">
                            <Trophy size={12} /> {guilds[String(l.guild_id)] || "Bilinmeyen Lonca"}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-mono">ID: {l.guild_id}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground italic text-xs">Sahipsiz</span>
                      )}
                    </TableCell>
                    <TableCell className="text-emerald-600 font-mono text-xs">{l.price?.toLocaleString() || 0}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon">
                          <Info size={16} />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive">
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredLands.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-muted-foreground italic">
                      Arazi kaydı bulunamadı.
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
