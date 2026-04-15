import { useState, useEffect } from "react";
import { Megaphone, Search, RefreshCw, Trash2, Plus, Send, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import api from "../lib/api";
import { toast } from "sonner";

export default function NoticeManager() {
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newNotice, setNewNotice] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      // In some versions, notices are in common.notice
      const res = await api.get("/api/db/data?table=notice", {
        headers: { "x-db-name-override": "common" }
      });
      setNotices(res.data);
    } catch (err: any) {
      // If table doesn't exist, we'll just show an empty list or mock
      setNotices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const sendNotice = async () => {
    if (!newNotice.trim()) return;
    try {
      // Simulate sending a notice command
      await api.post("/api/console/command", { command: `notice ${newNotice}` });
      toast.success("Duyuru gönderildi!");
      setNewNotice("");
      fetchData();
    } catch (err: any) {
      toast.error("Duyuru gönderilemedi: " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Duyuru Yönetimi</h2>
          <p className="text-muted-foreground">Oyun içi duyuruları (notice) yönetin ve anlık duyuru gönderin.</p>
        </div>
        <Button variant="outline" onClick={fetchData} disabled={loading} className="gap-2">
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} /> Yenile
        </Button>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Send className="text-primary" size={20} /> Anlık Duyuru Gönder
          </CardTitle>
          <CardDescription>Yazdığınız metin tüm oyunculara sohbet satırında sarı renkte görünecektir.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input 
              placeholder="Duyuru metnini buraya yazın..." 
              value={newNotice}
              onChange={(e) => setNewNotice(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendNotice()}
            />
            <Button onClick={sendNotice} className="gap-2">
              <Megaphone size={18} /> Gönder
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Clock className="text-blue-500" size={20} /> Kayıtlı Duyurular
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[450px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Duyuru Metni</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notices.map((n, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-mono text-xs">{n.id}</TableCell>
                    <TableCell className="font-medium">{n.value || n.text}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="text-destructive">
                        <Trash2 size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {notices.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-10 text-muted-foreground italic">
                      Kayıtlı duyuru bulunamadı.
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
