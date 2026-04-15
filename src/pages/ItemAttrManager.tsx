import { useState, useEffect } from "react";
import { Sparkles, Search, RefreshCw, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import api from "../lib/api";
import { toast } from "sonner";

const APPLY_TYPES: Record<string, string> = {
  "APPLY_STR": "Güç",
  "APPLY_DEX": "Çeviklik",
  "APPLY_CON": "Canlılık",
  "APPLY_INT": "Zeka",
  "APPLY_MAX_HP": "Max HP",
  "APPLY_MAX_SP": "Max SP",
  "APPLY_ATT_SPEED": "Saldırı Hızı",
  "APPLY_MOV_SPEED": "Hareket Hızı",
  "APPLY_CAST_SPEED": "Büyü Hızı",
  "APPLY_HP_REGEN": "HP Üretimi",
  "APPLY_SP_REGEN": "SP Üretimi",
  "APPLY_POISON_PCT": "Zehirlenme Değişimi",
  "APPLY_STUN_PCT": "Sersemletme Şansı",
  "APPLY_SLOW_PCT": "Yavaşlatma Şansı",
  "APPLY_CRITICAL_PCT": "Kritik Vuruş Şansı",
  "APPLY_PENETRATE_PCT": "Delici Vuruş Şansı",
  "APPLY_ATTBONUS_HUMAN": "Yarı İnsanlara Karşı Güç",
  "APPLY_ATTBONUS_ANIMAL": "Hayvanlara Karşı Güç",
  "APPLY_ATTBONUS_ORC": "Orklara Karşı Güç",
  "APPLY_ATTBONUS_MILGYU": "Mistiklere Karşı Güç",
  "APPLY_ATTBONUS_UNDEAD": "Ölümsüzlere Karşı Güç",
  "APPLY_ATTBONUS_DEVIL": "Şeytanlara Karşı Güç",
  "APPLY_STEAL_HP": "Hasar HP Tarafından Emilecek",
  "APPLY_STEAL_SP": "Hasar SP Tarafından Emilecek",
  "APPLY_MANA_BURN_PCT": "Mana Çalma Şansı",
  "APPLY_BLOCK": "Yakın Dövüş Bloklama",
  "APPLY_DODGE": "Oklardan Korunma",
  "APPLY_RESIST_SWORD": "Kılıç Savunması",
  "APPLY_RESIST_TWOHAND": "Çiftel Savunması",
  "APPLY_RESIST_DAGGER": "Bıçak Savunması",
  "APPLY_RESIST_BELL": "Çan Savunması",
  "APPLY_RESIST_FAN": "Yelpaze Savunması",
  "APPLY_RESIST_BOW": "Oka Karşı Dayanıklılık",
  "APPLY_RESIST_FIRE": "Ateşe Karşı Dayanıklılık",
  "APPLY_RESIST_ELEC": "Şimşeğe Karşı Dayanıklılık",
  "APPLY_RESIST_MAGIC": "Büyüye Karşı Dayanıklılık",
  "APPLY_RESIST_WIND": "Rüzgara Karşı Dayanıklılık",
  "APPLY_REFLECT_MELEE": "Yakın Dövüş Yansıtma",
  "APPLY_POISON_REDUCE": "Zehre Karşı Koyma",
  "APPLY_EXP_DOUBLE_BONUS": "Exp Bonusu",
  "APPLY_GOLD_DOUBLE_BONUS": "İki Kat Altın Şansı",
  "APPLY_ITEM_DROP_BONUS": "İki Kat Eşya Şansı",
};

export default function ItemAttrManager() {
  const [attrs, setAttrs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/db/data?table=item_attr", {
        headers: { "x-db-name-override": "player" }
      });
      setAttrs(res.data);
    } catch (err: any) {
      toast.error("Efsun verileri yüklenemedi: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredAttrs = attrs.filter(a => 
    (a.apply || "").toLowerCase().includes(search.toLowerCase()) || 
    (APPLY_TYPES[a.apply] || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Efsun Oranları</h2>
          <p className="text-muted-foreground">Eşyalara gelen efsunların oranlarını ve şanslarını (player.item_attr) yönetin.</p>
        </div>
        <Button variant="outline" onClick={fetchData} disabled={loading} className="gap-2">
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} /> Yenile
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Sparkles className="text-amber-500" size={20} /> Efsun Listesi
            </CardTitle>
            <div className="relative w-80">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Efsun adı veya kod ile ara..."
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
                  <TableHead>Efsun (Kod)</TableHead>
                  <TableHead>Açıklama</TableHead>
                  <TableHead>Olasılık</TableHead>
                  <TableHead>Seviye 1</TableHead>
                  <TableHead>Seviye 2</TableHead>
                  <TableHead>Seviye 3</TableHead>
                  <TableHead>Seviye 4</TableHead>
                  <TableHead>Seviye 5</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAttrs.map((a, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-mono text-xs font-bold text-blue-600">{a.apply}</TableCell>
                    <TableCell className="font-medium">{APPLY_TYPES[a.apply] || "Bilinmeyen Efsun"}</TableCell>
                    <TableCell className="text-xs font-mono">{a.prob}</TableCell>
                    <TableCell className="font-bold">{a.lv1}</TableCell>
                    <TableCell className="font-bold">{a.lv2}</TableCell>
                    <TableCell className="font-bold">{a.lv3}</TableCell>
                    <TableCell className="font-bold">{a.lv4}</TableCell>
                    <TableCell className="font-bold">{a.lv5}</TableCell>
                  </TableRow>
                ))}
                {filteredAttrs.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10 text-muted-foreground italic">
                      Efsun kaydı bulunamadı.
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
