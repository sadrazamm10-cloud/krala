import { useState, useEffect } from "react";
import { Settings, Search, RefreshCw, Save, Terminal, Folder, FileCode, HardDrive } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import { toast } from "sonner";
import api from "../lib/api";

export default function ConfigEditor() {
  const [activeCore, setActiveCore] = useState("channel1/core1");
  const [configContent, setConfigContent] = useState("");
  const [loading, setLoading] = useState(false);

  const cores = [
    "db", "auth", "channel1/core1", "channel1/core2", "channel2/core1", "game99"
  ];

  const fetchConfig = async (core: string) => {
    setLoading(true);
    setActiveCore(core);
    try {
      // Simulated SSH reading of CONFIG file
      await api.post("/api/console/command", { command: `cat /usr/game/cores/${core}/CONFIG` });
      
      // Mocking CONFIG content
      const mockConfig = `HOSTNAME: ${core.replace("/", "_")}
CHANNEL: ${core.includes("channel1") ? "1" : core.includes("channel2") ? "2" : "99"}
PORT: ${core === "db" ? "15000" : core === "auth" ? "11002" : "13000"}
P2P_PORT: 14000
DB_ADDR: localhost
DB_USER: root
DB_PASSWORD: password
TABLE_POSTFIX: 
ITEM_ID_RANGE: 000000001 500000000
PASSES_PER_SEC: 25
SAVE_EVENT_SECOND_CYCLE: 180
PING_EVENT_SECOND_CYCLE: 30
PLAYER_SQL: localhost root password player
COMMON_SQL: localhost root password common
LOG_SQL: localhost root password log
LOCALE_SERVICE: turkey`;
      
      setConfigContent(mockConfig);
    } catch (err: any) {
      toast.error("Config okunamadı: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig("channel1/core1");
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simulated SSH writing to CONFIG file
      await api.post("/api/console/command", { command: `echo "${configContent}" > /usr/game/cores/${activeCore}/CONFIG` });
      toast.success("CONFIG dosyası başarıyla kaydedildi.");
    } catch (err: any) {
      toast.error("Kaydetme hatası: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Çekirdek Yapılandırması</h2>
          <p className="text-muted-foreground">Sunucu çekirdeklerindeki CONFIG dosyalarını düzenleyin (/usr/game/cores).</p>
        </div>
        <Button onClick={handleSave} disabled={loading} className="gap-2">
          <Save size={18} /> Değişiklikleri Kaydet
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Folder size={16} className="text-amber-500" /> Çekirdekler
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 space-y-1">
            {cores.map((core) => (
              <button
                key={core}
                onClick={() => fetchConfig(core)}
                className={`w-full text-left px-3 py-2 rounded-md text-xs font-mono transition-all flex items-center gap-2 ${
                  activeCore === core ? "bg-primary text-primary-foreground shadow-md" : "hover:bg-muted"
                }`}
              >
                <HardDrive size={14} /> {core}
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-mono flex items-center gap-2">
                <FileCode size={16} className="text-blue-500" /> /usr/game/cores/{activeCore}/CONFIG
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => fetchConfig(activeCore)} disabled={loading}>
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <textarea
              value={configContent}
              onChange={(e) => setConfigContent(e.target.value)}
              className="w-full h-[600px] p-4 font-mono text-xs bg-black/5 dark:bg-white/5 resize-none focus:outline-none"
              spellCheck={false}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
