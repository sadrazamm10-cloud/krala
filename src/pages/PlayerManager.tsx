import { useState, useEffect } from "react";
import { Users, Search, RefreshCw, Edit2, ShieldAlert, ShieldCheck, Trash2, UserPlus, UserMinus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import api from "../lib/api";
import { toast } from "sonner";
import { useAppContext } from "../context/AppContext";

export default function PlayerManager() {
  const { tableMappings } = useAppContext();
  const [players, setPlayers] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const fetchPlayersAndAccounts = async () => {
    setLoading(true);
    try {
      // Use mapped table names if available
      const playerTable = tableMappings["player"] || "player";
      const accountTable = tableMappings["account"] || "account";

      // Fetch players
      const playerRes = await api.get(`/api/db/data?table=${playerTable}`, {
        headers: { "x-db-name-override": "player" }
      });
      
      // Fetch accounts for mapping
      const accRes = await api.get(`/api/db/data?table=${accountTable}`, {
        headers: { "x-db-name-override": "account" }
      });

      const accMap: Record<string, string> = {};
      accRes.data.forEach((a: any) => {
        accMap[String(a.id)] = a.login;
      });

      setAccounts(accMap);
      setPlayers(playerRes.data);
    } catch (err: any) {
      toast.error("Veriler yüklenemedi: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayersAndAccounts();
  }, []);

  const filteredPlayers = players.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    String(p.id).includes(search) ||
    (accounts[String(p.account_id)] || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (player: any) => {
    setSelectedPlayer({ ...player });
    setIsEditDialogOpen(true);
  };

  const savePlayer = async () => {
    try {
      // In a real app, we'd have a specific update endpoint
      // For now, we'll simulate it or use a generic exec if needed
      // But let's assume we'll add an update endpoint later or just toast success for now
      toast.success(`${selectedPlayer.name} başarıyla güncellendi (Simüle edildi)`);
      setIsEditDialogOpen(false);
      fetchPlayersAndAccounts();
    } catch (err: any) {
      toast.error("Güncelleme hatası: " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Oyuncu Yönetimi</h2>
          <p className="text-muted-foreground">Oyuncu bilgilerini düzenleyin, banlayın veya yetki verin.</p>
        </div>
        <Button variant="outline" onClick={fetchPlayersAndAccounts} disabled={loading} className="gap-2">
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} /> Yenile
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Oyuncu Listesi</CardTitle>
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
                  <TableHead>Exp</TableHead>
                  <TableHead>Gold</TableHead>
                  <TableHead>Son Giriş</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPlayers.map((player) => (
                  <TableRow key={player.id}>
                    <TableCell className="font-mono text-xs">{player.id}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-blue-600">
                          {accounts[String(player.account_id)] || "Bilinmeyen Hesap"}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">ID: {player.account_id}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-bold">{player.name}</TableCell>
                    <TableCell>{player.level}</TableCell>
                    <TableCell>{player.exp.toLocaleString()}</TableCell>
                    <TableCell>{player.gold.toLocaleString()}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(player.last_play).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(player)}>
                          <Edit2 size={16} />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-amber-500">
                          <ShieldAlert size={16} />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive">
                          <Trash2 size={16} />
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

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Oyuncu Düzenle: {selectedPlayer?.name}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm">Level</label>
              <Input 
                type="number" 
                className="col-span-3" 
                value={selectedPlayer?.level || ""} 
                onChange={(e) => setSelectedPlayer({...selectedPlayer, level: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm">Gold</label>
              <Input 
                type="number" 
                className="col-span-3" 
                value={selectedPlayer?.gold || ""} 
                onChange={(e) => setSelectedPlayer({...selectedPlayer, gold: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm">Exp</label>
              <Input 
                type="number" 
                className="col-span-3" 
                value={selectedPlayer?.exp || ""} 
                onChange={(e) => setSelectedPlayer({...selectedPlayer, exp: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>İptal</Button>
            <Button onClick={savePlayer}>Kaydet</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
