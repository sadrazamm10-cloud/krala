import { useState, useEffect } from "react";
import { User, Search, RefreshCw, Key, Ban, CheckCircle, Trash2, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import api from "../lib/api";
import { toast } from "sonner";

export default function AccountManager() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/db/data?table=account", {
        headers: { "x-db-name-override": "account" }
      });
      setAccounts(res.data);
    } catch (err: any) {
      toast.error("Hesaplar yüklenemedi: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const filteredAccounts = accounts.filter(a => 
    a.login.toLowerCase().includes(search.toLowerCase()) || 
    a.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Hesap Yönetimi</h2>
          <p className="text-muted-foreground">Kullanıcı hesaplarını yönetin, şifre sıfırlayın veya engelleyin.</p>
        </div>
        <Button variant="outline" onClick={fetchAccounts} disabled={loading} className="gap-2">
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} /> Yenile
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Hesap Listesi</CardTitle>
            <div className="relative w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Kullanıcı adı veya E-posta..."
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
                  <TableHead className="w-[80px]">ID</TableHead>
                  <TableHead>Kullanıcı Adı</TableHead>
                  <TableHead>E-posta</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Kayıt Tarihi</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAccounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell className="font-mono text-xs">{account.id}</TableCell>
                    <TableCell className="font-medium">{account.login}</TableCell>
                    <TableCell className="text-sm">{account.email}</TableCell>
                    <TableCell>
                      {account.status === "OK" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-medium">
                          <CheckCircle size={12} /> Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-destructive/10 text-destructive text-xs font-medium">
                          <Ban size={12} /> Yasaklı
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(account.create_time).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" title="Şifre Değiştir">
                          <Key size={16} />
                        </Button>
                        <Button variant="ghost" size="icon" title="E-posta Gönder">
                          <Mail size={16} />
                        </Button>
                        <Button variant="ghost" size="icon" className={account.status === "OK" ? "text-amber-500" : "text-emerald-500"}>
                          {account.status === "OK" ? <Ban size={16} /> : <CheckCircle size={16} />}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
