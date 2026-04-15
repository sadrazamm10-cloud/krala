import { useState, useEffect } from "react";
import { Shield, UserPlus, Trash2, RefreshCw, Search, Globe, Server } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import api from "../lib/api";
import { toast } from "sonner";

export default function GMManager() {
  const [gmList, setGmList] = useState<any[]>([]);
  const [gmHosts, setGmHosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newGM, setNewGM] = useState({ mAccount: "", mName: "", mContactIP: "ANY", mAuthority: "IMPLEMENTOR" });

  const fetchData = async () => {
    setLoading(true);
    try {
      const listRes = await api.get("/api/db/data?table=gmlist", {
        headers: { "x-db-name-override": "common" }
      });
      const hostRes = await api.get("/api/db/data?table=gmhost", {
        headers: { "x-db-name-override": "common" }
      });
      setGmList(listRes.data);
      setGmHosts(hostRes.data);
    } catch (err: any) {
      toast.error("GM verileri yüklenemedi: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddGM = async () => {
    try {
      // In a real app, we'd send a POST to a specific GM endpoint
      toast.success(`${newGM.mName} GM olarak eklendi (Simüle edildi)`);
      setIsAddDialogOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error("Ekleme hatası: " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">GM Yönetimi</h2>
          <p className="text-muted-foreground">Oyun yöneticilerini ve yetkilerini (common.gmlist) yönetin.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchData} disabled={loading}>
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </Button>
          <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
            <UserPlus size={18} /> Yeni GM Ekle
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* GM List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="text-blue-500" size={20} /> Yetkili Listesi
            </CardTitle>
            <CardDescription>Oyun içerisindeki tüm yetkili karakterler.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hesap</TableHead>
                    <TableHead>Karakter</TableHead>
                    <TableHead>IP Kısıtlaması</TableHead>
                    <TableHead>Yetki Seviyesi</TableHead>
                    <TableHead className="text-right">İşlem</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gmList.map((gm, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{gm.mAccount}</TableCell>
                      <TableCell>{gm.mName}</TableCell>
                      <TableCell className="text-xs font-mono">{gm.mContactIP}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                          gm.mAuthority === "IMPLEMENTOR" ? "bg-red-500/10 text-red-500" : "bg-blue-500/10 text-blue-500"
                        }`}>
                          {gm.mAuthority}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="text-destructive">
                          <Trash2 size={16} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* GM Hosts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="text-emerald-500" size={20} /> Güvenli IP'ler
            </CardTitle>
            <CardDescription>GM girişi yapılabilecek IP adresleri (gmhost).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input placeholder="Yeni IP (örn: 1.2.3.4)" className="h-9" />
              <Button size="sm">Ekle</Button>
            </div>
            <ScrollArea className="h-[350px] pr-4">
              <div className="space-y-2">
                {gmHosts.map((host, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/50 border border-muted">
                    <span className="font-mono text-sm">{host.mIP || Object.values(host)[0]}</span>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive">
                      <Trash2 size={14} />
                    </Button>
                  </div>
                ))}
                {gmHosts.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground italic text-sm">
                    Kayıtlı IP bulunamadı.
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Add GM Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yeni GM Yetkisi Tanımla</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Hesap Adı (Login)</label>
              <Input value={newGM.mAccount} onChange={(e) => setNewGM({...newGM, mAccount: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Karakter Adı</label>
              <Input value={newGM.mName} onChange={(e) => setNewGM({...newGM, mName: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Yetki Seviyesi</label>
              <select 
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                value={newGM.mAuthority}
                onChange={(e) => setNewGM({...newGM, mAuthority: e.target.value})}
              >
                <option value="IMPLEMENTOR">IMPLEMENTOR (Tam Yetki)</option>
                <option value="HIGH_WIZARD">HIGH_WIZARD</option>
                <option value="GOD">GOD</option>
                <option value="LOW_WIZARD">LOW_WIZARD</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>İptal</Button>
            <Button onClick={handleAddGM}>Yetki Ver</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
