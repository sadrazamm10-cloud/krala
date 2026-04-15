import { useState, useEffect } from "react";
import { ShieldX, Search, RefreshCw, Trash2, Plus, Globe, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import api from "../lib/api";
import { toast } from "sonner";

export default function IPBanManager() {
  const [bans, setBans] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      // Common table for IP bans
      const res = await api.get("/api/db/data?table=ip_ban", {
        headers: { "x-db-name-override": "common" }
      });
      setBans(res.data);
    } catch (err: any) {
      setBans([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredBans = bans.filter(b => 
    (b.ip || "").toLowerCase().includes(search.toLowerCase()) || 
    (b.reason || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">IP Engelleme</h2>
          <p className="text-muted-foreground">Sunucuya erişimi engellenen IP adreslerini (common.ip_ban) yönetin.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchData} disabled={loading} className="gap-2">
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} /> Yenile
          </Button>
          <Button className="gap-2" variant="destructive">
            <Plus size={18} /> Yeni IP Engelle
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <ShieldX className="text-red-500" size={20} /> Yasaklı IP Listesi
            </CardTitle>
            <div className="relative w-80">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="IP adresi veya neden ile ara..."
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
                  <TableHead>IP Adresi</TableHead>
                  <TableHead>Yasaklanma Nedeni</TableHead>
                  <TableHead>Bitiş Zamanı</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBans.map((b, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-mono font-bold text-red-600">{b.ip}</TableCell>
                    <TableCell className="text-sm italic">{b.reason || "Belirtilmedi"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {b.terminate_time ? new Date(b.terminate_time * 1000).toLocaleString() : "Süresiz"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="text-destructive">
                        <Trash2 size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredBans.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-10 text-muted-foreground italic">
                      Yasaklı IP bulunamadı.
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
