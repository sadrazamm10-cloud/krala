import { useState, useEffect } from "react";
import { Activity, Cpu, HardDrive, RefreshCw, Server, MemoryStick } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import api from "../lib/api";
import { toast } from "sonner";

export default function ServerPerformance() {
  const [loading, setLoading] = useState(false);
  const [cpuData, setCpuData] = useState<any[]>([]);
  const [ramData, setRamData] = useState<any[]>([]);
  const [processes, setProcesses] = useState<any[]>([]);
  const [diskUsage, setDiskUsage] = useState({ used: 0, total: 100, percent: 0 });

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Simulated SSH: ps aux | grep game
      await api.post("/api/console/command", { command: "ps aux | grep game" });
      
      // Mock Process Data
      setProcesses([
        { pid: 1024, user: "root", cpu: 12.5, mem: 8.2, command: "./game (channel1/core1)" },
        { pid: 1025, user: "root", cpu: 11.2, mem: 8.0, command: "./game (channel1/core2)" },
        { pid: 1026, user: "root", cpu: 4.5, mem: 5.1, command: "./game (channel2/core1)" },
        { pid: 1027, user: "root", cpu: 18.9, mem: 12.4, command: "./game (game99)" },
        { pid: 1028, user: "root", cpu: 2.1, mem: 4.5, command: "./db" },
        { pid: 1029, user: "root", cpu: 0.5, mem: 1.2, command: "./auth" },
      ]);

      // 2. Simulated SSH: df -h /usr/game
      setDiskUsage({ used: 45, total: 100, percent: 45 });

      // 3. Update Live Charts
      const now = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const newCpu = Math.floor(Math.random() * 40) + 10; // 10-50%
      const newRam = Math.floor(Math.random() * 20) + 40; // 40-60%

      setCpuData(prev => [...prev.slice(-19), { time: now, value: newCpu }]);
      setRamData(prev => [...prev.slice(-19), { time: now, value: newRam }]);

    } catch (err: any) {
      toast.error("Performans verileri alınamadı.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Auto refresh every 5 seconds
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Canlı Performans Monitörü</h2>
          <p className="text-muted-foreground">SSH üzerinden (top, free, ps) sunucu kaynak tüketimini izleyin.</p>
        </div>
        <Button variant="outline" onClick={fetchData} disabled={loading} className="gap-2">
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} /> Anlık Yenile
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* CPU Chart */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Cpu className="text-blue-500" size={18} /> CPU Kullanımı (%)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={cpuData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis dataKey="time" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '8px' }} />
                  <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Disk & RAM Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <MemoryStick className="text-emerald-500" size={18} /> RAM Kullanımı
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-500 mb-2">
                {ramData.length > 0 ? ramData[ramData.length - 1].value : 0}%
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-500" 
                  style={{ width: `${ramData.length > 0 ? ramData[ramData.length - 1].value : 0}%` }}
                ></div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Toplam 16 GB RAM üzerinden hesaplanmaktadır.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <HardDrive className="text-amber-500" size={18} /> Disk Kullanımı (/usr/game)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-500 mb-2">{diskUsage.percent}%</div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-amber-500" style={{ width: `${diskUsage.percent}%` }}></div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">{diskUsage.used} GB / {diskUsage.total} GB Kullanılıyor</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Process List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="text-purple-500" size={20} /> Aktif Metin2 Süreçleri (ps aux | grep game)
          </CardTitle>
          <CardDescription>Sunucuda çalışan çekirdeklerin anlık kaynak tüketimleri.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PID</TableHead>
                <TableHead>Kullanıcı</TableHead>
                <TableHead>Komut (Çekirdek)</TableHead>
                <TableHead className="text-right">% CPU</TableHead>
                <TableHead className="text-right">% MEM</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {processes.map((proc, i) => (
                <TableRow key={i}>
                  <TableCell className="font-mono text-xs">{proc.pid}</TableCell>
                  <TableCell>{proc.user}</TableCell>
                  <TableCell className="font-bold text-blue-500">{proc.command}</TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    <span className={proc.cpu > 15 ? "text-red-500 font-bold" : ""}>{proc.cpu.toFixed(1)}</span>
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    <span className={proc.mem > 10 ? "text-amber-500 font-bold" : ""}>{proc.mem.toFixed(1)}</span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
