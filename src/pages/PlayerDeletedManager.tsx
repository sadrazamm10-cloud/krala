import { useState, useEffect } from "react";
import { UserX, Search, RefreshCw, Trash2, RotateCcw, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import api from "../lib/api";
import { toast } from "sonner";

export default function PlayerDeletedManager() {
  const [deletedPlayers, setDeletedPlayers] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/db/data?table=player_deleted", {
        headers: { "x-db-name-override": "player" }
      });
      
      const accRes = await api.get("/api/db/data?table=account", {
        headers: { "x-db-name-override": "account" }
      });

      const accMap: Record<string, string> = {};
      accRes.data.forEach((a: any) => {
        accMap[String(a.id)] = a.login;
      });

      setAccounts(accMap);
      setDeletedPlayers(res.data);
    } catch (err: any) {
      toast.error("Veriler yüklenemedi: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredPlayers = deletedPlayers.filter(p => 
    (p.name || "").toLowerCase().includes(search.toLowerCase()) || 
    String(p.id).includes(search) ||
    (accounts[String(p.account_id)] || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Silinen Oyuncular</h2>
          <p className="text-muted-foreground">Silinmiş oyuncu kayıtlarını (player.player_deleted) görüntüleyin.</p>
        </div>
        <Button variant="outline" onClick={fetchData} disabled={loading} className="gap-2">
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} /> Yenile
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <UserX className="text-red-500" size={20} /> Silinen Kayıtlar
            </CardTitle>
            <div className="relative w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="İsim veya ID ile ara..."
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
                  <TableHead>Hesap</TableHead>
                  <TableHead>İsim</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Silinme Tarihi</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPlayers.map((player, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-mono text-xs">{player.id}</TableCell>
                    <TableCell className="font-medium text-blue-600">
                      {accounts[String(player.account_id)] || `ID: ${player.account_id}`}
                    </TableCell>
                    <TableCell className="font-bold">{player.name}</TableCell>
                    <TableCell>{player.level}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {player.deleted_at ? new Date(player.deleted_at).toLocaleString() : "---"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" title="Geri Yükle">
                          <RotateCcw size={16} className="text-emerald-500" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive">
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredPlayers.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground italic">
                      Silinen oyuncu kaydı bulunamadı.
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
