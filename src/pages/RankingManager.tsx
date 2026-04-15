import { useState, useEffect } from "react";
import { Trophy, Medal, Search, RefreshCw, Users, Sword, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import api from "../lib/api";
import { toast } from "sonner";

export default function RankingManager() {
  const [players, setPlayers] = useState<any[]>([]);
  const [guilds, setGuilds] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"players" | "guilds">("players");

  const fetchData = async () => {
    setLoading(true);
    try {
      const pRes = await api.get("/api/db/data?table=player", {
        headers: { "x-db-name-override": "player" }
      });
      const gRes = await api.get("/api/db/data?table=guild", {
        headers: { "x-db-name-override": "player" }
      });

      // Sort players by level and exp
      const sortedPlayers = [...pRes.data].sort((a, b) => {
        if (b.level !== a.level) return b.level - a.level;
        return b.exp - a.exp;
      }).slice(0, 50);

      // Sort guilds by ladder_point
      const sortedGuilds = [...gRes.data].sort((a, b) => b.ladder_point - a.ladder_point).slice(0, 50);

      setPlayers(sortedPlayers);
      setGuilds(sortedGuilds);
    } catch (err: any) {
      toast.error("Sıralama verileri yüklenemedi: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Sıralamalar</h2>
          <p className="text-muted-foreground">Sunucudaki en iyi oyuncuları ve loncaları görüntüleyin.</p>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-muted p-1 rounded-md">
            <button
              onClick={() => setActiveTab("players")}
              className={`px-4 py-1.5 text-sm font-medium rounded-sm transition-all flex items-center gap-2 ${
                activeTab === "players" ? "bg-background shadow-sm" : "hover:text-primary"
              }`}
            >
              <Users size={16} /> Oyuncular
            </button>
            <button
              onClick={() => setActiveTab("guilds")}
              className={`px-4 py-1.5 text-sm font-medium rounded-sm transition-all flex items-center gap-2 ${
                activeTab === "guilds" ? "bg-background shadow-sm" : "hover:text-primary"
              }`}
            >
              <Trophy size={16} /> Loncalar
            </button>
          </div>
          <Button variant="outline" onClick={fetchData} disabled={loading}>
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {activeTab === "players" ? <Medal className="text-amber-500" size={20} /> : <Trophy className="text-blue-500" size={20} />}
            {activeTab === "players" ? "En İyi 50 Oyuncu" : "En İyi 50 Lonca"}
          </CardTitle>
          <CardDescription>
            {activeTab === "players" ? "Level ve tecrübe puanına göre sıralanmıştır." : "Lonca puanına (ladder_point) göre sıralanmıştır."}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[650px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Sıra</TableHead>
                  <TableHead>{activeTab === "players" ? "Karakter Adı" : "Lonca Adı"}</TableHead>
                  <TableHead>{activeTab === "players" ? "Level" : "Lider"}</TableHead>
                  <TableHead>{activeTab === "players" ? "Tecrübe (EXP)" : "Puan"}</TableHead>
                  <TableHead>{activeTab === "players" ? "Altın" : "Level"}</TableHead>
                  <TableHead className="text-right">Durum</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(activeTab === "players" ? players : guilds).map((item, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted font-bold text-sm">
                        {i + 1}
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-blue-600">
                      {activeTab === "players" ? item.name : item.name}
                    </TableCell>
                    <TableCell>
                      {activeTab === "players" ? (
                        <span className="font-medium">{item.level}</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">ID: {item.master}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {activeTab === "players" ? (
                        <span className="text-xs font-mono">{item.exp.toLocaleString()}</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 text-xs font-bold">
                          <Sword size={12} /> {item.ladder_point}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {activeTab === "players" ? (
                        <span className="text-emerald-600 font-mono text-xs">{item.gold.toLocaleString()}</span>
                      ) : (
                        <span className="font-medium">{item.level}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {i < 3 ? (
                        <Star size={16} className={i === 0 ? "text-amber-400" : i === 1 ? "text-slate-400" : "text-amber-700"} fill="currentColor" />
                      ) : (
                        <span className="text-xs text-muted-foreground">---</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
