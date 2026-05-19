"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Basic",
    price: "29",
    description: "Essential coverage for individuals.",
    features: ["AI Chat Support", "Basic Health Coverage", "Standard Deductible", "Digital ID Cards"],
    highlighted: false,
  },
  {
    name: "Premium",
    price: "89",
    description: "Comprehensive protection with perks.",
    features: ["24/7 Priority AI Support", "Full Health & Auto", "Low Deductible", "Global Travel Cover", "Telehealth Access"],
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "199",
    description: "Ultimate security for businesses.",
    features: ["Dedicated AI Agent", "Custom Business Liability", "Zero Deductible", "Employee Benefits Setup", "Advanced Analytics"],
    highlighted: false,
  },
];

export default function PricingSection() {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Transparent <span className="text-gradient">Pricing</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Choose the plan that fits your life. No hidden fees, just simple coverage.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className={`relative glass rounded-3xl p-8 flex flex-col ${
                plan.highlighted ? "border-blue-500/50 shadow-[0_0_40px_rgba(59,130,246,0.15)] md:-translate-y-4" : ""
              }`}
            >
              {plan.highlighted && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full text-xs font-semibold tracking-wider text-white">
                  MOST POPULAR
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-2xl font-semibold mb-2">{plan.name}</h3>
                <p className="text-slate-400 text-sm mb-6">{plan.description}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-slate-400">/mo</span>
                </div>
              </div>

              <div className="flex-grow space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-blue-400" />
                    </div>
                    <span className="text-sm text-slate-300">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                className={`w-full py-4 rounded-xl font-medium transition-all ${
                  plan.highlighted
                    ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg"
                    : "glass hover:bg-slate-800 text-white"
                }`}
              >
                Choose {plan.name}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
