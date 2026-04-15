import { useState, useEffect } from "react";
import { Zap, Search, RefreshCw, Plus, Trash2, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import api from "../lib/api";
import { toast } from "sonner";

export default function PrivManager() {
  const [privs, setPrivs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/db/data?table=priv_settings", {
        headers: { "x-db-name-override": "common" }
      });
      setPrivs(res.data);
    } catch (err: any) {
      toast.error("Priv ayarları yüklenemedi: " + err.message);
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
          <h2 className="text-3xl font-bold tracking-tight">Sunucu Oranları (Priv)</h2>
          <p className="text-muted-foreground">Drop, Exp ve Gold oranlarını (common.priv_settings) yönetin.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchData} disabled={loading} className="gap-2">
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} /> Yenile
          </Button>
          <Button className="gap-2">
            <Plus size={18} /> Yeni Oran Ekle
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Globe className="text-emerald-500" size={20} /> Aktif Oranlar
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tür</TableHead>
                  <TableHead>Hedef (Empire/Player)</TableHead>
                  <TableHead>Değer (%)</TableHead>
                  <TableHead>Bitiş Zamanı</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {privs.map((p, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-bold">
                      {p.type === 1 ? "Eşya Drop" : p.type === 2 ? "Gold Drop" : p.type === 3 ? "Gold10 Drop" : "EXP Oranı"}
                    </TableCell>
                    <TableCell>
                      {p.empire === 0 ? "Tüm İmparatorluklar" : `İmparatorluk ${p.empire}`}
                    </TableCell>
                    <TableCell className="text-blue-600 font-bold">%{p.value}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {p.end_time ? new Date(p.end_time * 1000).toLocaleString() : "Süresiz"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="text-destructive">
                        <Trash2 size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {privs.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground italic">
                      Aktif oran bulunamadı.
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
