import { useState, useEffect } from "react";
import { Users, Search, RefreshCw, Trophy, Sword, Trash2, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import api from "../lib/api";
import { toast } from "sonner";

export default function GuildManager() {
  const [guilds, setGuilds] = useState<any[]>([]);
  const [players, setPlayers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchGuildsAndPlayers = async () => {
    setLoading(true);
    try {
      // Fetch guilds
      const guildRes = await api.get("/api/db/data?table=guild", {
        headers: { "x-db-name-override": "player" }
      });
      
      // Fetch players for mapping leader names
      const playerRes = await api.get("/api/db/data?table=player", {
        headers: { "x-db-name-override": "player" }
      });

      const playerMap: Record<string, string> = {};
      playerRes.data.forEach((p: any) => {
        playerMap[String(p.id)] = p.name;
      });

      setPlayers(playerMap);
      setGuilds(guildRes.data);
    } catch (err: any) {
      toast.error("Veriler yüklenemedi: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuildsAndPlayers();
  }, []);

  const filteredGuilds = guilds.filter(g => 
    g.name.toLowerCase().includes(search.toLowerCase()) || 
    String(g.id).includes(search) ||
    (players[String(g.master)] || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Lonca Yönetimi</h2>
          <p className="text-muted-foreground">Sunucudaki loncaları (player.guild) görüntüleyin ve yönetin.</p>
        </div>
        <Button variant="outline" onClick={fetchGuildsAndPlayers} disabled={loading} className="gap-2">
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} /> Yenile
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Trophy className="text-amber-500" size={20} /> Lonca Listesi
            </CardTitle>
            <div className="relative w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Lonca veya Lider adı ile ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">ID</TableHead>
                  <TableHead>Lonca Adı</TableHead>
                  <TableHead>Lider (Karakter)</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Exp</TableHead>
                  <TableHead>Puan</TableHead>
                  <TableHead>Altın</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGuilds.map((guild) => (
                  <TableRow key={guild.id}>
                    <TableCell className="font-mono text-xs">{guild.id}</TableCell>
                    <TableCell className="font-bold text-blue-500">{guild.name}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-emerald-600">
                          {players[String(guild.master)] || "Bilinmeyen Lider"}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">ID: {guild.master}</span>
                      </div>
                    </TableCell>
                    <TableCell>{guild.level}</TableCell>
                    <TableCell>{guild.exp.toLocaleString()}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 text-xs font-bold">
                        <Sword size={12} /> {guild.ladder_point}
                      </span>
                    </TableCell>
                    <TableCell>{guild.gold.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" title="Detaylar">
                          <Info size={16} />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive">
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredGuilds.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10 text-muted-foreground italic">
                      Lonca bulunamadı.
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
