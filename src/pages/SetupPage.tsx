import React, { useState } from "react";
import { Server, Shield, Database, Key, Globe, LogIn, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { toast } from "sonner";
import api from "../lib/api";
import { useAppContext } from "../context/AppContext";

export default function SetupPage() {
  const { setConnected } = useAppContext();
  const [creds, setCreds] = useState({
    sshHost: "",
    sshPort: "22",
    sshUser: "root",
    sshPassword: "",
    dbHost: "127.0.0.1",
    dbPort: "3306",
    dbUser: "root",
    dbPassword: "",
    dbName: "player"
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCreds({ ...creds, [e.target.name]: e.target.value });
  };

  const handleConnect = async () => {
    setLoading(true);
    // Temporarily save to localstorage so api interceptor can pick it up for the test call
    localStorage.setItem("game_panel_creds", JSON.stringify(creds));
    
    try {
      await api.get("/api/test-connection");
      toast.success("Bağlantı başarılı!");
      setConnected(true, creds);
    } catch (err: any) {
      localStorage.removeItem("game_panel_creds");
      toast.error("Bağlantı hatası: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-2xl border-primary/20 backdrop-blur-sm bg-card/80">
        <CardHeader className="text-center space-y-1">
          <div className="mx-auto w-12 h-12 bg-primary rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-primary/20">
            <Server className="text-primary-foreground" size={24} />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">Sunucu Bağlantısı</CardTitle>
          <CardDescription>
            Yönetim paneline erişmek için sunucu ve veritabanı bilgilerinizi girin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
            <Info className="text-red-500 shrink-0 mt-0.5" size={20} />
            <div className="text-sm text-red-500">
              <strong className="block mb-1 text-red-600 text-lg">Nasıl Bağlanılır?</strong>
              <ul className="list-disc pl-4 space-y-1">
                <li><strong>SSH Ayarları:</strong> Sunucunuzun IP adresini, SSH portunu (genelde 22), kullanıcı adını (genelde root) ve şifresini girin. Bu bilgiler, sunucu dosyalarınızı (/usr/game) yönetmek içindir.</li>
                <li><strong>MySQL Ayarları:</strong> Veritabanı IP adresinizi (aynı sunucudaysa IP'yi yazın), portunu (genelde 3306), kullanıcı adını ve şifresini girin.</li>
                <li>Bağlantı sağlandıktan sonra tüm panel özellikleri aktifleşecektir.</li>
              </ul>
            </div>
          </div>

          <Tabs defaultValue="ssh" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="ssh" className="gap-2">
                <Globe size={16} /> SSH Ayarları
              </TabsTrigger>
              <TabsTrigger value="db" className="gap-2">
                <Database size={16} /> MySQL Ayarları
              </TabsTrigger>
            </TabsList>

            <TabsContent value="ssh" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Sunucu IP / Host</label>
                  <Input name="sshHost" value={creds.sshHost} onChange={handleChange} placeholder="1.2.3.4" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Port</label>
                  <Input name="sshPort" value={creds.sshPort} onChange={handleChange} placeholder="22" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Kullanıcı Adı</label>
                <Input name="sshUser" value={creds.sshUser} onChange={handleChange} placeholder="root" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Şifre</label>
                <Input name="sshPassword" type="password" value={creds.sshPassword} onChange={handleChange} placeholder="••••••••" />
              </div>
            </TabsContent>

            <TabsContent value="db" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">DB Host</label>
                  <Input name="dbHost" value={creds.dbHost} onChange={handleChange} placeholder="localhost" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">DB Port</label>
                  <Input name="dbPort" value={creds.dbPort} onChange={handleChange} placeholder="3306" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">DB Kullanıcı</label>
                  <Input name="dbUser" value={creds.dbUser} onChange={handleChange} placeholder="root" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">DB Adı</label>
                  <Input name="dbName" value={creds.dbName} onChange={handleChange} placeholder="player" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">DB Şifre</label>
                <Input name="dbPassword" type="password" value={creds.dbPassword} onChange={handleChange} placeholder="••••••••" />
              </div>
            </TabsContent>

            <Button className="w-full h-12 text-lg gap-2 shadow-lg shadow-primary/20" onClick={handleConnect} disabled={loading}>
              {loading ? <RefreshCw className="animate-spin" /> : <LogIn size={20} />}
              {loading ? "Bağlanılıyor..." : "Bağlan ve Devam Et"}
            </Button>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

const RefreshCw = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>
);
