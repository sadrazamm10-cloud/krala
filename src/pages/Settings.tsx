import { useState } from "react";
import { Settings as SettingsIcon, Save, RefreshCw, Shield, Bell, Globe, Database, Terminal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { toast } from "sonner";

export default function Settings() {
  const [config, setConfig] = useState({
    defaultFilePath: "/usr/game",
    defaultDb: "player",
    refreshInterval: "30",
    panelName: "Metin2 Admin Panel"
  });

  const handleSave = () => {
    localStorage.setItem("panel_config", JSON.stringify(config));
    toast.success("Ayarlar kaydedildi");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Ayarlar</h2>
        <p className="text-muted-foreground">Panel tercihlerini ve sistem yapılandırmasını yönetin.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe size={18} className="text-blue-500" /> Genel Ayarlar
            </CardTitle>
            <CardDescription>Panelin temel görünüm ve davranış ayarları.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Panel Başlığı</label>
              <Input 
                value={config.panelName} 
                onChange={(e) => setConfig({...config, panelName: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Veri Yenileme Aralığı (Saniye)</label>
              <Input 
                type="number" 
                value={config.refreshInterval} 
                onChange={(e) => setConfig({...config, refreshInterval: e.target.value})}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database size={18} className="text-emerald-500" /> Sistem Yolları
            </CardTitle>
            <CardDescription>Sunucu üzerindeki varsayılan dosya ve veritabanı yolları.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Varsayılan Dosya Dizini</label>
              <Input 
                value={config.defaultFilePath} 
                onChange={(e) => setConfig({...config, defaultFilePath: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Varsayılan Veritabanı</label>
              <Input 
                value={config.defaultDb} 
                onChange={(e) => setConfig({...config, defaultDb: e.target.value})}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield size={18} className="text-amber-500" /> Güvenlik
            </CardTitle>
            <CardDescription>Erişim ve güvenlik yapılandırması.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm font-medium">İki Faktörlü Doğrulama</p>
                <p className="text-xs text-muted-foreground">Henüz aktif değil</p>
              </div>
              <Button variant="outline" size="sm">Etkinleştir</Button>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm font-medium">Oturum Süresi</p>
                <p className="text-xs text-muted-foreground">24 Saat</p>
              </div>
              <Button variant="outline" size="sm">Düzenle</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-destructive/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <RefreshCw size={18} /> Sistemi Sıfırla
            </CardTitle>
            <CardDescription>Tüm yerel verileri ve bağlantı bilgilerini temizler.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" className="w-full" onClick={() => {
              if(confirm("Tüm veriler silinecek, emin misiniz?")) {
                localStorage.clear();
                window.location.reload();
              }
            }}>
              Fabrika Ayarlarına Dön
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} className="gap-2 px-8">
          <Save size={18} /> Ayarları Kaydet
        </Button>
      </div>
    </div>
  );
}
