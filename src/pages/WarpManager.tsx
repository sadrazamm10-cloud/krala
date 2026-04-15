import { useState, useEffect } from "react";
import { MapPin, Search, RefreshCw, Trash2, Plus, Globe, Navigation } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import api from "../lib/api";
import { toast } from "sonner";

export default function WarpManager() {
  const [warps, setWarps] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      // Custom warp points or map indices
      // This is often in a file or a custom table
      // Let's assume a table 'warp_settings' or similar, or just mock some common ones
      const res = await api.get("/api/db/data?table=player", {
        headers: { "x-db-name-override": "player" }
      });
      // Mocking some warp data for demonstration if table doesn't exist
      setWarps([
        { id: 1, name: "Köy 1 (Kırmızı)", map_index: 1, x: 469300, y: 964200 },
        { id: 2, name: "Köy 1 (Sarı)", map_index: 21, x: 55700, y: 157900 },
        { id: 3, name: "Köy 1 (Mavi)", map_index: 41, x: 969600, y: 278400 },
        { id: 4, name: "Sohan Dağı", map_index: 61, x: 434200, y: 290600 },
        { id: 5, name: "Doyyumhwan", map_index: 62, x: 599400, y: 756300 },
        { id: 6, name: "Şeytan Kulesi", map_index: 66, x: 590500, y: 110500 },
        { id: 7, name: "Sürgün Mağarası", map_index: 72, x: 0, y: 0 },
      ]);
    } catch (err: any) {
      setWarps([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredWarps = warps.filter(w => 
    (w.name || "").toLowerCase().includes(search.toLowerCase()) || 
    String(w.map_index).includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Işınlanma Noktaları</h2>
          <p className="text-muted-foreground">Oyun içi harita ve ışınlanma koordinatlarını (warp) yönetin.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchData} disabled={loading} className="gap-2">
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} /> Yenile
          </Button>
          <Button className="gap-2">
            <Plus size={18} /> Yeni Nokta Ekle
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Navigation className="text-blue-500" size={20} /> Koordinat Listesi
            </CardTitle>
            <div className="relative w-80">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Harita adı veya Index ile ara..."
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
                  <TableHead>Harita Adı</TableHead>
                  <TableHead>Map Index</TableHead>
                  <TableHead>Koordinat X</TableHead>
                  <TableHead>Koordinat Y</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWarps.map((w, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-bold text-blue-600">{w.name}</TableCell>
                    <TableCell className="font-mono">{w.map_index}</TableCell>
                    <TableCell className="font-mono text-xs">{w.x}</TableCell>
                    <TableCell className="font-mono text-xs">{w.y}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" className="text-primary">
                          <Globe size={16} />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive">
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredWarps.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground italic">
                      Kayıt bulunamadı.
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
