"use client";

import { motion } from "framer-motion";
import { HeartPulse, Car, Home, Plane, Briefcase } from "lucide-react";

const services = [
  {
    title: "Health Insurance",
    description: "Comprehensive medical coverage designed for your peace of mind.",
    icon: <HeartPulse className="w-6 h-6 text-blue-400" />,
  },
  {
    title: "Car Insurance",
    description: "Smart protection for your vehicle with instant AI claims processing.",
    icon: <Car className="w-6 h-6 text-blue-400" />,
  },
  {
    title: "Home Insurance",
    description: "Safeguard your most valuable asset with modern, flexible policies.",
    icon: <Home className="w-6 h-6 text-blue-400" />,
  },
  {
    title: "Travel Insurance",
    description: "Global coverage ensuring safe and worry-free adventures anywhere.",
    icon: <Plane className="w-6 h-6 text-blue-400" />,
  },
  {
    title: "Business Insurance",
    description: "Tailored enterprise solutions to protect your company's future.",
    icon: <Briefcase className="w-6 h-6 text-blue-400" />,
  },
];

export default function ServicesSection() {
  return (
    <section className="py-24 relative z-10">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Coverage for <span className="text-gradient">Every Need</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Our AI-driven platform tailors the perfect insurance plans to protect what matters most to you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="glass p-8 rounded-2xl hover:bg-slate-800/40 transition-colors group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-colors" />
              
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6 border border-blue-500/20">
                {service.icon}
              </div>
              
              <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
              <p className="text-slate-400 leading-relaxed">
                {service.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
