import { useState, useEffect } from "react";
import { RefreshCw, Search, Info, Edit2, Coins, Percent } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import api from "../lib/api";
import { toast } from "sonner";
import { ITEM_NAMES } from "../lib/mappings";

export default function RefineManager() {
  const [refines, setRefines] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/db/data?table=refine_proto", {
        headers: { "x-db-name-override": "player" }
      });
      setRefines(res.data);
    } catch (err: any) {
      toast.error("Yükseltme verileri yüklenemedi: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredRefines = refines.filter(r => 
    String(r.id).includes(search) || 
    [r.vnum0, r.vnum1, r.vnum2, r.vnum3, r.vnum4].some(v => String(v).includes(search))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Yükseltme Yönetimi (Refine)</h2>
          <p className="text-muted-foreground">Eşya yükseltme maliyetlerini, malzemelerini ve şanslarını (player.refine_proto) yönetin.</p>
        </div>
        <Button variant="outline" onClick={fetchData} disabled={loading} className="gap-2">
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} /> Yenile
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <RefreshCw className="text-emerald-500" size={20} /> Yükseltme Reçeteleri
            </CardTitle>
            <div className="relative w-80">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Reçete ID veya Malzeme VNUM ile ara..."
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
                  <TableHead className="w-[80px]">ID</TableHead>
                  <TableHead>Maliyet (Yang)</TableHead>
                  <TableHead>Başarı Şansı</TableHead>
                  <TableHead>Gerekli Malzemeler</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRefines.map((r, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-mono text-xs font-bold">{r.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-emerald-600 font-mono text-xs">
                        <Coins size={12} /> {r.cost?.toLocaleString() || 0}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 font-bold text-blue-600">
                        <Percent size={14} /> %{r.prob || 0}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        {[0, 1, 2, 3, 4].map(idx => {
                          const vnum = r[`vnum${idx}`];
                          const count = r[`count${idx}`];
                          if (!vnum || vnum === 0) return null;
                          return (
                            <div key={idx} className="flex items-center gap-1 bg-muted px-2 py-1 rounded text-[10px]">
                              <span className="font-bold">{ITEM_NAMES[vnum] || vnum}</span>
                              <span className="text-muted-foreground">x{count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon">
                          <Edit2 size={16} />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Info size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredRefines.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground italic">
                      Reçete bulunamadı.
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
