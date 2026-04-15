import React, { useState, useRef, useEffect } from "react";
import { Terminal as TerminalIcon, Play, Trash2, Send, ChevronRight, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import api from "../lib/api";
import { toast } from "sonner";

interface LogEntry {
  type: "input" | "output" | "error";
  content: string;
  cwd?: string;
  timestamp: Date;
}

const QUICK_SCRIPTS = [
  { name: "Sunucuyu Başlat", cmd: "sh start.sh", path: "/usr/game" },
  { name: "Sunucuyu Kapat", cmd: "sh close.sh", path: "/usr/game" },
  { name: "Logları Temizle", cmd: "sh clear.sh", path: "/usr/game" },
  { name: "Quest Okut (main)", cmd: "./qc main.quest", path: "/usr/game/share/locale/turkey/quest" },
  { name: "Game Build", cmd: "gmake -j4", path: "/usr/src/main/game/src" },
  { name: "DB Build", cmd: "gmake -j4", path: "/usr/src/main/db/src" },
];

export default function Console() {
  const [command, setCommand] = useState("");
  const [cwd, setCwd] = useState("/usr/game");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  const executeCommand = async (cmdToExec?: string, customCwd?: string) => {
    const finalCmd = cmdToExec || command;
    if (!finalCmd.trim()) return;

    const currentCwd = customCwd || cwd;
    const newLogs: LogEntry[] = [
      ...logs,
      { type: "input", content: finalCmd, cwd: currentCwd, timestamp: new Date() }
    ];
    setLogs(newLogs);
    setLoading(true);
    if (!cmdToExec) {
      setHistory([finalCmd, ...history.filter(h => h !== finalCmd)].slice(0, 50));
      setHistoryIndex(-1);
    }

    try {
      const res = await api.post("/api/exec", { command: finalCmd, cwd: currentCwd });
      const entries: LogEntry[] = [];
      if (res.data.output) {
        entries.push({ type: "output", content: res.data.output, timestamp: new Date() });
      }
      if (res.data.errorOutput) {
        entries.push({ type: "error", content: res.data.errorOutput, timestamp: new Date() });
      }
      if (res.data.newCwd) {
        setCwd(res.data.newCwd);
      }
      setLogs([...newLogs, ...entries]);
      setCommand("");
    } catch (err: any) {
      toast.error("Komut çalıştırılamadı: " + err.message);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (historyIndex < history.length - 1) {
        const nextIndex = historyIndex + 1;
        setHistoryIndex(nextIndex);
        setCommand(history[nextIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIndex = historyIndex - 1;
        setHistoryIndex(nextIndex);
        setCommand(history[nextIndex]);
      } else {
        setHistoryIndex(-1);
        setCommand("");
      }
    }
  };

  const clearLogs = () => setLogs([]);

  return (
    <div className="space-y-6 h-[calc(100vh-120px)] flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">SSH Console</h2>
          <p className="text-muted-foreground">Sunucunuza doğrudan komut gönderin ve yönetin.</p>
        </div>
        <Button variant="outline" size="sm" onClick={clearLogs} className="gap-2">
          <Trash2 size={16} /> Temizle
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 overflow-hidden">
        {/* Quick Scripts Sidebar */}
        <Card className="lg:col-span-1 flex flex-col overflow-hidden border-muted/50">
          <CardHeader className="py-4 border-b">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Zap size={16} className="text-amber-500" /> Hızlı Scriptler
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2 overflow-y-auto">
            {QUICK_SCRIPTS.map((script, i) => (
              <Button
                key={i}
                variant="secondary"
                className="w-full justify-start text-xs h-9 gap-2 font-mono"
                onClick={() => executeCommand(script.cmd, script.path)}
                disabled={loading}
              >
                <ChevronRight size={14} />
                {script.name}
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Terminal Area */}
        <Card className="lg:col-span-3 flex flex-col overflow-hidden bg-[#0c0c0c] border-muted shadow-2xl">
          <CardHeader className="border-b border-white/5 py-3 bg-[#1a1a1a] flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5 mr-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              <CardTitle className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                root@freebsd:{cwd}
              </CardTitle>
            </div>
            <div className="text-[10px] font-mono text-emerald-500/50 animate-pulse">CONNECTED</div>
          </CardHeader>
          
          <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
            <ScrollArea className="flex-1 p-6 font-mono text-sm">
              <div className="space-y-3">
                <div className="text-emerald-500/80 mb-4">
                  Welcome to Metin2 Game Panel Terminal v1.0.0<br />
                  Type your commands below. Use Quick Scripts for common tasks.
                </div>
                {logs.map((log, i) => (
                  <div key={i} className="group">
                    {log.type === "input" ? (
                      <div className="flex items-start gap-2 text-blue-400">
                        <span className="text-emerald-500 shrink-0">root@freebsd:{log.cwd}$</span>
                        <span className="font-bold">{log.content}</span>
                      </div>
                    ) : (
                      <div className={`whitespace-pre-wrap pl-4 border-l-2 border-white/5 ml-2 py-1 ${
                        log.type === "error" ? "text-red-400 bg-red-400/5" : "text-gray-300"
                      }`}>
                        {log.content}
                      </div>
                    )}
                  </div>
                ))}
                {loading && (
                  <div className="flex items-center gap-2 text-muted-foreground animate-pulse pl-2">
                    <span className="w-2 h-4 bg-white/50" />
                    <span>İşleniyor...</span>
                  </div>
                )}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>

            <form 
              onSubmit={(e) => { e.preventDefault(); executeCommand(); }} 
              className="p-4 bg-[#1a1a1a] border-t border-white/5 flex items-center gap-3"
            >
              <div className="text-emerald-500 font-mono text-sm shrink-0">
                root@freebsd:{cwd}$
              </div>
              <input
                ref={inputRef}
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Komut yazın..."
                className="flex-1 bg-transparent border-none outline-none font-mono text-gray-200 text-sm"
                disabled={loading}
                autoFocus
              />
              <Button 
                type="submit" 
                size="icon" 
                variant="ghost"
                className="hover:bg-white/5 text-muted-foreground"
                disabled={loading || !command.trim()}
              >
                <Send size={16} />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
