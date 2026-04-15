import { useState, useEffect } from "react";
import { Settings as SettingsIcon, Save, RefreshCw, Zap, TrendingUp, ShieldAlert, Globe, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import api from "../lib/api";
import { toast } from "sonner";

export default function ServerSettings() {
  const [expTable, setExpTable] = useState<any[]>([]);
  const [privSettings, setPrivSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const expRes = await api.get("/api/db/data?table=exp_table", {
        headers: { "x-db-name-override": "common" }
      });
      const privRes = await api.get("/api/db/data?table=priv_settings", {
        headers: { "x-db-name-override": "common" }
      });
      setExpTable(expRes.data);
      setPrivSettings(privRes.data);
    } catch (err: any) {
      toast.error("Veriler yüklenemedi: " + err.message);
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
          <h2 className="text-3xl font-bold tracking-tight">Sunucu Ayarları</h2>
          <p className="text-muted-foreground">Common veritabanındaki global ayarları ve EXP tablosunu yönetin.</p>
        </div>
        <Button variant="outline" onClick={fetchData} disabled={loading} className="gap-2">
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} /> Yenile
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* EXP Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="text-emerald-500" size={20} /> EXP Tablosu
            </CardTitle>
            <CardDescription>Level atlamak için gereken tecrübe puanları (common.exp_table).</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Level</TableHead>
                    <TableHead>Gereken EXP</TableHead>
                    <TableHead className="text-right">İşlem</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expTable.map((row, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-bold">{row.level || i + 1}</TableCell>
                      <TableCell className="font-mono">{row.exp?.toLocaleString() || row.amount?.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Save size={14} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Privilege Settings */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="text-amber-500" size={20} /> Global Oranlar (Priv)
              </CardTitle>
              <CardDescription>Drop, Exp ve Yang oranları (common.priv_settings).</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tür</TableHead>
                    <TableHead>Değer</TableHead>
                    <TableHead>Bitiş</TableHead>
                    <TableHead className="text-right">İşlem</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {privSettings.map((priv, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{priv.type}</TableCell>
                      <TableCell>%{priv.value}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{new Date(priv.end_time).toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="text-destructive">
                          <Trash2 size={14} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {privSettings.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6 text-muted-foreground italic">
                        Aktif global oran bulunamadı.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldAlert className="text-red-500" size={20} /> Yasaklı Kelimeler
              </CardTitle>
              <CardDescription>Sohbet satırında engellenen kelimeler (common.spam_db).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div className="flex gap-2">
                <Input placeholder="Yeni yasaklı kelime..." />
                <Button>Ekle</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {["gm", "admin", "satilik", "edit"].map(word => (
                  <span key={word} className="inline-flex items-center gap-1 px-2 py-1 rounded bg-muted border text-xs font-medium">
                    {word} <Trash2 size={10} className="cursor-pointer text-destructive" />
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
