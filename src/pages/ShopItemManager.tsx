import { useState, useEffect } from "react";
import { ShoppingBag, Search, RefreshCw, Trash2, Plus, Edit2, Store } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import api from "../lib/api";
import { toast } from "sonner";
import { ITEM_NAMES, MOB_NAMES } from "../lib/mappings";

export default function ShopItemManager() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/db/data?table=shop_item", {
        headers: { "x-db-name-override": "player" }
      });
      setItems(res.data);
    } catch (err: any) {
      toast.error("Market eşyaları yüklenemedi: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredItems = items.filter(i => 
    String(i.shop_vnum).includes(search) || 
    String(i.item_vnum).includes(search) ||
    (ITEM_NAMES[i.item_vnum] || "").toLowerCase().includes(search.toLowerCase()) ||
    (MOB_NAMES[i.shop_vnum] || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Market İçerikleri</h2>
          <p className="text-muted-foreground">NPC marketlerinde satılan eşyaları (player.shop_item) yönetin.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchData} disabled={loading} className="gap-2">
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} /> Yenile
          </Button>
          <Button className="gap-2">
            <Plus size={18} /> Yeni Eşya Ekle
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Store className="text-blue-500" size={20} /> Satış Listesi
            </CardTitle>
            <div className="relative w-80">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Market VNUM veya Eşya adı ile ara..."
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
                  <TableHead>Market (NPC)</TableHead>
                  <TableHead>Eşya (VNUM / İsim)</TableHead>
                  <TableHead>Adet</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-blue-600">{MOB_NAMES[item.shop_vnum] || "Bilinmeyen NPC"}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">VNUM: {item.shop_vnum}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{ITEM_NAMES[item.item_vnum] || "Bilinmeyen Eşya"}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">VNUM: {item.item_vnum}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono">{item.count || 1}</TableCell>
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
                {filteredItems.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-10 text-muted-foreground italic">
                      Market eşyası bulunamadı.
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
