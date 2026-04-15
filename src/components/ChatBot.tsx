import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, User, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import api from "../lib/api";
import { motion, AnimatePresence } from "motion/react";
import { useAppContext } from "../context/AppContext";
import { toast } from "sonner";

export default function ChatBot() {
  const { updateTableMapping } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([
    { role: "model", content: "Merhaba! Ben Metin2 Yönetim Paneli asistanıyım. (Geliştirici: Uğur Kaya - ITJA). Size nasıl yardımcı olabilirim?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await api.post("/api/chat", {
        message: userMsg.content,
        history: messages
      });
      
      if (res.data.mappingUpdate) {
        updateTableMapping(res.data.mappingUpdate.original, res.data.mappingUpdate.new);
        toast.success(`Tablo eşleştirmesi güncellendi: ${res.data.mappingUpdate.original} -> ${res.data.mappingUpdate.new}`);
      }

      setMessages(prev => [...prev, { role: "model", content: res.data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: "model", content: "Üzgünüm, şu anda yanıt veremiyorum. Lütfen daha sonra tekrar deneyin." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-2xl shadow-primary/50 transition-transform hover:scale-110 z-50 ${isOpen ? "hidden" : "flex"}`}
      >
        <MessageSquare size={28} />
      </Button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 w-[450px] h-[650px] bg-card border shadow-2xl rounded-2xl flex flex-col z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="p-5 bg-gradient-to-r from-primary to-blue-600 text-primary-foreground flex items-center justify-between shadow-md z-10">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                  <Bot size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base tracking-wide">ITJA Asistan</h3>
                  <p className="text-xs text-blue-100 flex items-center gap-1 mt-0.5">
                    <Sparkles size={12} className="text-yellow-300" /> Yapay Zeka Destekli
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20 rounded-full" onClick={() => setIsOpen(false)}>
                <X size={20} />
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 p-5 overflow-y-auto bg-muted/30 scroll-smooth">
              <div className="space-y-6">
                {messages.map((msg, i) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={i} 
                    className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                  >
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 shadow-sm ${msg.role === "user" ? "bg-blue-600" : "bg-gradient-to-br from-emerald-400 to-emerald-600"}`}>
                      {msg.role === "user" ? <User size={18} className="text-white" /> : <Bot size={18} className="text-white" />}
                    </div>
                    <div className={`p-4 rounded-2xl max-w-[75%] text-sm shadow-sm leading-relaxed ${msg.role === "user" ? "bg-blue-600 text-white rounded-tr-sm" : "bg-background border rounded-tl-sm text-foreground"}`}>
                      {msg.content}
                    </div>
                  </motion.div>
                ))}
                {loading && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shrink-0 shadow-sm">
                      <Bot size={18} className="text-white" />
                    </div>
                    <div className="p-4 rounded-2xl bg-background border rounded-tl-sm text-sm flex items-center gap-1.5 shadow-sm">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></span>
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "0.15s" }}></span>
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }}></span>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} className="h-1" />
              </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t bg-background shadow-[0_-4px_15px_-5px_rgba(0,0,0,0.05)] z-10">
              <div className="flex items-center gap-2 relative">
                <Input
                  placeholder="Asistana bir soru sorun..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  className="flex-1 pr-12 py-6 rounded-xl border-muted-foreground/20 focus-visible:ring-primary/50"
                />
                <Button 
                  size="icon" 
                  onClick={handleSend} 
                  disabled={loading || !input.trim()}
                  className="absolute right-1.5 h-10 w-10 rounded-lg bg-primary hover:bg-primary/90 transition-colors"
                >
                  <Send size={18} className="ml-0.5" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
