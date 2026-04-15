import { useState, useEffect } from "react";
import { ShoppingBag, Search, RefreshCw, Plus, Trash2, Edit2, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import api from "../lib/api";
import { toast } from "sonner";
import { ITEM_NAMES, MOB_NAMES } from "../lib/mappings";

export default function ShopManager() {
  const [shops, setShops] = useState<any[]>([]);
  const [shopItems, setShopItems] = useState<any[]>([]);
  const [selectedShopVnum, setSelectedShopVnum] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchShops = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/db/data?table=shop", {
        headers: { "x-db-name-override": "player" }
      });
      setShops(res.data);
    } catch (err: any) {
      toast.error("Marketler yüklenemedi: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchShopItems = async (npcVnum: number) => {
    setLoading(true);
    try {
      const res = await api.get(`/api/db/data?table=shop_item`, {
        headers: { "x-db-name-override": "player" }
      });
      // Filter items for this specific shop
      const filtered = res.data.filter((item: any) => item.shop_vnum === npcVnum);
      setShopItems(filtered);
      setSelectedShopVnum(npcVnum);
    } catch (err: any) {
      toast.error("Market eşyaları yüklenemedi: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, []);

  const filteredShops = shops.filter(s => 
    (s.name || "").toLowerCase().includes(search.toLowerCase()) || 
    String(s.npc_vnum).includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Market Yönetimi</h2>
          <p className="text-muted-foreground">NPC marketlerini ve içerisindeki eşyaları (player.shop / shop_item) yönetin.</p>
        </div>
        <Button variant="outline" onClick={fetchShops} disabled={loading} className="gap-2">
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} /> Yenile
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Shop List */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="text-blue-500" size={20} /> Marketler (NPC)
            </CardTitle>
            <div className="relative mt-2">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="NPC VNUM veya İsim..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-9"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[550px]">
              <div className="divide-y">
                {filteredShops.map((shop) => (
                  <div
                    key={shop.npc_vnum}
                    onClick={() => fetchShopItems(shop.npc_vnum)}
                    className={`p-4 hover:bg-muted cursor-pointer transition-colors flex items-center justify-between ${
                      selectedShopVnum === shop.npc_vnum ? "bg-primary/10 border-l-4 border-primary" : ""
                    }`}
                  >
                    <div>
                      <p className="font-bold text-sm">{shop.name || MOB_NAMES[shop.npc_vnum] || `NPC: ${shop.npc_vnum}`}</p>
                      <p className="text-xs text-muted-foreground font-mono">VNUM: {shop.npc_vnum}</p>
                    </div>
                    <Package size={16} className="opacity-20" />
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Shop Items */}
        <Card className="lg:col-span-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Market İçeriği</CardTitle>
              <CardDescription>
                {selectedShopVnum ? `VNUM ${selectedShopVnum} numaralı NPC'nin sattığı eşyalar.` : "Eşyaları görmek için soldan bir market seçin."}
              </CardDescription>
            </div>
            {selectedShopVnum && (
              <Button size="sm" className="gap-2">
                <Plus size={16} /> Eşya Ekle
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[550px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Eşya (VNUM / İsim)</TableHead>
                    <TableHead>Adet</TableHead>
                    <TableHead className="text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shopItems.map((item, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-mono font-bold text-xs">{item.item_vnum}</span>
                          <span className="text-sm font-medium text-blue-600">{ITEM_NAMES[item.item_vnum] || "Bilinmeyen Eşya"}</span>
                        </div>
                      </TableCell>
                      <TableCell>{item.count}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit2 size={14} />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {selectedShopVnum && shopItems.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-10 text-muted-foreground italic">
                        Bu markette henüz eşya bulunmuyor.
                      </TableCell>
                    </TableRow>
                  )}
                  {!selectedShopVnum && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-10 text-muted-foreground italic">
                        Lütfen bir market seçin.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
