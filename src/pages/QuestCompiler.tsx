import { useState, useEffect } from "react";
import { ScrollText, Search, RefreshCw, Play, Trash2, FileCode, Terminal, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import api from "../lib/api";
import { toast } from "sonner";

export default function QuestCompiler() {
  const [quests, setQuests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [compiling, setCompiling] = useState(false);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      // Simulated SSH reading of quest folder
      await api.post("/api/console/command", { command: "ls /usr/game/share/locale/turkey/quest/*.quest" });
      
      // Mocking some quest data
      setQuests([
        { name: "main_quest_lv1.quest", size: "2.4 KB", last_mod: "2024-04-10 12:00" },
        { name: "collect_quest_lv30.quest", size: "12.1 KB", last_mod: "2024-04-11 15:30" },
        { name: "guild_manage.quest", size: "8.5 KB", last_mod: "2024-04-12 09:45" },
        { name: "ox_event.quest", size: "4.2 KB", last_mod: "2024-04-13 18:20" },
        { name: "cube.quest", size: "15.7 KB", last_mod: "2024-04-14 10:10" },
      ]);
    } catch (err: any) {
      toast.error("Quest listesi okunamadı: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCompile = async (name: string) => {
    setCompiling(true);
    try {
      await api.post("/api/console/command", { command: `cd /usr/game/share/locale/turkey/quest && ./qc ${name}` });
      toast.success(`${name} başarıyla derlendi.`);
    } catch (err: any) {
      toast.error("Derleme hatası: " + err.message);
    } finally {
      setCompiling(false);
    }
  };

  const filteredQuests = quests.filter(q => 
    q.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Quest Derleyici</h2>
          <p className="text-muted-foreground">Lua tabanlı görev dosyalarını yönetin ve derleyin (/usr/game/.../quest).</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchData} disabled={loading} className="gap-2">
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} /> Yenile
          </Button>
          <Button className="gap-2" variant="secondary" onClick={() => handleCompile("quest_list")}>
            <CheckCircle2 size={18} /> Tümünü Derle
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <FileCode className="text-blue-500" size={20} /> Quest Dosyaları
              </CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Quest ara..."
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
                    <TableHead>Dosya Adı</TableHead>
                    <TableHead>Boyut</TableHead>
                    <TableHead>Son Değişiklik</TableHead>
                    <TableHead className="text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQuests.map((q, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium text-blue-600">{q.name}</TableCell>
                      <TableCell className="text-xs font-mono">{q.size}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{q.last_mod}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-emerald-600"
                            onClick={() => handleCompile(q.name)}
                            disabled={compiling}
                          >
                            <Play size={16} />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive">
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Terminal size={20} className="text-emerald-500" /> Derleme Konsolu
            </CardTitle>
            <CardDescription>./qc çıktısı ve hata raporları.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-black text-emerald-500 p-4 rounded-lg font-mono text-[10px] h-[550px] overflow-y-auto space-y-1">
              <p>[root@metin2-srv quest]# ./qc main_quest_lv1.quest</p>
              <p className="text-white">QUEST : main_quest_lv1</p>
              <p className="text-white">STATE : start</p>
              <p className="text-white">WHEN  : login or enter</p>
              <p className="text-blue-400">Successfully compiled.</p>
              <p className="text-muted-foreground mt-4">---</p>
              <p>[root@metin2-srv quest]# _</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
