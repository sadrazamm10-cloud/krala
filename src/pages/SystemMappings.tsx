import React, { useState, useEffect } from "react";
import { Save, Database, Terminal, RefreshCw, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { toast } from "sonner";
import { useAppContext } from "../context/AppContext";

export default function SystemMappings() {
  const { tableMappings, updateTableMapping } = useAppContext();
  
  // Default tables used in the system
  const defaultTables = [
    { key: "account", label: "Hesaplar (Account)", default: "account" },
    { key: "player", label: "Oyuncular (Player)", default: "player" },
    { key: "player_deleted", label: "Silinen Oyuncular", default: "player_deleted" },
    { key: "item", label: "Envanter (Item)", default: "item" },
    { key: "safebox", label: "Depo (Safebox)", default: "safebox" },
    { key: "guild", label: "Loncalar (Guild)", default: "guild" },
    { key: "guild_member", label: "Lonca Üyeleri", default: "guild_member" },
    { key: "marriage", label: "Evlilikler (Marriage)", default: "marriage" },
    { key: "messenger_list", label: "Arkadaş Listesi", default: "messenger_list" },
    { key: "affect", label: "Aktif Etkiler (Affect)", default: "affect" },
    { key: "item_award", label: "Ödüller (Item Award)", default: "item_award" },
    { key: "land", label: "Araziler (Land)", default: "land" },
    { key: "object", label: "Lonca Nesneleri (Object)", default: "object" },
    { key: "event", label: "Etkinlikler (Event)", default: "event" },
    { key: "notice", label: "Duyurular (Notice)", default: "notice" },
    { key: "ip_ban", label: "IP Banları", default: "ip_ban" },
    { key: "hack_log", label: "Hile Logları", default: "hack_log" },
    { key: "chat_log", label: "Sohbet Logları", default: "chat_log" },
    { key: "whisper_log", label: "Fısıltı Logları", default: "whisper_log" },
    { key: "trade_log", label: "Ticaret Logları", default: "trade_log" },
    { key: "coupon", label: "Kuponlar (Coupon)", default: "coupon" },
    { key: "vip", label: "VIP Oyuncular", default: "vip" },
    { key: "skill", label: "Beceriler (Skill)", default: "skill" },
    { key: "refine", label: "Yükseltmeler (Refine)", default: "refine" },
    { key: "warp", label: "Işınlanma Noktaları", default: "warp" },
    { key: "item_attr", label: "Efsun Oranları", default: "item_attr" },
    { key: "banword", label: "Yasaklı Kelimeler", default: "banword" },
    { key: "priv_settings", label: "Sunucu Oranları", default: "priv_settings" },
    { key: "gmlist", label: "GM Listesi", default: "gmlist" },
    { key: "log", label: "Sistem Logları", default: "log" },
    { key: "shop", label: "Marketler (Shop)", default: "shop" },
    { key: "shop_item", label: "Market Eşyaları", default: "shop_item" },
    { key: "mob_drop_item", label: "Canavar Düşenleri", default: "mob_drop_item" },
    { key: "quest", label: "Görevler (Quest)", default: "quest" },
    { key: "item_proto", label: "Eşya Protosu", default: "item_proto" },
    { key: "mob_proto", label: "Canavar Protosu", default: "mob_proto" }
  ];

  // Default SSH Paths
  const defaultPaths = [
    { key: "game_dir", label: "Oyun Ana Dizini", default: "/usr/game" },
    { key: "mysql_dir", label: "MySQL Dizini", default: "/var/db/mysql" },
    { key: "quest_dir", label: "Quest Dizini", default: "/usr/game/share/locale/turkey/quest" },
    { key: "log_dir", label: "Log Dizini", default: "/usr/game/logs" }
  ];

  const [mappings, setMappings] = useState<Record<string, string>>({});
  const [paths, setPaths] = useState<Record<string, string>>({});

  useEffect(() => {
    setMappings(tableMappings || {});
    const storedPaths = localStorage.getItem("mt2_ssh_paths");
    if (storedPaths) {
      setPaths(JSON.parse(storedPaths));
    }
  }, [tableMappings]);

  const handleMappingChange = (key: string, value: string) => {
    setMappings(prev => ({ ...prev, [key]: value }));
  };

  const handlePathChange = (key: string, value: string) => {
    setPaths(prev => ({ ...prev, [key]: value }));
  };

  const saveAll = () => {
    // Save table mappings
    Object.entries(mappings).forEach(([key, value]) => {
      if (value.trim() !== "") {
        updateTableMapping(key, value);
      }
    });

    // Save SSH paths
    localStorage.setItem("mt2_ssh_paths", JSON.stringify(paths));
    
    toast.success("Tüm eşleştirmeler ve yollar başarıyla kaydedildi!");
  };

  const resetDefaults = () => {
    if (confirm("Tüm ayarları varsayılan değerlere sıfırlamak istediğinize emin misiniz?")) {
      localStorage.removeItem("mt2_table_mappings");
      localStorage.removeItem("mt2_ssh_paths");
      setMappings({});
      setPaths({});
      toast.success("Ayarlar varsayılana sıfırlandı. Sayfa yenileniyor...");
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Sistem Yolları ve Eşleştirmeler</h2>
        <p className="text-muted-foreground">Oyununuzun veritabanı tablolarını ve SSH dizinlerini buradan özelleştirebilirsiniz.</p>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg flex items-start gap-3">
        <Info className="text-blue-500 shrink-0 mt-0.5" size={20} />
        <div className="text-sm text-blue-100">
          <p><strong>Bilgi:</strong> Eğer oyununuzun veritabanı yapısı standarttan farklıysa (örneğin <code>player</code> tablosu yerine <code>oyuncu</code> tablosunu kullanıyorsanız), ilgili alanları buradan değiştirebilirsiniz. Boş bırakılan alanlar varsayılan değerleri kullanır.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Veritabanı Eşleştirmeleri */}
        <Card className="flex flex-col h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database size={20} className="text-emerald-500" /> Veritabanı Tablo Eşleştirmeleri
            </CardTitle>
            <CardDescription>Sistemin veri çekeceği MySQL tablolarını belirleyin.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto max-h-[600px] pr-2 space-y-4 custom-scrollbar">
            {defaultTables.map((table) => (
              <div key={table.key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-muted/30 rounded-lg border">
                <div className="flex-1">
                  <label className="text-sm font-medium">{table.label}</label>
                  <p className="text-xs text-muted-foreground">Varsayılan: <code>{table.default}</code></p>
                </div>
                <div className="w-full sm:w-1/2">
                  <Input 
                    placeholder={table.default}
                    value={mappings[table.key] || ""}
                    onChange={(e) => handleMappingChange(table.key, e.target.value)}
                    className="bg-background"
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* SSH Yolları */}
        <Card className="flex flex-col h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Terminal size={20} className="text-amber-500" /> SSH Dizin Yolları
            </CardTitle>
            <CardDescription>Sunucu üzerindeki dosya yollarını belirleyin.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {defaultPaths.map((path) => (
              <div key={path.key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-muted/30 rounded-lg border">
                <div className="flex-1">
                  <label className="text-sm font-medium">{path.label}</label>
                  <p className="text-xs text-muted-foreground">Varsayılan: <code>{path.default}</code></p>
                </div>
                <div className="w-full sm:w-1/2">
                  <Input 
                    placeholder={path.default}
                    value={paths[path.key] || ""}
                    onChange={(e) => handlePathChange(path.key, e.target.value)}
                    className="bg-background"
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between pt-4 border-t">
        <Button variant="destructive" onClick={resetDefaults} className="gap-2">
          <RefreshCw size={18} /> Varsayılana Sıfırla
        </Button>
        <Button onClick={saveAll} className="gap-2 px-8 bg-primary hover:bg-primary/90">
          <Save size={18} /> Tüm Değişiklikleri Kaydet
        </Button>
      </div>
    </div>
  );
}
