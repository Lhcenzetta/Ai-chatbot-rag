"use client";

import { motion } from "framer-motion";
import { Zap, ShieldCheck, Clock, BrainCircuit } from "lucide-react";

export default function AIFeatureSection() {
  const features = [
    {
      title: "Instant Support",
      desc: "Get answers to your insurance questions in milliseconds, not hours.",
      icon: <Zap className="w-5 h-5 text-blue-400" />,
    },
    {
      title: "Claims Guidance",
      desc: "Step-by-step assistance through the claims process to ensure success.",
      icon: <ShieldCheck className="w-5 h-5 text-blue-400" />,
    },
    {
      title: "24/7 Availability",
      desc: "Our AI never sleeps. Always here to help you when you need it most.",
      icon: <Clock className="w-5 h-5 text-blue-400" />,
    },
    {
      title: "Smart Recommendations",
      desc: "Personalized plan suggestions based on your unique profile and needs.",
      icon: <BrainCircuit className="w-5 h-5 text-blue-400" />,
    },
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2 w-full">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-blue-500/30 text-blue-300 text-sm font-medium mb-6">
                <BrainCircuit className="w-4 h-4" />
                Intelligence inside
              </div>
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                Meet your dedicated <br />
                <span className="text-gradient">AI Insurance Expert</span>
              </h2>
              <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                Experience a completely entirely new way to manage your insurance. 
                Our cutting-edge AI assistant is trained to handle everything from 
                comparing complex pricing plans to filing detailed claims, entirely on its own.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {features.map((feature, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20">
                      {feature.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">{feature.title}</h4>
                      <p className="text-sm text-slate-400">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          <div className="lg:w-1/2 w-full">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="glass rounded-2xl p-6 border border-slate-700/50 relative z-10 shadow-2xl">
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-700/50">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xl shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                    🛡️
                  </div>
                  <div>
                    <h3 className="font-semibold">Atlas AI</h3>
                    <div className="flex items-center gap-2 text-xs text-green-400">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      Online
                    </div>
                  </div>
                </div>

                <div className="space-y-4 font-sans">
                  <div className="flex justify-end">
                    <div className="bg-slate-800 text-white rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%] text-sm">
                      I need help choosing a car insurance plan.
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%] text-sm shadow-lg">
                      I can help with that! Are you looking for basic coverage, or a comprehensive plan with roadside assistance?
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="bg-slate-800 text-white rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%] text-sm">
                      Comprehensive with roadside, please.
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%] text-sm shadow-lg">
                      Great. I've found 3 premium plans that match. The best value is the "Premium Auto Shield" at $85/month. Would you like to see the details?
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl" />
              <div className="absolute -bottom-6 -left-6 w-40 h-40 bg-indigo-500/20 rounded-full blur-2xl" />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
