import { useState, useEffect } from "react";
import { Ticket, Search, RefreshCw, Trash2, Plus, Gift, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import api from "../lib/api";
import { toast } from "sonner";

export default function CouponManager() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      // common.coupon or similar
      const res = await api.get("/api/db/data?table=coupon", {
        headers: { "x-db-name-override": "common" }
      });
      setCoupons(res.data);
    } catch (err: any) {
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredCoupons = coupons.filter(c => 
    (c.code || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Hediye Kodları</h2>
          <p className="text-muted-foreground">Oyuncular için promosyon ve hediye kodlarını (common.coupon) yönetin.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchData} disabled={loading} className="gap-2">
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} /> Yenile
          </Button>
          <Button className="gap-2">
            <Plus size={18} /> Yeni Kod Oluştur
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Ticket className="text-amber-500" size={20} /> Aktif Kodlar
            </CardTitle>
            <div className="relative w-80">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Kod ile ara..."
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
                  <TableHead>Kod</TableHead>
                  <TableHead>Tür / Ödül</TableHead>
                  <TableHead>Kullanım Sınırı</TableHead>
                  <TableHead>Kullanılan</TableHead>
                  <TableHead>Bitiş Tarihi</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCoupons.map((c, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-mono font-bold text-blue-600">{c.code}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Gift size={14} className="text-pink-500" />
                        <span className="text-sm">{c.reward_type === 1 ? "Eşya" : "Ejderha Parası (EP)"}</span>
                      </div>
                    </TableCell>
                    <TableCell>{c.max_use || "Sınırsız"}</TableCell>
                    <TableCell className="font-bold">{c.used_count || 0}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {c.expiration ? new Date(c.expiration).toLocaleDateString() : "Süresiz"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="text-destructive">
                        <Trash2 size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredCoupons.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground italic">
                      Kayıtlı kod bulunamadı.
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
