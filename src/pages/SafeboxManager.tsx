import { useState, useEffect } from "react";
import { Shield, Search, RefreshCw, Trash2, Edit2, Info, User, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import api from "../lib/api";
import { toast } from "sonner";

export default function SafeboxManager() {
  const [safeboxes, setSafeboxes] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchSafeboxesAndAccounts = async () => {
    setLoading(true);
    try {
      // Fetch safeboxes
      const sbRes = await api.get("/api/db/data?table=safebox", {
        headers: { "x-db-name-override": "player" }
      });
      
      // Fetch accounts for mapping
      const accRes = await api.get("/api/db/data?table=account", {
        headers: { "x-db-name-override": "account" }
      });

      const accMap: Record<string, string> = {};
      accRes.data.forEach((a: any) => {
        accMap[String(a.id)] = a.login;
      });

      setAccounts(accMap);
      setSafeboxes(sbRes.data);
    } catch (err: any) {
      toast.error("Veriler yüklenemedi: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSafeboxesAndAccounts();
  }, []);

  const filteredSafeboxes = safeboxes.filter(sb => 
    String(sb.account_id).includes(search) || 
    String(sb.password).includes(search) ||
    (accounts[String(sb.account_id)] || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Depo Yönetimi</h2>
          <p className="text-muted-foreground">Oyuncu depolarını ve şifrelerini (player.safebox) yönetin.</p>
        </div>
        <Button variant="outline" onClick={fetchSafeboxesAndAccounts} disabled={loading} className="gap-2">
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} /> Yenile
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Lock className="text-amber-500" size={20} /> Depo Kayıtları
            </CardTitle>
            <div className="relative w-80">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Kullanıcı Adı veya Şifre ile ara..."
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
                  <TableHead>Hesap (Kullanıcı Adı)</TableHead>
                  <TableHead>Depo Şifresi</TableHead>
                  <TableHead>Altın</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSafeboxes.map((sb, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span className="text-blue-600 font-bold">
                          {accounts[String(sb.account_id)] || "Bilinmeyen Hesap"}
                        </span>
                        <span className="text-xs text-muted-foreground font-mono">ID: {sb.account_id}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-amber-600 font-bold">{sb.password || "Şifresiz"}</TableCell>
                    <TableCell className="text-emerald-600 font-mono">{sb.gold?.toLocaleString() || 0}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" title="Şifre Sıfırla">
                          <RefreshCw size={16} />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive">
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredSafeboxes.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-10 text-muted-foreground italic">
                      Depo kaydı bulunamadı.
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
