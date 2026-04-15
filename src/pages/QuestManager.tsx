import { useState, useEffect } from "react";
import { ScrollText, Search, RefreshCw, Trash2, Edit2, Play, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import api from "../lib/api";
import { toast } from "sonner";

export default function QuestManager() {
  const [quests, setQuests] = useState<any[]>([]);
  const [players, setPlayers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchQuestsAndPlayers = async () => {
    setLoading(true);
    try {
      // Fetch quests
      const questRes = await api.get("/api/db/data?table=quest", {
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
      setQuests(questRes.data);
    } catch (err: any) {
      toast.error("Veriler yüklenemedi: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestsAndPlayers();
  }, []);

  const filteredQuests = quests.filter(q => 
    (q.dwName || q.szName || "").toLowerCase().includes(search.toLowerCase()) || 
    String(q.dwPID).includes(search) ||
    (players[String(q.dwPID)] || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Quest Yönetimi</h2>
          <p className="text-muted-foreground">Oyuncu görevlerini ve quest durumlarını (player.quest) yönetin.</p>
        </div>
        <Button variant="outline" onClick={fetchQuestsAndPlayers} disabled={loading} className="gap-2">
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} /> Yenile
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <ScrollText className="text-purple-500" size={20} /> Quest Kayıtları
            </CardTitle>
            <div className="relative w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Quest adı veya Oyuncu Adı..."
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
                  <TableHead>Oyuncu (Karakter Adı)</TableHead>
                  <TableHead>Quest Adı</TableHead>
                  <TableHead>Değişken</TableHead>
                  <TableHead>Değer</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuests.map((quest, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-blue-600">
                          {players[String(quest.dwPID)] || "Bilinmeyen Karakter"}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">ID: {quest.dwPID}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-purple-600">{quest.szName}</TableCell>
                    <TableCell className="text-xs">{quest.szState}</TableCell>
                    <TableCell className="font-mono font-bold">{quest.lValue}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon">
                          <Edit2 size={16} />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive">
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredQuests.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground italic">
                      Quest kaydı bulunamadı.
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
