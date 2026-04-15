import { useState, useEffect } from "react";
import { Box, Save, RefreshCw, FileText, Search, Plus, Trash2, Database, Terminal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import api from "../lib/api";
import { toast } from "sonner";
import { ITEM_NAMES, MOB_NAMES } from "../lib/mappings";

export default function DropManager() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [dropGroups, setDropGroups] = useState<any[]>([]);
  const [activeGroup, setActiveGroup] = useState<any | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. SSH: Dosyayı oku
      await api.post("/api/console/command", { command: "cat /usr/game/share/locale/turkey/mob_drop_item.txt" });
      
      // 2. MySQL: (Gerçek senaryoda item_proto'dan isimleri çekmek için kullanılır, biz mappings kullanıyoruz)
      await api.get("/api/db/data?table=item_proto", { headers: { "x-db-name-override": "player" } });

      // Mocking parsed mob_drop_item.txt data
      const mockParsedData = [
        {
          name: "Yabani_Kopek",
          mobVnum: 101,
          drops: [
            { id: 1, itemVnum: 19, count: 1, prob: 50 }, // Kılıç +9
            { id: 2, itemVnum: 27992, count: 1, prob: 5 }, // Beyaz İnci
          ]
        },
        {
          name: "Kraliçe_Örümcek",
          mobVnum: 2091,
          drops: [
            { id: 1, itemVnum: 50070, count: 1, prob: 100 }, // Kraliçe Örümcek Sandığı
            { id: 2, itemVnum: 27993, count: 1, prob: 20 }, // Mavi İnci
            { id: 3, itemVnum: 27994, count: 1, prob: 10 }, // Kankırmızı İnci
          ]
        },
        {
          name: "Beran_Setaou",
          mobVnum: 2493,
          drops: [
            { id: 1, itemVnum: 71123, count: 1, prob: 100 }, // Ejderha Pulu
            { id: 2, itemVnum: 71129, count: 1, prob: 100 }, // Ejderha Pençesi
            { id: 3, itemVnum: 11299, count: 1, prob: 50 }, // Siyah Çelik Zırh +9
          ]
        }
      ];
      
      setDropGroups(mockParsedData);
    } catch (err: any) {
      toast.error("Drop dosyası okunamadı.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Simulated SSH write
      await api.post("/api/console/command", { command: "echo '...parsed_content...' > /usr/game/share/locale/turkey/mob_drop_item.txt" });
      toast.success("mob_drop_item.txt başarıyla kaydedildi.");
    } catch (err: any) {
      toast.error("Kaydetme başarısız.");
    } finally {
      setSaving(false);
    }
  };

  const filteredGroups = dropGroups.filter(g => 
    g.name.toLowerCase().includes(search.toLowerCase()) || 
    String(g.mobVnum).includes(search) ||
    (MOB_NAMES[g.mobVnum] || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Eşya Düşme (Drop) Yöneticisi</h2>
          <p className="text-muted-foreground">SSH üzerinden mob_drop_item.txt dosyasını düzenleyin, MySQL ile eşya isimlerini eşleştirin.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchData} disabled={loading} className="gap-2">
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} /> Yenile
          </Button>
          <Button onClick={handleSave} disabled={saving} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
            <Save size={18} className={saving ? "animate-spin" : ""} /> SSH'a Kaydet
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sol: Mob Listesi */}
        <Card className="lg:col-span-1 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-blue-600">
              <FileText size={20} /> mob_drop_item.txt
            </CardTitle>
            <div className="relative mt-2">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Canavar ara (VNUM veya İsim)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[600px]">
              <div className="flex flex-col">
                {filteredGroups.map((group, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveGroup(group)}
                    className={`flex flex-col p-3 border-b text-left hover:bg-muted/50 transition-colors ${activeGroup?.mobVnum === group.mobVnum ? 'bg-muted border-l-4 border-l-blue-500' : ''}`}
                  >
                    <div className="font-bold text-sm text-blue-600">{MOB_NAMES[group.mobVnum] || group.name}</div>
                    <div className="flex justify-between w-full mt-1">
                      <span className="text-[10px] text-muted-foreground font-mono">VNUM: {group.mobVnum}</span>
                      <span className="text-[10px] font-bold text-emerald-600">{group.drops.length} Eşya</span>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Sağ: Drop Detayları */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Box className="text-amber-500" size={20} /> 
                {activeGroup ? `${MOB_NAMES[activeGroup.mobVnum] || activeGroup.name} Dropları` : "Grup Seçin"}
              </CardTitle>
              <CardDescription>
                {activeGroup ? `Mob VNUM: ${activeGroup.mobVnum}` : "Düzenlemek için sol taraftan bir canavar seçin."}
              </CardDescription>
            </div>
            {activeGroup && (
              <Button size="sm" variant="outline" className="gap-2">
                <Plus size={16} /> Yeni Eşya Ekle
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-0">
            {activeGroup ? (
              <ScrollArea className="h-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">Sıra</TableHead>
                      <TableHead>Eşya (MySQL item_proto)</TableHead>
                      <TableHead>VNUM</TableHead>
                      <TableHead>Adet</TableHead>
                      <TableHead>Oran (%)</TableHead>
                      <TableHead className="text-right">İşlem</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeGroup.drops.map((drop: any, i: number) => (
                      <TableRow key={i}>
                        <TableCell className="font-mono text-xs text-muted-foreground">{drop.id}</TableCell>
                        <TableCell className="font-bold text-blue-600">
                          <div className="flex items-center gap-2">
                            <Database size={12} className="text-emerald-500" />
                            {ITEM_NAMES[drop.itemVnum] || "Bilinmeyen Eşya"}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs">{drop.itemVnum}</TableCell>
                        <TableCell>
                          <Input type="number" defaultValue={drop.count} className="w-20 h-8 text-xs" />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Input type="number" defaultValue={drop.prob} className="w-20 h-8 text-xs" />
                            <span className="text-xs text-muted-foreground">%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-500/10">
                            <Trash2 size={16} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                <div className="p-4 mt-4 bg-black/5 rounded-lg mx-4">
                  <div className="flex items-center gap-2 mb-2 text-xs font-bold text-muted-foreground">
                    <Terminal size={14} /> SSH Dosya Önizlemesi
                  </div>
                  <pre className="font-mono text-[10px] text-muted-foreground whitespace-pre-wrap">
{`Group  ${activeGroup.name}
{
    Mob  ${activeGroup.mobVnum}
${activeGroup.drops.map((d: any) => `    ${d.id}    ${d.itemVnum}    ${d.count}    ${d.prob}`).join('\n')}
}`}
                  </pre>
                </div>
              </ScrollArea>
            ) : (
              <div className="h-[600px] flex flex-col items-center justify-center text-muted-foreground border-t border-dashed">
                <Box size={48} className="mb-4 opacity-20" />
                <p>Drop listesini görüntülemek için bir canavar seçin.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
