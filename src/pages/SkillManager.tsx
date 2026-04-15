import { useState, useEffect } from "react";
import { Zap, Search, RefreshCw, Info, Edit2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import api from "../lib/api";
import { toast } from "sonner";

export default function SkillManager() {
  const [skills, setSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/db/data?table=skill_proto", {
        headers: { "x-db-name-override": "player" }
      });
      setSkills(res.data);
    } catch (err: any) {
      toast.error("Beceri verileri yüklenemedi: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredSkills = skills.filter(s => 
    (s.szName || "").toLowerCase().includes(search.toLowerCase()) || 
    String(s.dwVnum || s.id).includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Beceri Yönetimi (Skill)</h2>
          <p className="text-muted-foreground">Karakter becerilerinin (player.skill_proto) hasar, soğuma ve özelliklerini yönetin.</p>
        </div>
        <Button variant="outline" onClick={fetchData} disabled={loading} className="gap-2">
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} /> Yenile
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Zap className="text-amber-500" size={20} /> Beceri Listesi
            </CardTitle>
            <div className="relative w-80">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Beceri adı veya VNUM ile ara..."
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
                  <TableHead className="w-[80px]">VNUM</TableHead>
                  <TableHead>Beceri Adı</TableHead>
                  <TableHead>Tür</TableHead>
                  <TableHead>Max Seviye</TableHead>
                  <TableHead>Soğuma (sn)</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSkills.map((s, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-mono text-xs font-bold">{s.dwVnum || s.id}</TableCell>
                    <TableCell className="font-medium text-blue-600">{s.szName}</TableCell>
                    <TableCell className="text-xs uppercase opacity-70">{s.szType || "---"}</TableCell>
                    <TableCell>{s.dwMaxLevel || 0}</TableCell>
                    <TableCell className="font-mono text-xs">{s.dwCoolTime || 0}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon">
                          <Edit2 size={16} />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Info size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredSkills.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground italic">
                      Beceri bulunamadı.
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
