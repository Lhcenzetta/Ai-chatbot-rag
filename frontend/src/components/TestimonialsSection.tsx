"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Jenkins",
    role: "Small Business Owner",
    content: "The AI assistant completely revolutionized how we handle our employee benefits. It answered all our questions instantly and found us a plan that saved us 20% annually.",
    initials: "SJ",
    color: "from-purple-500 to-indigo-500",
  },
  {
    name: "Michael Chen",
    role: "Software Engineer",
    content: "Filing a car insurance claim used to take days. With Atlas AI, I uploaded photos of the bumper dent, and the claim was processed and approved in literally 3 minutes.",
    initials: "MC",
    color: "from-blue-500 to-cyan-500",
  },
  {
    name: "Elena Rodriguez",
    role: "Freelancer",
    content: "I didn't know much about health insurance terminology. The chatbot patiently explained everything like a real human would, guiding me to the perfect individual plan.",
    initials: "ER",
    color: "from-emerald-500 to-teal-500",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Loved by <span className="text-gradient">Thousands</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Don't just take our word for it. See how our AI-first approach is changing lives.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="glass p-8 rounded-3xl flex flex-col relative"
            >
              <div className="flex gap-1 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-4 h-4 fill-blue-500 text-blue-500" />
                ))}
              </div>
              
              <p className="text-slate-300 mb-8 flex-grow leading-relaxed">
                "{testimonial.content}"
              </p>

              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${testimonial.color} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                  {testimonial.initials}
                </div>
                <div>
                  <h4 className="font-semibold text-white">{testimonial.name}</h4>
                  <p className="text-sm text-slate-400">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
