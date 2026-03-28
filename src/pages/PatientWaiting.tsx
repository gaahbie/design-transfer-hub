import { useState, useEffect, useCallback } from "react";
import {
  Clock,
  Users,
  MapPin,
  ChevronDown,
  ChevronUp,
  Home,
  Bell,
  CheckCircle2,
  AlertCircle,
  Stethoscope,
  FlaskConical,
  Scan,
  Pill,
  ArrowRight,
  RefreshCw,
  Phone,
  Activity,
  TrendingUp,
  Building2,
  ArrowLeft,
} from "lucide-react";
import { format, addMinutes } from "date-fns";
import { Link } from "react-router-dom";

// ─────────────────────────────────────────────────────────────
// TYPES & MOCK DATA
// ─────────────────────────────────────────────────────────────
type ServiceType = "doctor" | "blood-work" | "imaging" | "pharmacy";
type ServiceStatus = "pending" | "current" | "completed" | "not-requested";

interface ServiceStep {
  service: ServiceType;
  status: ServiceStatus;
  queuePosition?: number;
  estimatedWaitMinutes: number;
  location: string;
}

interface PatientStatus {
  name: string;
  ticketCode: string;
  services: ServiceStep[];
  currentServiceIndex: number; // which service they're currently waiting for
}

// Simulate a patient's current status — in a real app this would
// be fetched by encounter ID / QR code token
const DEMO_PATIENT: PatientStatus = {
  name: "Kathryn",
  ticketCode: "ENC-1247",
  currentServiceIndex: 0, // Currently waiting for first service (doctor)
  services: [
    {
      service: "doctor",
      status: "current",
      queuePosition: 7,
      estimatedWaitMinutes: 38,
      location: "Emergency · Bed 12",
    },
    {
      service: "imaging",
      status: "pending",
      queuePosition: 4,
      estimatedWaitMinutes: 52,
      location: "Radiology · Floor 2 · Room 12",
    },
    {
      service: "blood-work",
      status: "not-requested",
      estimatedWaitMinutes: 0,
      location: "Lab · Floor 1",
    },
    {
      service: "pharmacy",
      status: "pending",
      queuePosition: 2,
      estimatedWaitMinutes: 18,
      location: "Pharmacy · Floor 1",
    },
  ],
};

const SERVICE_META: Record<
  ServiceType,
  { label: string; Icon: any; color: string; bg: string; lightText: string }
> = {
  doctor: {
    label: "Doctor Consultation",
    Icon: Stethoscope,
    color: "#013366",
    bg: "#EFF6FF",
    lightText: "#1E5189",
  },
  "blood-work": {
    label: "Blood Work",
    Icon: FlaskConical,
    color: "#CE3E39",
    bg: "#FEF2F2",
    lightText: "#CE3E39",
  },
  imaging: {
    label: "X-Ray / Imaging",
    Icon: Scan,
    color: "#474543",
    bg: "#F5F5F5",
    lightText: "#474543",
  },
  pharmacy: {
    label: "Pharmacy",
    Icon: Pill,
    color: "#255A90",
    bg: "#EFF6FF",
    lightText: "#255A90",
  },
};

// ─────────────────────────────────────────────────────────────
// RADIAL COUNTDOWN RING
// ─────────────────────────────────────────────────────────────
function WaitRing({
  minutes,
  maxMinutes = 60,
}: {
  minutes: number;
  maxMinutes?: number;
}) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(minutes / maxMinutes, 1);
  const dash = circ * (1 - pct);

  return (
    <svg
      width="128"
      height="128"
      viewBox="0 0 128 128"
      className="rotate-[-90deg]"
    >
      {/* Track */}
      <circle
        cx="64"
        cy="64"
        r={r}
        fill="none"
        stroke="#E0DEDC"
        strokeWidth="8"
      />
      {/* Progress */}
      <circle
        cx="64"
        cy="64"
        r={r}
        fill="none"
        stroke="#013366"
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={dash}
        style={{ transition: "stroke-dashoffset 0.8s ease" }}
      />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// PEOPLE-AHEAD DOTS
// ─────────────────────────────────────────────────────────────
function AheadDots({ ahead, position }: { ahead: number; position: number }) {
  const total = ahead + 1; // include this patient
  const dots = Array.from({ length: Math.min(total, 8) });
  return (
    <div className="flex items-center justify-center gap-2 flex-wrap">
      {dots.map((_, i) => {
        const isMe = i === dots.length - 1;
        return (
          <div
            key={i}
            className={`rounded-full transition-all ${
              isMe
                ? "w-5 h-5 bg-[#013366] ring-2 ring-[#013366]/30"
                : "w-3.5 h-3.5 bg-[#D8D8D8]"
            }`}
          />
        );
      })}
      {total > 8 && (
        <span className="text-xs text-[#9F9D9C]">+{total - 8} more</span>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// GO-HOME CALCULATOR
// ─────────────────────────────────────────────────────────────
function GoHomeCalculator({ waitMinutes }: { waitMinutes: number }) {
  const [open, setOpen] = useState(false);
  const [travelMins, setTravelMins] = useState(10);
  const BUFFER = 5; // extra cushion before appointment

  const timeAtHome = Math.max(
    0,
    waitMinutes - travelMins * 2 - BUFFER
  );
  const leaveByDate = addMinutes(new Date(), waitMinutes - travelMins - BUFFER);
  const leaveByTime = format(leaveByDate, "h:mm a");
  const returnByTime = format(addMinutes(new Date(), waitMinutes - BUFFER), "h:mm a");

  const canGo = timeAtHome > 0;

  return (
    <div className="rounded-2xl border border-[#E0DEDC] bg-white overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] flex items-center justify-center flex-shrink-0">
            <Home className="w-4 h-4 text-[#013366]" />
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-[#2D2D2D]">
              Want to go home?
            </p>
            <p className="text-xs text-[#9F9D9C]">
              Find out if you have time
            </p>
          </div>
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-[#9F9D9C]" />
        ) : (
          <ChevronDown className="w-4 h-4 text-[#9F9D9C]" />
        )}
      </button>

      {open && (
        <div className="px-5 pb-5 border-t border-[#F0EEEC]">
          {/* Travel time slider */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-[#474543]">
                Travel time (one way)
              </label>
              <span className="text-sm font-bold text-[#013366] tabular-nums">
                {travelMins} min
              </span>
            </div>
            <input
              type="range"
              min={2}
              max={Math.floor(waitMinutes / 2)}
              step={1}
              value={travelMins}
              onChange={(e) => setTravelMins(Number(e.target.value))}
              className="w-full accent-[#013366]"
            />
            <div className="flex justify-between text-[10px] text-[#9F9D9C] mt-1">
              <span>2 min</span>
              <span>{Math.floor(waitMinutes / 2)} min</span>
            </div>
          </div>

          {/* Result */}
          <div
            className={`mt-4 rounded-xl p-4 ${
              canGo ? "bg-[#F0FDF4] border border-[#BBF7D0]" : "bg-[#FEF2F2] border border-[#FECACA]"
            }`}
          >
            {canGo ? (
              <>
                <div className="flex items-start gap-2.5 mb-3">
                  <CheckCircle2 className="w-4 h-4 text-[#166534] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-[#166534]">
                      Yes, you have time!
                    </p>
                    <p className="text-xs text-[#166534]/80">
                      You can spend about{" "}
                      <span className="font-bold">{timeAtHome} minutes</span> at
                      home.
                    </p>
                  </div>
                </div>

                {/* Timeline */}
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#013366] flex items-center justify-center flex-shrink-0">
                      <ArrowRight className="w-3 h-3 text-white" />
                    </div>
                    <div>
                      <p className="text-[11px] text-[#9F9D9C]">Leave now</p>
                      <p className="text-xs font-semibold text-[#2D2D2D]">
                        {format(new Date(), "h:mm a")}
                      </p>
                    </div>
                  </div>

                  <div className="ml-3.5 w-px h-4 bg-[#D8D8D8]" />

                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#D97706] flex items-center justify-center flex-shrink-0">
                      <Home className="w-3 h-3 text-white" />
                    </div>
                    <div>
                      <p className="text-[11px] text-[#9F9D9C]">Leave home by</p>
                      <p className="text-xs font-bold text-[#D97706]">
                        {leaveByTime}
                      </p>
                    </div>
                  </div>

                  <div className="ml-3.5 w-px h-4 bg-[#D8D8D8]" />

                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#166534] flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-white" />
                    </div>
                    <div>
                      <p className="text-[11px] text-[#9F9D9C]">
                        Be back by
                      </p>
                      <p className="text-xs font-bold text-[#166534]">
                        {returnByTime}
                      </p>
                    </div>
                  </div>
                </div>

                <p className="mt-3 text-[10px] text-[#9F9D9C]">
                  Includes a {BUFFER}-min buffer. Wait times may vary.
                </p>
              </>
            ) : (
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-[#CE3E39] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-[#CE3E39]">
                    Not enough time
                  </p>
                  <p className="text-xs text-[#CE3E39]/80">
                    The trip would take longer than your remaining wait. Please
                    stay nearby.
                  </p>
                </div>
              </div>
            )}
          </div>

          <p className="mt-3 text-[10px] text-[#9F9D9C] text-center">
            Enable notifications so we can alert you when you're next.
          </p>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// LIVE CLOCK HOOK
// ─────────────────────────────────────────────────────────────
function useLiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);
  return now;
}

// ─────────────────────────────────────────────────────────────
// PATIENT WAITING SCREEN
// ─────────────────────────────────────────────────────────────
export default function PatientWaiting() {
  const patient = DEMO_PATIENT;
  const currentService = patient.services[patient.currentServiceIndex];
  const svc = SERVICE_META[currentService.service];
  const SvcIcon = svc.Icon;
  const now = useLiveClock();

  // Simulate "refreshed" time
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setLastRefreshed(new Date());
      setRefreshing(false);
    }, 900);
  }, []);

  const statusConfig = {
    waiting: { label: "Waiting", color: "text-[#474543]", dot: "bg-[#D8D8D8]" },
    almost: { label: "Almost your turn", color: "text-[#D97706]", dot: "bg-[#D97706] animate-pulse" },
    ready: { label: "Ready for you!", color: "text-[#166534]", dot: "bg-[#22C55E] animate-pulse" },
    "in-progress": { label: "In progress", color: "text-[#013366]", dot: "bg-[#013366]" },
  };
  const status = statusConfig["waiting"];

  return (
    <div className="min-h-screen bg-[#F2F4F7]">
      {/* ── Header bar (mobile only) ── */}
      <header className="lg:hidden w-full bg-[#013366] px-5 pt-safe-top">
        <div className="max-w-sm mx-auto flex items-center justify-between py-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center">
              <svg viewBox="0 0 20 20" fill="white" className="w-4 h-4">
                <path d="M10 2a8 8 0 100 16A8 8 0 0010 2zm1 5H9v4H5v2h4v4h2v-4h4v-2h-4V7z" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] text-white/50 leading-none">BC Care</p>
              <p className="text-sm font-bold text-white leading-none">
                Vancouver General
              </p>
            </div>
          </div>
          <button className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-white/10">
            <Bell className="w-4 h-4 text-white" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#CE3E39] rounded-full border border-[#013366]" />
          </button>
        </div>
      </header>

      {/* ── Desktop two-column layout ── */}
      <div className="lg:flex lg:min-h-screen">
        
        {/* LEFT COLUMN - Main content */}
        <div className="lg:flex-1 lg:overflow-y-auto">
          <div className="w-full max-w-2xl mx-auto px-4 lg:px-8 pb-10 flex-1 flex flex-col gap-4 mt-5 lg:mt-8">

            {/* ── Greeting ── */}
            <div>
              <p className="text-xs text-[#9F9D9C]">
                {format(now, "EEEE, MMMM d · h:mm a")}
              </p>
              <h1 className="text-2xl text-[#2D2D2D] mt-0.5">
                Hi, <span className="font-bold">{patient.name}</span> 👋
              </h1>
              <p className="text-sm text-[#9F9D9C] mt-0.5">
                Here's your current place in the queue.
              </p>
            </div>

            {/* ── Queue position hero card ── */}
            <div className="bg-white rounded-2xl border border-[#E0DEDC] shadow-sm overflow-hidden">
              {/* Ticket strip */}
              <div className="bg-[#013366] px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#D8D8D8]" />
                  <span className="text-xs font-semibold text-white/80">
                    Waiting
                  </span>
                </div>
                <span className="text-xs font-bold text-white/60 tracking-widest">
                  {patient.ticketCode}
                </span>
              </div>

              <div className="px-5 py-5 flex items-center gap-5">
                {/* Ring */}
                <div className="relative flex-shrink-0">
                  <WaitRing minutes={currentService.estimatedWaitMinutes} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-3xl font-bold text-[#013366] tabular-nums leading-none">
                      {currentService.estimatedWaitMinutes}
                    </p>
                    <p className="text-[11px] text-[#9F9D9C]">min left</p>
                  </div>
                </div>

                {/* Position info */}
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-[#9F9D9C] uppercase tracking-widest mb-1">
                    Your position
                  </p>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-5xl font-bold text-[#013366] tabular-nums leading-none">
                      #{currentService.queuePosition}
                    </span>
                  </div>
                  <p className="text-sm text-[#474543] mt-1.5">
                    {currentService.queuePosition === 1 ? (
                      <span className="font-semibold text-[#166534]">
                        You're next!
                      </span>
                    ) : (
                      <>
                        <span className="font-bold text-[#2D2D2D]">
                          {currentService.queuePosition - 1}
                        </span>{" "}
                        {currentService.queuePosition - 1 === 1 ? "person" : "people"} ahead of
                        you
                      </>
                    )}
                  </p>

                  {/* Dots visualizer */}
                  {currentService.queuePosition && (
                    <div className="mt-3">
                      <AheadDots
                        ahead={currentService.queuePosition - 1}
                        position={currentService.queuePosition}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Divider dashed (ticket tear line) */}
              <div className="flex items-center px-4">
                <div className="flex-1 border-t border-dashed border-[#E0DEDC]" />
                <div className="-ml-2 -mr-2 flex gap-1">
                  <div className="w-4 h-4 rounded-full bg-[#F2F4F7] border border-[#E0DEDC]" />
                  <div className="w-4 h-4 rounded-full bg-[#F2F4F7] border border-[#E0DEDC]" />
                </div>
                <div className="flex-1 border-t border-dashed border-[#E0DEDC]" />
              </div>

              {/* Return by time */}
              <div className="px-5 py-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold text-[#9F9D9C] uppercase tracking-widest">
                    Estimated call time
                  </p>
                  <p className="text-base font-bold text-[#2D2D2D] mt-0.5 tabular-nums">
                    {format(
                      addMinutes(new Date(), currentService.estimatedWaitMinutes),
                      "h:mm a"
                    )}
                  </p>
                </div>
                <button
                  onClick={handleRefresh}
                  className="flex items-center gap-1.5 text-[11px] font-semibold text-[#255A90] hover:text-[#013366] transition-colors"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`}
                  />
                  {refreshing
                    ? "Updating…"
                    : `Updated ${format(lastRefreshed, "h:mm a")}`}
                </button>
              </div>
            </div>

            {/* ── Current service card ── */}
            <div className="bg-white rounded-2xl border border-[#E0DEDC] px-5 py-4">
              <p className="text-[10px] font-bold text-[#9F9D9C] uppercase tracking-widest mb-3">
                Current Appointment
              </p>
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: svc.bg }}
                >
                  <SvcIcon className="w-5 h-5" style={{ color: svc.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#2D2D2D]">{svc.label}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <MapPin className="w-3 h-3 text-[#9F9D9C] flex-shrink-0" />
                    <p className="text-xs text-[#9F9D9C] truncate">
                      {currentService.location}
                    </p>
                  </div>
                </div>
              </div>

              {/* What to expect */}
              <div className="mt-4 rounded-xl bg-[#F8F8F7] px-4 py-3">
                <p className="text-[11px] font-bold text-[#474543] mb-2">
                  What to expect
                </p>
                <ul className="space-y-1.5">
                  {currentService.service === "doctor" && [
                    "Bring your health card and any referral forms",
                    "Be ready to describe your symptoms",
                    "A doctor will examine you and discuss next steps",
                  ].map((tip) => (
                    <li key={tip} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#255A90] mt-0.5 flex-shrink-0" />
                      <span className="text-[11px] text-[#474543]">{tip}</span>
                    </li>
                  ))}
                  {currentService.service === "imaging" && [
                    "Bring your health card and any referral forms",
                    "Remove jewellery before your imaging",
                    "A technician will explain the procedure",
                  ].map((tip) => (
                    <li key={tip} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#255A90] mt-0.5 flex-shrink-0" />
                      <span className="text-[11px] text-[#474543]">{tip}</span>
                    </li>
                  ))}
                  {currentService.service === "blood-work" && [
                    "Have your health card ready",
                    "Inform staff if you're fasting",
                    "Lab technician will collect samples",
                  ].map((tip) => (
                    <li key={tip} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#255A90] mt-0.5 flex-shrink-0" />
                      <span className="text-[11px] text-[#474543]">{tip}</span>
                    </li>
                  ))}
                  {currentService.service === "pharmacy" && [
                    "Bring your health card",
                    "Pharmacist will review your medications",
                    "Ask questions about dosage or side effects",
                  ].map((tip) => (
                    <li key={tip} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#255A90] mt-0.5 flex-shrink-0" />
                      <span className="text-[11px] text-[#474543]">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* ── All services overview ── */}
            <div className="bg-white rounded-2xl border border-[#E0DEDC] px-5 py-4">
              <p className="text-[10px] font-bold text-[#9F9D9C] uppercase tracking-widest mb-3">
                Your Journey Today
              </p>
              <div className="space-y-3">
                {patient.services.map((step, idx) => {
                  const stepMeta = SERVICE_META[step.service];
                  const StepIcon = stepMeta.Icon;
                  const isCurrent = idx === patient.currentServiceIndex;
                  const isCompleted = step.status === "completed";
                  const isNotRequested = step.status === "not-requested";
                  const isPending = step.status === "pending";

                  return (
                    <div key={step.service} className="flex items-start gap-3">
                      {/* Icon */}
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          isNotRequested 
                            ? "bg-[#F5F5F5]"
                            : isCurrent
                            ? "ring-2 ring-[#013366]/30"
                            : ""
                        }`}
                        style={{ 
                          backgroundColor: isNotRequested ? "#F5F5F5" : stepMeta.bg 
                        }}
                      >
                        <StepIcon 
                          className="w-5 h-5" 
                          style={{ 
                            color: isNotRequested ? "#9F9D9C" : stepMeta.color 
                          }} 
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-bold ${
                              isNotRequested ? "text-[#9F9D9C]" : "text-[#2D2D2D]"
                            }`}>
                              {stepMeta.label}
                            </p>
                            <p className="text-xs text-[#9F9D9C] truncate mt-0.5">
                              {step.location}
                            </p>
                          </div>

                          {/* Status badge */}
                          {isCurrent && (
                            <span className="flex-shrink-0 px-2 py-0.5 rounded-full bg-[#EFF6FF] border border-[#013366]/20 text-[10px] font-bold text-[#013366]">
                              Current
                            </span>
                          )}
                          {isCompleted && (
                            <span className="flex-shrink-0 px-2 py-0.5 rounded-full bg-[#F0FDF4] border border-[#166534]/20 text-[10px] font-bold text-[#166534] flex items-center gap-0.5">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              Done
                            </span>
                          )}
                          {isNotRequested && (
                            <span className="flex-shrink-0 px-2 py-0.5 rounded-full bg-[#F5F5F5] border border-[#D8D8D8] text-[10px] font-bold text-[#9F9D9C]">
                              Not needed
                            </span>
                          )}
                          {isPending && !isCurrent && (
                            <span className="flex-shrink-0 px-2 py-0.5 rounded-full bg-[#FFFBEB] border border-[#D97706]/20 text-[10px] font-bold text-[#D97706]">
                              Upcoming
                            </span>
                          )}
                        </div>

                        {/* Wait time info */}
                        <div className="mt-2 flex items-center gap-4">
                          {step.queuePosition && !isNotRequested ? (
                            <div className="flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5 text-[#9F9D9C]" />
                              <span className="text-xs text-[#474543]">
                                Position <span className="font-bold text-[#2D2D2D]">#{step.queuePosition}</span>
                              </span>
                            </div>
                          ) : null}
                          
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-[#9F9D9C]" />
                            <span className={`text-xs ${
                              isNotRequested 
                                ? "text-[#9F9D9C]" 
                                : "text-[#474543]"
                            }`}>
                              {step.estimatedWaitMinutes === 0 ? (
                                <span className="font-semibold">0 min wait</span>
                              ) : (
                                <>
                                  ~<span className="font-bold text-[#2D2D2D]">
                                    {step.estimatedWaitMinutes}
                                  </span> min wait
                                </>
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── Go Home calculator ── */}
            <GoHomeCalculator waitMinutes={currentService.estimatedWaitMinutes} />

            {/* ── Notification opt-in ── */}
            <div className="bg-[#013366] rounded-2xl px-5 py-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white">
                  Get notified when you're next
                </p>
                <p className="text-[11px] text-white/60 mt-0.5">
                  We'll text you 10 minutes before your turn.
                </p>
              </div>
              <button className="flex-shrink-0 px-3 py-2 rounded-lg bg-white text-[#013366] text-[11px] font-bold hover:bg-white/90 transition-colors whitespace-nowrap">
                Turn on
              </button>
            </div>

            {/* ── Help footer ── */}
            <div className="rounded-2xl border border-[#E0DEDC] bg-white px-5 py-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-[#2D2D2D]">Need help?</p>
                <p className="text-xs text-[#9F9D9C]">
                  Ask at the front desk or call us
                </p>
              </div>
              <a
                href="tel:+16045551234"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#F2F4F7] border border-[#E0DEDC] text-[11px] font-semibold text-[#013366] hover:bg-[#EFF6FF] transition-colors whitespace-nowrap"
              >
                <Phone className="w-3.5 h-3.5" />
                Call us
              </a>
            </div>

            {/* ── Live stats (mobile only) ── */}
            <div className="lg:hidden bg-white rounded-2xl border border-[#E0DEDC] p-5">
              <p className="text-[10px] font-bold text-[#9F9D9C] uppercase tracking-widest mb-4">Live Queue Stats</p>
              
              <div className="grid grid-cols-3 gap-3">
                {/* In queue */}
                <div className="text-center">
                  <div className="w-12 h-12 rounded-xl bg-[#EFF6FF] flex items-center justify-center mx-auto mb-2">
                    <Users className="w-5 h-5 text-[#013366]" />
                  </div>
                  <p className="text-xs text-[#9F9D9C] mb-0.5">In Queue</p>
                  <p className="text-base font-bold text-[#2D2D2D]">4</p>
                </div>

                {/* Avg wait */}
                <div className="text-center">
                  <div className="w-12 h-12 rounded-xl bg-[#F0FDF4] flex items-center justify-center mx-auto mb-2">
                    <Activity className="w-5 h-5 text-[#166534]" />
                  </div>
                  <p className="text-xs text-[#9F9D9C] mb-0.5">Avg Wait</p>
                  <p className="text-base font-bold text-[#2D2D2D]">25m</p>
                </div>

                {/* Queue status */}
                <div className="text-center">
                  <div className="w-12 h-12 rounded-xl bg-[#FFFBEB] flex items-center justify-center mx-auto mb-2">
                    <Clock className="w-5 h-5 text-[#D97706]" />
                  </div>
                  <p className="text-xs text-[#9F9D9C] mb-0.5">Status</p>
                  <p className="text-base font-bold text-[#D97706]">Fast</p>
                </div>
              </div>
            </div>

            {/* ── Facility info (mobile only) ── */}
            <div className="lg:hidden bg-white rounded-2xl border border-[#E0DEDC] p-5">
              <p className="text-[10px] font-bold text-[#9F9D9C] uppercase tracking-widest mb-3">Facility Info</p>
              
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5 text-[#013366]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-[#2D2D2D]">Vancouver General</p>
                  <p className="text-xs text-[#9F9D9C]">BC Care Network</p>
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-[#9F9D9C] mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-[#474543]">899 W 12th Ave, Vancouver, BC V5Z 1M9</p>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-[#9F9D9C] flex-shrink-0" />
                  <a href="tel:+16045550123" className="text-xs text-[#255A90] hover:text-[#013366] transition-colors">
                    +1 (604) 555-0123
                  </a>
                </div>
              </div>

              {/* Current capacity */}
              <div className="mt-4 pt-4 border-t border-[#E0DEDC]">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-bold text-[#9F9D9C] uppercase tracking-widest">Current Capacity</p>
                  <span className="px-2 py-0.5 rounded-full bg-[#FFFBEB] border border-[#D97706]/20 text-[10px] font-bold text-[#D97706]">Moderate</span>
                </div>
                <div className="h-2 rounded-full bg-[#F5F5F5] overflow-hidden">
                  <div className="h-full bg-[#D97706] rounded-full" style={{ width: "65%" }} />
                </div>
                <p className="text-[11px] text-[#9F9D9C] mt-1.5">65% capacity</p>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT SIDEBAR - Facility info + live stats + wayfinding (desktop only) */}
        <aside className="hidden lg:block lg:w-96 lg:bg-white lg:border-l lg:border-[#E0DEDC] lg:overflow-y-auto flex-shrink-0">
          <div className="px-6 py-8 space-y-5">
            
            {/* Back to Dashboard Link */}
            <Link 
              to="/" 
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#F2F4F7] border border-[#E0DEDC] text-sm font-semibold text-[#013366] hover:bg-[#EFF6FF] hover:border-[#013366]/20 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Link>
            
            {/* Facility info card */}
            <div className="bg-[#013366] rounded-2xl p-5">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-base font-bold text-white">BC Care</p>
                  <p className="text-sm text-white/70">Vancouver General</p>
                </div>
              </div>
              <div className="space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-white/60 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-white/80">899 W 12th Ave, Vancouver, BC V5Z 1M9</p>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-white/60 flex-shrink-0" />
                  <a href="tel:+16045550123" className="text-xs text-white/80 hover:text-white transition-colors">
                    +1 (604) 555-0123
                  </a>
                </div>
              </div>

              {/* Current capacity */}
              <div className="mt-4 pt-4 border-t border-white/20">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Current Capacity</p>
                  <span className="px-2 py-0.5 rounded-full bg-[#D97706] text-white text-[10px] font-bold">Moderate</span>
                </div>
                <div className="h-2 rounded-full bg-white/20 overflow-hidden">
                  <div className="h-full bg-[#D97706] rounded-full" style={{ width: "65%" }} />
                </div>
                <p className="text-[11px] text-white/60 mt-1.5">65%</p>
              </div>
            </div>

            {/* Live queue stats */}
            <div className="bg-white rounded-2xl border border-[#E0DEDC] p-5">
              <p className="text-[10px] font-bold text-[#9F9D9C] uppercase tracking-widest mb-4">Live Queue Stats</p>
              
              <div className="space-y-4">
                {/* In queue */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-[#013366]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-[#9F9D9C]">In Queue</p>
                    <p className="text-lg font-bold text-[#2D2D2D]">4 patients</p>
                  </div>
                </div>

                {/* Avg wait */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F0FDF4] flex items-center justify-center flex-shrink-0">
                    <Activity className="w-5 h-5 text-[#166534]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-[#9F9D9C]">Avg Wait</p>
                    <p className="text-lg font-bold text-[#2D2D2D]">~25 min</p>
                  </div>
                </div>

                {/* Queue status */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FFFBEB] flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-[#D97706]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-[#9F9D9C]">Queue Status</p>
                    <p className="text-lg font-bold text-[#D97706]">Moving fast</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Finding your way */}
            <div className="bg-white rounded-2xl border border-[#E0DEDC] p-5">
              <p className="text-[10px] font-bold text-[#9F9D9C] uppercase tracking-widest mb-4">Finding Your Way</p>
              
              {/* Map placeholder */}
              <div className="relative bg-[#F8F8F7] rounded-xl overflow-hidden mb-3" style={{ aspectRatio: "1/1" }}>
                {/* Simple grid pattern */}
                <div className="absolute inset-0" style={{
                  backgroundImage: `
                    linear-gradient(to right, #E0DEDC 1px, transparent 1px),
                    linear-gradient(to bottom, #E0DEDC 1px, transparent 1px)
                  `,
                  backgroundSize: "20px 20px"
                }} />
                
                {/* Location marker */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="w-14 h-14 rounded-full bg-[#013366] flex items-center justify-center shadow-lg">
                    <MapPin className="w-7 h-7 text-white" />
                  </div>
                </div>
              </div>

              {/* Location details */}
              <div className="text-center">
                <p className="text-sm font-bold text-[#2D2D2D]">Radiology</p>
                <p className="text-xs text-[#9F9D9C]">Floor 2 · Room 12</p>
              </div>
            </div>

          </div>
        </aside>

      </div>
    </div>
  );
}