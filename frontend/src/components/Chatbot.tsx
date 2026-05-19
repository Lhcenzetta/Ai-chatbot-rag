"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, User, Sparkles, MessageCircle } from "lucide-react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const initialMessages: Message[] = [
  {
    id: "1",
    role: "assistant",
    content: "Hi 👋 I’m your AI insurance assistant. I’m here to help you explore plans, pricing, or claims anytime.",
  },
  {
    id: "2",
    role: "user",
    content: "What insurance services do you offer?",
  },
  {
    id: "3",
    role: "assistant",
    content: "I'd be glad to share that with you! We offer personalized Health, Car, Home, Travel, and Business insurance. Each plan is designed to be simple, comprehensive, and tailored precisely to your needs. Would you like me to help you compare plans or answer any specific questions?",
  }
];

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  useEffect(() => {
    const handleOpenChatbot = () => setIsOpen(true);
    window.addEventListener('open-chatbot', handleOpenChatbot);
    return () => window.removeEventListener('open-chatbot', handleOpenChatbot);
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: userMessage.content }),
      });

      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.reply || "I'm sorry, I couldn't process that request.",
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: "assistant", content: "I'm having a little trouble connecting right now. Let me take a deep breath—could you try sending that again in a moment?" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating particles around button on hover */}
      {!isOpen && isHovered && Array.from({ length: 6 }).map((_, i) => (
        <motion.div
          key={i}
          className="fixed bottom-12 right-12 w-2 h-2 rounded-full bg-blue-300/40 pointer-events-none z-40"
          initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
          animate={{
            x: (i % 2 === 0 ? 1 : -1) * (Math.random() * 40 + 20),
            y: -(Math.random() * 60 + 30),
            scale: [0, 1.2, 0],
            opacity: [1, 0.8, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeOut",
          }}
        />
      ))}

      {/* Chatbot Toggle Button with breathing effect */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{
          scale: 1,
          opacity: 1,
          y: isOpen ? 0 : [0, -6, 0],
          boxShadow: isOpen 
            ? "0 8px 30px rgba(0, 0, 0, 0.2)"
            : [
                "0 8px 32px rgba(59, 130, 246, 0.2)",
                "0 8px 48px rgba(59, 130, 246, 0.45)",
                "0 8px 32px rgba(59, 130, 246, 0.2)",
              ],
        }}
        whileHover={{ scale: 1.08 }}
        transition={{ 
          scale: { type: "spring", stiffness: 260, damping: 20 },
          y: isOpen ? { duration: 0.2 } : { repeat: Infinity, duration: 4, ease: "easeInOut" },
          boxShadow: { duration: 3, repeat: Infinity, ease: "easeInOut" }
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/90 to-indigo-600/90 text-white flex items-center justify-center z-50 border border-white/10 backdrop-blur-md cursor-pointer"
        aria-label="Toggle assistant"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <X className="w-7 h-7" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="relative"
            >
              <Sparkles className="w-7 h-7 text-blue-100" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Window with soft emerger slide/fade */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 35, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 25, scale: 0.96 }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="fixed bottom-28 right-6 w-[90vw] max-w-[420px] h-[600px] max-h-[80vh] z-50 flex flex-col glass rounded-[32px] overflow-hidden border border-white/10 shadow-[0_24px_64px_rgba(0,0,0,0.4)]"
          >
            {/* Header */}
            <div className="p-5 bg-slate-900/60 border-b border-white/5 flex items-center justify-between backdrop-blur-xl relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-lg shadow-[0_4px_16px_rgba(59,130,246,0.3)] border border-white/10">
                  🛡️
                </div>
                <div>
                  <h3 className="font-medium text-white/95 leading-tight">Atlas Care</h3>
                  <div className="flex items-center gap-1.5 text-xs text-blue-300">
                    <span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_#4ade80] animate-pulse" />
                    Online & listening
                  </div>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 scroll-smooth bg-slate-950/20 relative">
              {/* Soft internal gradient glow */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
              
              {messages.map((msg, index) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 15, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.05, ease: "easeOut" }}
                  className={`flex gap-3 max-w-[85%] ${
                    msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border border-white/5 text-xs font-semibold ${
                      msg.role === "user"
                        ? "bg-slate-800 text-slate-300"
                        : "bg-gradient-to-br from-blue-500/20 to-indigo-600/20 text-blue-300"
                    }`}
                  >
                    {msg.role === "user" ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4 text-blue-300" />}
                  </div>
                  <div
                    className={`p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                      msg.role === "user"
                        ? "bg-slate-800/80 text-white rounded-tr-sm"
                        : "bg-slate-900/60 text-slate-200 border border-white/5 rounded-tl-sm"
                    }`}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}
              
              {/* Sound-wave thinking loader */}
              {isLoading && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3 max-w-[85%] mr-auto"
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-600/20 flex items-center justify-center shrink-0 border border-white/5">
                    <Sparkles className="w-4 h-4 text-blue-300" />
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 rounded-tl-sm flex items-center gap-1.5 h-11">
                    {[1, 2, 3, 4].map((bar) => (
                      <motion.div
                        key={bar}
                        className="w-0.5 rounded-full bg-blue-300"
                        animate={{
                          height: ["8px", "18px", "8px"],
                        }}
                        transition={{
                          duration: 0.8,
                          repeat: Infinity,
                          delay: bar * 0.15,
                          ease: "easeInOut",
                        }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-slate-900/40 border-t border-white/5 backdrop-blur-xl relative z-10">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything..."
                  className="w-full bg-slate-950/40 border border-white/5 text-white rounded-2xl pl-4 pr-12 py-3 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all text-sm placeholder:text-slate-500"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 p-2 text-blue-400 hover:text-blue-300 disabled:opacity-30 disabled:hover:text-blue-400 transition-colors cursor-pointer"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
