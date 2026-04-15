import { useState, useEffect } from "react";
import { MapPin, Search, RefreshCw, Users, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import api from "../lib/api";
import { toast } from "sonner";
import { MAP_NAMES } from "../lib/mappings";

export default function MapStatistics() {
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Get all players and group by map_index
      const res = await api.get("/api/db/data?table=player", {
        headers: { "x-db-name-override": "player" }
      });
      
      const mapCounts: Record<number, number> = {};
      res.data.forEach((p: any) => {
        const mapIdx = p.map_index || 0;
        mapCounts[mapIdx] = (mapCounts[mapIdx] || 0) + 1;
      });

      const formattedStats = Object.entries(mapCounts).map(([idx, count]) => ({
        index: Number(idx),
        name: MAP_NAMES[Number(idx)] || `Bilinmeyen Harita (${idx})`,
        count: count
      })).sort((a, b) => b.count - a.count);

      setStats(formattedStats);
    } catch (err: any) {
      setStats([]);
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
          <h2 className="text-3xl font-bold tracking-tight">Oyuncu Dağılımı</h2>
          <p className="text-muted-foreground">Hangi haritada kaç oyuncu olduğunu ve popüler bölgeleri izleyin.</p>
        </div>
        <Button variant="outline" onClick={fetchData} disabled={loading} className="gap-2">
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} /> Yenile
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="text-red-500" size={20} /> Harita İstatistikleri
            </CardTitle>
            <CardDescription>Aktif oyuncuların haritalara göre dağılımı.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[600px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Index</TableHead>
                    <TableHead>Harita Adı</TableHead>
                    <TableHead>Oyuncu Sayısı</TableHead>
                    <TableHead>Yoğunluk</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.map((s, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-mono text-xs">{s.index}</TableCell>
                      <TableCell className="font-bold text-blue-600">{s.name}</TableCell>
                      <TableCell className="font-bold">
                        <div className="flex items-center gap-2">
                          <Users size={14} className="text-muted-foreground" />
                          {s.count}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden max-w-[100px]">
                          <div 
                            className={`h-full ${s.count > 50 ? "bg-red-500" : s.count > 20 ? "bg-amber-500" : "bg-emerald-500"}`} 
                            style={{ width: `${Math.min(s.count * 2, 100)}%` }}
                          ></div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-blue-500/5 border-blue-500/20">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2 text-blue-600">
                <Globe size={16} /> En Popüler Bölge
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats[0]?.name || "---"}</div>
              <p className="text-[10px] text-muted-foreground mt-1">Şu an en çok oyuncunun bulunduğu harita.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Hızlı Bakış</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span>Köy 1 Bölgeleri</span>
                <span className="font-bold text-blue-600">
                  {stats.filter(s => [1, 21, 41].includes(s.index)).reduce((acc, curr) => acc + curr.count, 0)} Oyuncu
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span>Kasılma Bölgeleri</span>
                <span className="font-bold text-emerald-600">
                  {stats.filter(s => ![1, 21, 41, 3, 23, 43].includes(s.index)).reduce((acc, curr) => acc + curr.count, 0)} Oyuncu
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span>Zindanlar</span>
                <span className="font-bold text-amber-600">
                  {stats.filter(s => [66, 104, 105, 107].includes(s.index)).reduce((acc, curr) => acc + curr.count, 0)} Oyuncu
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
