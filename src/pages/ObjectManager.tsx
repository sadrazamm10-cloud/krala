import { useState, useEffect } from "react";
import { Box, Search, RefreshCw, Trash2, Info, Trophy, Home } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import api from "../lib/api";
import { toast } from "sonner";

export default function ObjectManager() {
  const [objects, setObjects] = useState<any[]>([]);
  const [lands, setLands] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const objRes = await api.get("/api/db/data?table=object", {
        headers: { "x-db-name-override": "player" }
      });
      
      const landRes = await api.get("/api/db/data?table=land", {
        headers: { "x-db-name-override": "player" }
      });

      const landMap: Record<string, string> = {};
      landRes.data.forEach((l: any) => {
        landMap[String(l.id)] = `Harita: ${l.map_index} (${l.x}, ${l.y})`;
      });

      setLands(landMap);
      setObjects(objRes.data);
    } catch (err: any) {
      toast.error("Nesne verileri yüklenemedi: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredObjects = objects.filter(o => 
    String(o.id).includes(search) || 
    String(o.vnum).includes(search) ||
    String(o.land_id).includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Lonca Nesneleri</h2>
          <p className="text-muted-foreground">Lonca arazilerindeki binaları ve nesneleri (player.object) yönetin.</p>
        </div>
        <Button variant="outline" onClick={fetchData} disabled={loading} className="gap-2">
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} /> Yenile
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Home className="text-blue-500" size={20} /> Nesne Listesi
            </CardTitle>
            <div className="relative w-80">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Nesne ID veya VNUM ile ara..."
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
                  <TableHead>VNUM</TableHead>
                  <TableHead>Arazi (ID / Konum)</TableHead>
                  <TableHead>Konum (X, Y)</TableHead>
                  <TableHead>Yaşam Süresi</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredObjects.map((o, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-mono text-xs">{o.id}</TableCell>
                    <TableCell className="font-bold text-blue-600">{o.vnum}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{lands[String(o.land_id)] || "Bilinmeyen Arazi"}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">Arazi ID: {o.land_id}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-mono">{o.x}, {o.y}</TableCell>
                    <TableCell className="text-xs">{o.life || "Süresiz"}</TableCell>
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
                {filteredObjects.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground italic">
                      Nesne kaydı bulunamadı.
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
