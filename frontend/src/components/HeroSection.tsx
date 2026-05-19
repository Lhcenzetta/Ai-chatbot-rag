"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative flex-grow flex items-center justify-center pt-20">
      {/* Soft Background gradient */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-300 via-indigo-400 to-transparent blur-[140px] rounded-full" />
      </div>

      <div className="container mx-auto px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl mx-auto"
        >
          <div className="mb-8 flex justify-center">
            <div className="w-16 h-16 rounded-[20px] bg-white/5 border border-white/10 flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.1)] backdrop-blur-xl">
              <Sparkles className="w-8 h-8 text-blue-300" strokeWidth={1.5} />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-semibold tracking-tight mb-8 leading-[1.1]">
            Smart Insurance Assistance <br className="hidden md:block" />
            <span className="text-blue-300 font-medium">Powered by AI</span>
          </h1>

          <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
            An intelligent companion helping you with insurance services, pricing, claims, and support—designed to be human, helpful, and kind.
          </p>

          <div className="flex justify-center">
            <button 
              onClick={() => {
                window.dispatchEvent(new CustomEvent('open-chatbot'));
              }}
              className="px-8 py-4 bg-white/10 hover:bg-white/15 text-white rounded-full font-medium transition-all duration-300 ease-out backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.1)] flex items-center gap-3 group"
            >
              <Sparkles className="w-5 h-5 text-blue-300 group-hover:scale-110 transition-transform duration-300" />
              Meet Your AI Assistant
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
