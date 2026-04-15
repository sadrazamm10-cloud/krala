import { useState, useEffect } from "react";
import { Box, Search, RefreshCw, Info, Sword, Shield, Ghost, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import api from "../lib/api";
import { toast } from "sonner";
import { ITEM_NAMES, MOB_NAMES } from "../lib/mappings";

export default function GameData() {
  const [activeTab, setActiveTab] = useState<"items" | "mobs" | "skills" | "refine">("items");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchData = async (tab: "items" | "mobs" | "skills" | "refine") => {
    setLoading(true);
    let table = "";
    switch(tab) {
      case "items": table = "item_proto"; break;
      case "mobs": table = "mob_proto"; break;
      case "skills": table = "skill_proto"; break;
      case "refine": table = "refine_proto"; break;
    }
    
    try {
      const res = await api.get(`/api/db/data?table=${table}`, {
        headers: { "x-db-name-override": "player" }
      });
      setData(res.data);
      setActiveTab(tab);
    } catch (err: any) {
      toast.error("Veriler yüklenemedi: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData("items");
  }, []);

  const filteredData = data.filter(item => 
    (item.locale_name || item.name || item.dwName || "").toLowerCase().includes(search.toLowerCase()) || 
    String(item.vnum || item.id).includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Oyun Verileri</h2>
          <p className="text-muted-foreground">Prototip tablolarını (player.*_proto) inceleyin.</p>
        </div>
        <div className="flex bg-muted p-1 rounded-md overflow-x-auto max-w-full">
          {[
            { id: "items", label: "Item Proto", icon: Sword },
            { id: "mobs", label: "Mob Proto", icon: Ghost },
            { id: "skills", label: "Skill Proto", icon: Zap },
            { id: "refine", label: "Refine Proto", icon: RefreshCw }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => fetchData(tab.id as any)}
              className={`px-4 py-1.5 text-sm font-medium rounded-sm transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.id ? "bg-background shadow-sm" : "hover:text-primary"
              }`}
            >
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              {activeTab === "items" && <Box size={20} />}
              {activeTab === "mobs" && <Ghost size={20} />}
              {activeTab === "skills" && <Zap size={20} />}
              {activeTab === "refine" && <RefreshCw size={20} />}
              {activeTab === "items" ? "Eşya Listesi" : 
               activeTab === "mobs" ? "Yaratık Listesi" : 
               activeTab === "skills" ? "Beceri Listesi" : "Yükseltme Listesi"}
            </CardTitle>
            <div className="relative w-80">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="İsim veya VNUM ile ara..."
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
                  <TableHead className="w-[100px]">VNUM / ID</TableHead>
                  <TableHead>İsim / Açıklama</TableHead>
                  <TableHead>Tip / Detay</TableHead>
                  {activeTab === "items" ? (
                    <>
                      <TableHead>Seviye</TableHead>
                      <TableHead>Fiyat</TableHead>
                    </>
                  ) : activeTab === "mobs" ? (
                    <>
                      <TableHead>Level</TableHead>
                      <TableHead>HP</TableHead>
                    </>
                  ) : activeTab === "skills" ? (
                    <>
                      <TableHead>Max Level</TableHead>
                      <TableHead>Tür</TableHead>
                    </>
                  ) : (
                    <>
                      <TableHead>Maliyet</TableHead>
                      <TableHead>Şans</TableHead>
                    </>
                  )}
                  <TableHead className="text-right">İşlem</TableHead>
                </TableRow>
              </TableHeader>
                  <TableBody>
                {filteredData.map((item, i) => {
                  const vnum = item.vnum || item.id;
                  let displayName = item.locale_name || item.name || item.dwName || "---";
                  
                  if (activeTab === "items" && ITEM_NAMES[vnum]) {
                    displayName = ITEM_NAMES[vnum];
                  } else if (activeTab === "mobs" && MOB_NAMES[vnum]) {
                    displayName = MOB_NAMES[vnum];
                  }

                  return (
                    <TableRow key={i}>
                      <TableCell className="font-mono text-xs font-bold">{vnum}</TableCell>
                      <TableCell className="font-medium">{displayName}</TableCell>
                      <TableCell className="text-xs uppercase opacity-70">{item.type || item.szName || "---"}</TableCell>
                    {activeTab === "items" ? (
                      <>
                        <TableCell>{item.limitvalue0 || 0}</TableCell>
                        <TableCell className="text-emerald-600 font-mono text-xs">{item.gold?.toLocaleString() || 0}</TableCell>
                      </>
                    ) : activeTab === "mobs" ? (
                      <>
                        <TableCell>{item.level || 0}</TableCell>
                        <TableCell className="text-red-600 font-mono text-xs">{item.hp?.toLocaleString() || 0}</TableCell>
                      </>
                    ) : activeTab === "skills" ? (
                      <>
                        <TableCell>{item.dwMaxLevel || 0}</TableCell>
                        <TableCell className="text-xs">{item.szType || "---"}</TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell className="text-emerald-600 font-mono text-xs">{item.cost?.toLocaleString() || 0}</TableCell>
                        <TableCell className="font-bold text-blue-500">%{item.prob || 0}</TableCell>
                      </>
                    )}
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon">
                        <Info size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
                {filteredData.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground italic">
                      Veri bulunamadı.
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
