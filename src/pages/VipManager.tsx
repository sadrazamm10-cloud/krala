import { useState, useEffect } from "react";
import { Crown, Search, RefreshCw, Trash2, Plus, Star, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import api from "../lib/api";
import { toast } from "sonner";

export default function VipManager() {
  const [vips, setVips] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      // In many servers, VIPs are just accounts with a specific status or in a separate table
      const res = await api.get("/api/db/data?table=account", {
        headers: { "x-db-name-override": "account" }
      });
      // Filter accounts that have VIP status (simulated logic)
      const filtered = res.data.filter((a: any) => a.status === "VIP" || a.availDt > "2024-01-01");
      setVips(filtered);
    } catch (err: any) {
      setVips([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredVips = vips.filter(v => 
    (v.login || "").toLowerCase().includes(search.toLowerCase()) || 
    (v.email || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-amber-600">VIP Oyuncular</h2>
          <p className="text-muted-foreground">Özel statüye sahip (VIP) hesapları yönetin.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchData} disabled={loading} className="gap-2">
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} /> Yenile
          </Button>
          <Button className="gap-2 bg-amber-600 hover:bg-amber-700">
            <Crown size={18} /> VIP Ekle
          </Button>
        </div>
      </div>

      <Card className="border-amber-200 bg-amber-50/10">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Star className="text-amber-500" size={20} /> VIP Listesi
            </CardTitle>
            <div className="relative w-80">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Hesap adı veya E-posta ile ara..."
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
                  <TableHead>Hesap Adı</TableHead>
                  <TableHead>E-posta</TableHead>
                  <TableHead>VIP Bitiş</TableHead>
                  <TableHead>Kalan Gün</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVips.map((v, i) => (
                  <TableRow key={i} className="hover:bg-amber-500/5">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Crown size={14} className="text-amber-500" />
                        <span className="font-bold text-amber-700">{v.login}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{v.email}</TableCell>
                    <TableCell className="text-xs font-mono">
                      {v.availDt ? new Date(v.availDt).toLocaleDateString() : "Süresiz"}
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded-full bg-amber-500/10 text-amber-600 text-[10px] font-bold">
                        30 Gün
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="text-destructive">
                        <Trash2 size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredVips.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground italic">
                      VIP oyuncu bulunamadı.
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
