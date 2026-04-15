import { useState, useEffect } from "react";
import { Shield, ShieldAlert, Server, Database, Search, RefreshCw, Trash2, Ban } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import api from "../lib/api";
import { toast } from "sonner";

export default function FirewallManager() {
  const [loading, setLoading] = useState(false);
  const [blocking, setBlocking] = useState(false);
  const [search, setSearch] = useState("");
  const [ipToBlock, setIpToBlock] = useState("");
  const [accountToBlock, setAccountToBlock] = useState("");
  const [blockedIPs, setBlockedIPs] = useState<any[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. SSH: iptables kurallarını oku
      await api.post("/api/console/command", { command: "iptables -L INPUT -v -n | grep DROP" });
      
      // 2. MySQL: account.account tablosundan banlı hesapları çek (Gerçek senaryoda IP ile eşleştirilir)
      await api.post("/api/db/query", { 
        query: "SELECT login, status FROM account WHERE status = 'BLOCK'", 
        dbName: "account" 
      });

      // Mocking combined data
      setBlockedIPs([
        { ip: "192.168.1.105", account: "hacker123", date: "2024-04-14 10:00", reason: "Speedhack", source: "SSH + MySQL" },
        { ip: "45.22.11.99", account: "bot_farm_01", date: "2024-04-13 15:30", reason: "Botting", source: "SSH + MySQL" },
        { ip: "88.244.12.5", account: "-", date: "2024-04-12 09:15", reason: "DDoS Attempt", source: "SSH Only" },
      ]);
    } catch (err: any) {
      toast.error("Güvenlik verileri alınamadı.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleBlock = async () => {
    if (!ipToBlock && !accountToBlock) {
      toast.error("Lütfen IP veya Hesap Adı girin.");
      return;
    }

    setBlocking(true);
    try {
      if (ipToBlock) {
        // SSH: iptables kuralı ekle
        await api.post("/api/console/command", { command: `iptables -A INPUT -s ${ipToBlock} -j DROP` });
      }
      
      if (accountToBlock) {
        // MySQL: Hesabı banla
        await api.post("/api/db/query", { 
          query: `UPDATE account SET status='BLOCK' WHERE login='${accountToBlock}'`, 
          dbName: "account" 
        });
      }

      toast.success("Engelleme işlemi başarıyla uygulandı.");
      setIpToBlock("");
      setAccountToBlock("");
      fetchData();
    } catch (err: any) {
      toast.error("Engelleme başarısız oldu.");
    } finally {
      setBlocking(false);
    }
  };

  const handleUnblock = async (ip: string) => {
    try {
      // SSH: iptables kuralını sil
      await api.post("/api/console/command", { command: `iptables -D INPUT -s ${ip} -j DROP` });
      toast.success(`${ip} engeli kaldırıldı.`);
      fetchData();
    } catch (err: any) {
      toast.error("Engel kaldırılamadı.");
    }
  };

  const filteredIPs = blockedIPs.filter(b => 
    b.ip.includes(search) || 
    (b.account || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gelişmiş Güvenlik (Firewall & Ban)</h2>
          <p className="text-muted-foreground">SSH (iptables) üzerinden IP engelleyin, MySQL üzerinden hesapları banlayın.</p>
        </div>
        <Button variant="outline" onClick={fetchData} disabled={loading} className="gap-2">
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} /> Yenile
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sol: Yeni Engel Ekleme */}
        <Card className="lg:col-span-1 border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <Ban size={20} /> Yeni Engel Ekle
            </CardTitle>
            <CardDescription>IP adresini sunucu seviyesinde, hesabı veritabanı seviyesinde engeller.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold flex items-center gap-1 text-blue-600">
                <Server size={14} /> Engellenecek IP Adresi (SSH: iptables)
              </label>
              <Input 
                placeholder="Örn: 192.168.1.100" 
                value={ipToBlock}
                onChange={(e) => setIpToBlock(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold flex items-center gap-1 text-emerald-600">
                <Database size={14} /> Engellenecek Hesap (MySQL: account)
              </label>
              <Input 
                placeholder="Örn: hacker_hesap" 
                value={accountToBlock}
                onChange={(e) => setAccountToBlock(e.target.value)}
              />
            </div>

            <div className="p-3 bg-amber-500/10 text-amber-600 rounded-md text-xs flex items-start gap-2">
              <ShieldAlert size={16} className="mt-0.5 shrink-0" />
              <p>Her iki alanı da doldurursanız, hem IP adresi sunucuya erişemez hem de hesap veritabanından kalıcı olarak kapatılır.</p>
            </div>

            <Button 
              onClick={handleBlock} 
              disabled={blocking || (!ipToBlock && !accountToBlock)} 
              className="w-full gap-2 bg-red-600 hover:bg-red-700"
            >
              <Shield size={18} /> Engelle (Ban)
            </Button>
          </CardContent>
        </Card>

        {/* Sağ: Engelli Listesi */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <ShieldAlert className="text-amber-500" size={20} /> Aktif Engellemeler
              </CardTitle>
              <CardDescription>iptables kuralları ve banlı hesaplar.</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="IP veya Hesap ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>IP Adresi</TableHead>
                    <TableHead>Hesap</TableHead>
                    <TableHead>Tarih</TableHead>
                    <TableHead>Kaynak</TableHead>
                    <TableHead className="text-right">İşlem</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredIPs.map((b, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-mono font-bold text-red-500">{b.ip}</TableCell>
                      <TableCell className="font-bold">{b.account}</TableCell>
                      <TableCell className="text-xs text-muted-foreground font-mono">{b.date}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                          b.source === "SSH + MySQL" ? "bg-purple-500/10 text-purple-500" : "bg-blue-500/10 text-blue-500"
                        }`}>
                          {b.source}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10 text-xs"
                          onClick={() => handleUnblock(b.ip)}
                        >
                          Engeli Kaldır
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredIPs.length === 0 && !loading && (
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
    </div>
  );
}
