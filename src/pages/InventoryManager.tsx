import { useState, useEffect } from "react";
import { Package, Search, RefreshCw, Trash2, Edit2, Info, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import api from "../lib/api";
import { toast } from "sonner";
import { ITEM_NAMES } from "../lib/mappings";

export default function InventoryManager() {
  const [items, setItems] = useState<any[]>([]);
  const [players, setPlayers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchItemsAndPlayers = async () => {
    setLoading(true);
    try {
      // Fetch items
      const itemRes = await api.get("/api/db/data?table=item", {
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
      setItems(itemRes.data);
    } catch (err: any) {
      toast.error("Veriler yüklenemedi: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItemsAndPlayers();
  }, []);

  const filteredItems = items.filter(item => 
    String(item.owner_id).includes(search) || 
    String(item.vnum).includes(search) ||
    String(item.id).includes(search) ||
    (players[String(item.owner_id)] || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Envanter Yönetimi</h2>
          <p className="text-muted-foreground">Oyuncuların üzerindeki eşyaları (player.item) görüntüleyin ve yönetin.</p>
        </div>
        <Button variant="outline" onClick={fetchItemsAndPlayers} disabled={loading} className="gap-2">
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} /> Yenile
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Package className="text-emerald-500" size={20} /> Eşya Kayıtları
            </CardTitle>
            <div className="relative w-80">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Eşya ID, VNUM veya Oyuncu Adı ile ara..."
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
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Sahip (Karakter Adı)</TableHead>
                  <TableHead>Eşya (VNUM / İsim)</TableHead>
                  <TableHead>Adet</TableHead>
                  <TableHead>Konum</TableHead>
                  <TableHead>Sıra</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-xs font-bold">{item.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-muted-foreground" />
                        <div className="flex flex-col">
                          <span className="font-medium text-blue-600">
                            {players[String(item.owner_id)] || "Bilinmeyen Karakter"}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-mono">ID: {item.owner_id}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-mono text-emerald-600 font-bold text-xs">{item.vnum}</span>
                        <span className="text-sm font-medium">{ITEM_NAMES[item.vnum] || "Bilinmeyen Eşya"}</span>
                      </div>
                    </TableCell>
                    <TableCell>{item.count}</TableCell>
                    <TableCell className="text-xs uppercase">{item.window}</TableCell>
                    <TableCell>{item.pos}</TableCell>
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
                {filteredItems.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-muted-foreground italic">
                      Eşya kaydı bulunamadı.
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
