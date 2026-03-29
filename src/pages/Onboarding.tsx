import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, ArrowRight, Clock, Users, Bell, Shield } from "lucide-react";
import mockupQueue from "@/assets/mockup-queue.png";

// ─────────────────────────────────────────────────
// SLIDE DATA
// ─────────────────────────────────────────────────
const SLIDES = [
  {
    id: "problem",
    bg: "bg-[#0A1628]",
    content: "problem" as const,
  },
  {
    id: "vision",
    bg: "bg-white",
    content: "vision" as const,
  },
  {
    id: "product",
    bg: "bg-[#F2F4F7]",
    content: "product" as const,
  },
];

// ─────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────
export default function Onboarding() {
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();
  const slide = SLIDES[current];
  const isLast = current === SLIDES.length - 1;

  const next = useCallback(() => {
    if (isLast) {
      navigate("/dashboard");
    } else {
      setCurrent((c) => c + 1);
    }
  }, [isLast, navigate]);

  const prev = useCallback(() => {
    if (current > 0) setCurrent((c) => c - 1);
  }, [current]);

  const skip = useCallback(() => navigate("/dashboard"), [navigate]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); next(); }
      if (e.key === "ArrowLeft") prev();
      if (e.key === "Escape") skip();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [next, prev, skip]);

  return (
    <div className={`fixed inset-0 ${slide.bg} transition-colors duration-700 overflow-hidden`}>
      {/* Skip button */}
      <button
        onClick={skip}
        className="fixed top-6 right-6 z-50 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all
          bg-white/10 hover:bg-white/20 text-white/70 hover:text-white backdrop-blur-sm border border-white/10"
        style={{ color: slide.content === "problem" ? undefined : "#013366", backgroundColor: slide.content === "problem" ? undefined : "rgba(1,51,102,0.08)", borderColor: slide.content === "problem" ? undefined : "rgba(1,51,102,0.15)" }}
      >
        Skip to Dashboard <ArrowRight className="w-3 h-3" />
      </button>

      {/* Slide content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="h-full"
        >
          {slide.content === "problem" && <SlideProblem />}
          {slide.content === "vision" && <SlideVision />}
          {slide.content === "product" && <SlideProduct onEnter={skip} />}
        </motion.div>
      </AnimatePresence>

      {/* Navigation bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <div className="flex items-center justify-between px-8 py-5">
          {/* Dots */}
          <div className="flex items-center gap-2">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === current
                    ? "w-8 h-2.5 bg-[#013366]"
                    : slide.content === "problem"
                    ? "w-2.5 h-2.5 bg-white/30 hover:bg-white/50"
                    : "w-2.5 h-2.5 bg-[#013366]/20 hover:bg-[#013366]/40"
                }`}
              />
            ))}
          </div>

          {/* Prev / Next */}
          <div className="flex items-center gap-3">
            {current > 0 && (
              <button
                onClick={prev}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  slide.content === "problem"
                    ? "text-white/60 hover:text-white hover:bg-white/10"
                    : "text-[#013366]/60 hover:text-[#013366] hover:bg-[#013366]/5"
                }`}
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            )}
            <button
              onClick={next}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all
                bg-[#013366] text-white hover:bg-[#1E5189] shadow-lg shadow-[#013366]/25 hover:shadow-xl hover:shadow-[#013366]/30"
            >
              {isLast ? "Enter Dashboard" : "Continue"}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────
// SLIDE 1: THE PROBLEM
// ─────────────────────────────────────────────────
function SlideProblem() {
  const stats = [
    { value: "6–8h+", label: "ED wait times\nin Victoria", color: "#CE3E39" },
    { value: "700K", label: "British Columbians\nwithout a family doctor", color: "#F59E0B" },
    { value: "31%", label: "Of BC ER visits triaged\nas lower urgency", color: "#3B82F6" },
  ];

  const quotes = [
    "You sit in a crowded room with people who are very sick, people who are bored, people who are anxious.",
    "You scroll. You pace. You wonder if you should have just waited another week.",
    "Surrounded by sounds you did not ask for, sights you cannot unsee, and a steady hum of stress.",
  ];

  return (
    <div className="h-full flex items-center justify-center px-8 md:px-16 lg:px-24">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        {/* Left column */}
        <div>
          {/* Accent bar */}
          <div className="w-12 h-1 bg-[#CE3E39] rounded-full mb-6" />

          <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-bold text-white leading-[1.1] tracking-tight font-serif mb-4">
            The Reality<br />
            of Emergency Care<br />
            <span className="text-white/60">in Victoria, BC</span>
          </h1>

          <p className="text-base text-[#94A3B8] italic mb-10 max-w-md">
            No family doctor. Walk-ins full. You go to the ER.
          </p>

          {/* Stats */}
          <div className="flex gap-4">
            {stats.map((s) => (
              <motion.div
                key={s.value}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-5 text-center"
              >
                <p className="text-2xl md:text-3xl font-bold mb-1" style={{ color: s.color }}>
                  {s.value}
                </p>
                <p className="text-[11px] text-[#94A3B8] leading-snug whitespace-pre-line">
                  {s.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right column — quotes */}
        <div className="space-y-5">
          {quotes.map((q, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.15, duration: 0.5 }}
              className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-6"
            >
              <p className="text-sm md:text-[15px] text-[#CBD5E1] italic leading-relaxed font-serif">
                "{q}"
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────
// SLIDE 2: THE VISION
// ─────────────────────────────────────────────────
function SlideVision() {
  const points = [
    { icon: Clock, text: "See your place in the queue — in real time, on your phone" },
    { icon: Users, text: "Go home while you wait — and keep your spot in line" },
    { icon: Bell, text: "Get notified when it's time to leave — arrive exactly when needed" },
    { icon: Shield, text: "See a realistic wait estimate — no more guessing" },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Navy header */}
      <div className="bg-[#013366] px-8 md:px-16 lg:px-24 py-8 flex-shrink-0">
        <h2 className="text-3xl md:text-4xl font-bold text-white font-serif">
          Now imagine a different world.
        </h2>
      </div>

      <div className="flex-1 flex items-center px-8 md:px-16 lg:px-24 py-8">
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left — vision points */}
          <div>
            <h3 className="text-xl font-bold text-[#013366] mb-6">What if you could...</h3>

            <div className="space-y-3">
              {points.map((p, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.1, duration: 0.4 }}
                  className="flex items-center gap-4 bg-[#F2F4F7] rounded-xl p-4"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#013366]/10 flex items-center justify-center flex-shrink-0">
                    <p.icon className="w-5 h-5 text-[#013366]" />
                  </div>
                  <p className="text-sm md:text-[15px] text-[#334155] leading-snug">{p.text}</p>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-8 border-l-4 border-[#013366] pl-5 py-2"
            >
              <p className="text-sm text-[#475569] italic font-serif leading-relaxed">
                "This is not about skipping the line. It is about respecting people's time, energy, and dignity."
              </p>
            </motion.div>
          </div>

          {/* Right — patient view mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="relative"
          >
            <div className="bg-white rounded-2xl shadow-2xl shadow-[#013366]/10 border border-[#E2E8F0] overflow-hidden">
              {/* Browser chrome */}
              <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] px-4 py-2.5 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-white rounded-md border border-[#E2E8F0] px-3 py-1 text-[10px] text-[#94A3B8]">
                    bccare.lovable.app/waiting
                  </div>
                </div>
              </div>

              {/* Simulated patient view */}
              <div className="bg-white p-6">
                <p className="text-xs text-[#94A3B8] mb-1">Saturday, March 28 · 3:42 PM</p>
                <h3 className="text-xl font-bold text-[#2D2D2D] mb-1">Hi, Kathryn 👋</h3>
                <p className="text-xs text-[#94A3B8] mb-5">Here's your current place in the queue.</p>

                {/* Queue position card */}
                <div className="bg-[#013366] rounded-xl p-5 text-white mb-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold bg-white/20 px-2 py-0.5 rounded-full">● Waiting</span>
                    <span className="text-[10px] text-white/50">ENC-1247</span>
                  </div>
                  <div className="flex items-center gap-6">
                    {/* Circle progress */}
                    <div className="relative w-20 h-20 flex-shrink-0">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                        <circle cx="40" cy="40" r="35" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="5" />
                        <circle cx="40" cy="40" r="35" fill="none" stroke="#3B82F6" strokeWidth="5"
                          strokeDasharray={`${2 * Math.PI * 35 * 0.62} ${2 * Math.PI * 35}`}
                          strokeLinecap="round" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-xl font-bold">38</span>
                        <span className="text-[8px] text-white/50">min left</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] text-white/40 uppercase tracking-wider mb-0.5">Your Position</p>
                      <p className="text-4xl font-bold">#7</p>
                      <p className="text-xs text-white/60 mt-0.5">6 people ahead of you</p>
                    </div>
                  </div>
                </div>

                {/* Journey steps */}
                <div className="space-y-2.5">
                  <p className="text-[10px] text-[#94A3B8] uppercase tracking-widest font-bold">Your Journey Today</p>
                  {[
                    { label: "Doctor Consultation", status: "Current", color: "#013366" },
                    { label: "X-Ray / Imaging", status: "Upcoming", color: "#94A3B8" },
                    { label: "Pharmacy", status: "Upcoming", color: "#94A3B8" },
                  ].map((step) => (
                    <div key={step.label} className="flex items-center justify-between py-2 px-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                      <span className="text-xs font-semibold text-[#2D2D2D]">{step.label}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        step.status === "Current" ? "bg-[#013366] text-white" : "bg-[#F2F4F7] text-[#94A3B8]"
                      }`}>{step.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating label */}
            <p className="text-center text-[11px] text-[#94A3B8] mt-3 italic">
              Patient View — Real-time queue position & wait estimate
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────
// SLIDE 3: THE PRODUCT
// ─────────────────────────────────────────────────
function SlideProduct({ onEnter }: { onEnter: () => void }) {
  const features = [
    { icon: Clock, title: "Real-time Queue", desc: "Live position tracking for every patient" },
    { icon: Users, title: "Go Home & Wait", desc: "Leave the ER, keep your spot in line" },
    { icon: Bell, title: "Smart Notifications", desc: "Get called back at exactly the right time" },
    { icon: Shield, title: "CTAS Prioritized", desc: "Clinical priority always comes first" },
  ];

  return (
    <div className="h-full flex flex-col items-center justify-center px-8 md:px-16 lg:px-24 pb-24 pt-8 overflow-y-auto">
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-4 flex-shrink-0"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-[#013366] font-serif mb-2">
          We built it.
        </h2>
        <p className="text-sm text-[#64748B] italic max-w-2xl mx-auto">
          A user-accessible web application that makes the invisible visible, and the waiting humane.
        </p>
      </motion.div>

      {/* Mockup */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="w-full max-w-4xl mb-4 flex-shrink min-h-0"
      >
        <div className="bg-white rounded-2xl shadow-2xl shadow-[#013366]/10 border border-[#E2E8F0] overflow-hidden">
          {/* Browser chrome */}
          <div className="bg-[#013366] px-4 py-2.5 flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
            </div>
            <div className="flex-1 mx-4">
              <div className="bg-white/10 rounded-md px-3 py-1 text-[10px] text-white/60">
                bccare.lovable.app/dashboard
              </div>
            </div>
            <span className="text-[10px] text-white/40 font-semibold">Clinician Dashboard</span>
          </div>

          {/* Screenshot */}
          <img
            src={mockupQueue}
            alt="BC Care Clinician Dashboard showing real-time encounter queue"
            className="w-full block"
          />
        </div>
      </motion.div>

      {/* Feature pills */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-4 flex-shrink-0">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.08 }}
            className="flex items-center gap-2.5 bg-white rounded-xl border border-[#E2E8F0] px-4 py-3 shadow-sm"
          >
            <div className="w-8 h-8 rounded-lg bg-[#013366]/10 flex items-center justify-center flex-shrink-0">
              <f.icon className="w-4 h-4 text-[#013366]" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#013366]">{f.title}</p>
              <p className="text-[10px] text-[#94A3B8]">{f.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        onClick={onEnter}
        className="flex items-center gap-2 px-8 py-3.5 rounded-xl text-base font-bold
          bg-[#013366] text-white hover:bg-[#1E5189] shadow-lg shadow-[#013366]/25 hover:shadow-xl hover:shadow-[#013366]/30 transition-all"
      >
        Enter the Dashboard <ArrowRight className="w-5 h-5" />
      </motion.button>
    </div>
  );
}
