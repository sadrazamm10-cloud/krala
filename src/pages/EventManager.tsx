import { useState } from "react";
import { Calendar, Play, Square, RefreshCw, Zap, Star, Trophy, Sword, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { toast } from "sonner";

interface Event {
  id: string;
  name: string;
  description: string;
  icon: any;
  status: "active" | "inactive";
  color: string;
}

export default function EventManager() {
  const [events, setEvents] = useState<Event[]>([
    { id: "ox", name: "OX Yarışması", description: "Bilgi yarışmasını başlatır veya durdurur.", icon: Star, status: "inactive", color: "text-amber-500" },
    { id: "hide_seek", name: "Saklambaç", description: "Belirli bir haritada saklambaç etkinliği başlatır.", icon: Search, status: "inactive", color: "text-blue-500" },
    { id: "tanaka", name: "Korsan Tanaka", description: "Köylere Korsan Tanaka canavarları gönderir.", icon: Sword, status: "inactive", color: "text-red-500" },
    { id: "moonlight", name: "Ay Işığı Sandığı", description: "Canavarlardan Ay Işığı Sandığı düşme oranını açar.", icon: Zap, status: "active", color: "text-purple-500" },
    { id: "double_exp", name: "Double EXP", description: "Tüm sunucuda tecrübe oranını %100 artırır.", icon: Trophy, status: "inactive", color: "text-emerald-500" },
  ]);

  const toggleEvent = (id: string) => {
    setEvents(prev => prev.map(e => {
      if (e.id === id) {
        const newStatus = e.status === "active" ? "inactive" : "active";
        toast.success(`${e.name} etkinliği ${newStatus === "active" ? "başlatıldı" : "durduruldu"}.`);
        return { ...e, status: newStatus };
      }
      return e;
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Etkinlik Yönetimi</h2>
          <p className="text-muted-foreground">Oyun içi etkinlikleri anlık olarak başlatın veya durdurun.</p>
        </div>
        <Button variant="outline" className="gap-2">
          <RefreshCw size={18} /> Durumu Yenile
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <Card key={event.id} className="overflow-hidden border-none shadow-md bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg bg-muted ${event.color}`}>
                  <event.icon size={24} />
                </div>
                <div className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                  event.status === "active" ? "bg-emerald-500/10 text-emerald-500" : "bg-muted text-muted-foreground"
                }`}>
                  {event.status === "active" ? "AKTİF" : "PASİF"}
                </div>
              </div>
              <CardTitle className="mt-4">{event.name}</CardTitle>
              <CardDescription>{event.description}</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <Button 
                onClick={() => toggleEvent(event.id)}
                variant={event.status === "active" ? "destructive" : "default"}
                className="w-full gap-2"
              >
                {event.status === "active" ? (
                  <><Square size={16} /> Etkinliği Durdur</>
                ) : (
                  <><Play size={16} /> Etkinliği Başlat</>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="text-blue-500" size={20} /> Etkinlik Takvimi
          </CardTitle>
          <CardDescription>Otomatik olarak başlayacak etkinliklerin planlaması.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { day: "Pazartesi", event: "Ay Işığı Sandığı", time: "20:00 - 22:00" },
              { day: "Çarşamba", event: "Futbol Topu", time: "18:00 - 20:00" },
              { day: "Cumartesi", event: "OX Yarışması", time: "21:00" },
              { day: "Pazar", event: "Kale Savaşı", time: "22:00" },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50">
                <div className="flex items-center gap-4">
                  <div className="w-24 font-bold text-sm">{item.day}</div>
                  <div className="font-medium">{item.event}</div>
                </div>
                <div className="text-sm text-muted-foreground font-mono">{item.time}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
