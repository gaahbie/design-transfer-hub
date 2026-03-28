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
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
  currentServiceIndex: number;
}

const DEMO_PATIENT: PatientStatus = {
  name: "Kathryn",
  ticketCode: "ENC-1247",
  currentServiceIndex: 0,
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
  { label: string; Icon: any; colorClass: string; bgClass: string }
> = {
  doctor: {
    label: "Doctor Consultation",
    Icon: Stethoscope,
    colorClass: "text-primary",
    bgClass: "bg-[hsl(var(--status-info-bg))]",
  },
  "blood-work": {
    label: "Blood Work",
    Icon: FlaskConical,
    colorClass: "text-destructive",
    bgClass: "bg-[hsl(var(--status-critical-bg))]",
  },
  imaging: {
    label: "X-Ray / Imaging",
    Icon: Scan,
    colorClass: "text-muted-foreground",
    bgClass: "bg-muted",
  },
  pharmacy: {
    label: "Pharmacy",
    Icon: Pill,
    colorClass: "text-[hsl(var(--ring))]",
    bgClass: "bg-[hsl(var(--status-info-bg))]",
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
      <circle
        cx="64"
        cy="64"
        r={r}
        fill="none"
        className="stroke-border"
        strokeWidth="8"
      />
      <circle
        cx="64"
        cy="64"
        r={r}
        fill="none"
        className="stroke-primary"
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
  const total = ahead + 1;
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
                ? "w-5 h-5 bg-primary ring-2 ring-primary/30"
                : "w-3.5 h-3.5 bg-border"
            }`}
          />
        );
      })}
      {total > 8 && (
        <span className="text-xs text-muted-foreground">+{total - 8} more</span>
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
  const BUFFER = 5;

  const timeAtHome = Math.max(0, waitMinutes - travelMins * 2 - BUFFER);
  const leaveByDate = addMinutes(new Date(), waitMinutes - travelMins - BUFFER);
  const leaveByTime = format(leaveByDate, "h:mm a");
  const returnByTime = format(addMinutes(new Date(), waitMinutes - BUFFER), "h:mm a");

  const canGo = timeAtHome > 0;

  return (
    <Card className="rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[hsl(var(--status-info-bg))] flex items-center justify-center flex-shrink-0">
            <Home className="w-4 h-4 text-primary" />
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-foreground">Want to go home?</p>
            <p className="text-xs text-muted-foreground">Find out if you have time</p>
          </div>
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {open && (
        <div className="px-5 pb-5 border-t border-border">
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-muted-foreground">
                Travel time (one way)
              </label>
              <span className="text-sm font-bold text-primary tabular-nums">
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
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
              <span>2 min</span>
              <span>{Math.floor(waitMinutes / 2)} min</span>
            </div>
          </div>

          <div
            className={`mt-4 rounded-xl p-4 ${
              canGo
                ? "bg-[var(--status-success-bg)] border border-[var(--status-success-border)]"
                : "bg-[var(--status-critical-bg)] border border-[var(--status-critical-border)]"
            }`}
          >
            {canGo ? (
              <>
                <div className="flex items-start gap-2.5 mb-3">
                  <CheckCircle2 className="w-4 h-4 text-[var(--status-success)] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-[var(--status-success)]">
                      Yes, you have time!
                    </p>
                    <p className="text-xs text-[var(--status-success)]/80">
                      You can spend about{" "}
                      <span className="font-bold">{timeAtHome} minutes</span> at home.
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <ArrowRight className="w-3 h-3 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="text-[11px] text-muted-foreground">Leave now</p>
                      <p className="text-xs font-semibold text-foreground">
                        {format(new Date(), "h:mm a")}
                      </p>
                    </div>
                  </div>

                  <div className="ml-3.5 w-px h-4 bg-border" />

                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-[var(--status-warning)] flex items-center justify-center flex-shrink-0">
                      <Home className="w-3 h-3 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="text-[11px] text-muted-foreground">Leave home by</p>
                      <p className="text-xs font-bold text-[var(--status-warning)]">
                        {leaveByTime}
                      </p>
                    </div>
                  </div>

                  <div className="ml-3.5 w-px h-4 bg-border" />

                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-[var(--status-success)] flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="text-[11px] text-muted-foreground">Be back by</p>
                      <p className="text-xs font-bold text-[var(--status-success)]">
                        {returnByTime}
                      </p>
                    </div>
                  </div>
                </div>

                <p className="mt-3 text-[10px] text-muted-foreground">
                  Includes a {BUFFER}-min buffer. Wait times may vary.
                </p>
              </>
            ) : (
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-destructive">Not enough time</p>
                  <p className="text-xs text-destructive/80">
                    The trip would take longer than your remaining wait. Please stay nearby.
                  </p>
                </div>
              </div>
            )}
          </div>

          <p className="mt-3 text-[10px] text-muted-foreground text-center">
            Enable notifications so we can alert you when you're next.
          </p>
        </div>
      )}
    </Card>
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

  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setLastRefreshed(new Date());
      setRefreshing(false);
    }, 900);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* ── Header bar (mobile only) ── */}
      <header className="lg:hidden w-full bg-primary px-5 pt-safe-top">
        <div className="max-w-sm mx-auto flex items-center justify-between py-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary-foreground/15 flex items-center justify-center">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-primary-foreground">
                <path d="M10 2a8 8 0 100 16A8 8 0 0010 2zm1 5H9v4H5v2h4v4h2v-4h4v-2h-4V7z" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] text-primary-foreground/50 leading-none">BC Care</p>
              <p className="text-sm font-bold text-primary-foreground leading-none">
                Vancouver General
              </p>
            </div>
          </div>
          <button className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-primary-foreground/10">
            <Bell className="w-4 h-4 text-primary-foreground" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full border border-primary" />
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
              <p className="text-xs text-muted-foreground">
                {format(now, "EEEE, MMMM d · h:mm a")}
              </p>
              <h1 className="text-2xl text-foreground mt-0.5">
                Hi, <span className="font-bold">{patient.name}</span> 👋
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Here's your current place in the queue.
              </p>
            </div>

            {/* ── Queue position hero card ── */}
            <Card className="rounded-2xl overflow-hidden">
              {/* Ticket strip */}
              <div className="bg-primary px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-border" />
                  <span className="text-xs font-semibold text-primary-foreground/80">
                    Waiting
                  </span>
                </div>
                <span className="text-xs font-bold text-primary-foreground/60 tracking-widest">
                  {patient.ticketCode}
                </span>
              </div>

              <div className="px-5 py-5 flex items-center gap-5">
                {/* Ring */}
                <div className="relative flex-shrink-0">
                  <WaitRing minutes={currentService.estimatedWaitMinutes} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-3xl font-bold text-primary tabular-nums leading-none">
                      {currentService.estimatedWaitMinutes}
                    </p>
                    <p className="text-[11px] text-muted-foreground">min left</p>
                  </div>
                </div>

                {/* Position info */}
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                    Your position
                  </p>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-5xl font-bold text-primary tabular-nums leading-none">
                      #{currentService.queuePosition}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1.5">
                    {currentService.queuePosition === 1 ? (
                      <span className="font-semibold text-[var(--status-success)]">
                        You're next!
                      </span>
                    ) : (
                      <>
                        <span className="font-bold text-foreground">
                          {currentService.queuePosition! - 1}
                        </span>{" "}
                        {currentService.queuePosition! - 1 === 1 ? "person" : "people"} ahead of you
                      </>
                    )}
                  </p>

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
                <div className="flex-1 border-t border-dashed border-border" />
                <div className="-ml-2 -mr-2 flex gap-1">
                  <div className="w-4 h-4 rounded-full bg-background border border-border" />
                  <div className="w-4 h-4 rounded-full bg-background border border-border" />
                </div>
                <div className="flex-1 border-t border-dashed border-border" />
              </div>

              {/* Return by time */}
              <div className="px-5 py-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    Estimated call time
                  </p>
                  <p className="text-base font-bold text-foreground mt-0.5 tabular-nums">
                    {format(
                      addMinutes(new Date(), currentService.estimatedWaitMinutes),
                      "h:mm a"
                    )}
                  </p>
                </div>
                <button
                  onClick={handleRefresh}
                  className="flex items-center gap-1.5 text-[11px] font-semibold text-[hsl(var(--ring))] hover:text-primary transition-colors"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`}
                  />
                  {refreshing
                    ? "Updating…"
                    : `Updated ${format(lastRefreshed, "h:mm a")}`}
                </button>
              </div>
            </Card>

            {/* ── Current service card ── */}
            <Card className="rounded-2xl px-5 py-4">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">
                Current Appointment
              </p>
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${svc.bgClass}`}>
                  <SvcIcon className={`w-5 h-5 ${svc.colorClass}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground">{svc.label}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <MapPin className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                    <p className="text-xs text-muted-foreground truncate">
                      {currentService.location}
                    </p>
                  </div>
                </div>
              </div>

              {/* What to expect */}
              <div className="mt-4 rounded-xl bg-muted px-4 py-3">
                <p className="text-[11px] font-bold text-muted-foreground mb-2">
                  What to expect
                </p>
                <ul className="space-y-1.5">
                  {(currentService.service === "doctor"
                    ? [
                        "Bring your health card and any referral forms",
                        "Be ready to describe your symptoms",
                        "A doctor will examine you and discuss next steps",
                      ]
                    : currentService.service === "imaging"
                    ? [
                        "Bring your health card and any referral forms",
                        "Remove jewellery before your imaging",
                        "A technician will explain the procedure",
                      ]
                    : currentService.service === "blood-work"
                    ? [
                        "Have your health card ready",
                        "Inform staff if you're fasting",
                        "Lab technician will collect samples",
                      ]
                    : [
                        "Bring your health card",
                        "Pharmacist will review your medications",
                        "Ask questions about dosage or side effects",
                      ]
                  ).map((tip) => (
                    <li key={tip} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[hsl(var(--ring))] mt-0.5 flex-shrink-0" />
                      <span className="text-[11px] text-muted-foreground">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>

            {/* ── All services overview ── */}
            <Card className="rounded-2xl px-5 py-4">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">
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
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          isNotRequested
                            ? "bg-muted"
                            : `${stepMeta.bgClass} ${isCurrent ? "ring-2 ring-primary/30" : ""}`
                        }`}
                      >
                        <StepIcon
                          className={`w-5 h-5 ${
                            isNotRequested ? "text-muted-foreground" : stepMeta.colorClass
                          }`}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-bold ${
                              isNotRequested ? "text-muted-foreground" : "text-foreground"
                            }`}>
                              {stepMeta.label}
                            </p>
                            <p className="text-xs text-muted-foreground truncate mt-0.5">
                              {step.location}
                            </p>
                          </div>

                          {isCurrent && (
                            <span className="flex-shrink-0 px-2 py-0.5 rounded-full bg-[var(--status-info-bg)] border border-primary/20 text-[10px] font-bold text-primary">
                              Current
                            </span>
                          )}
                          {isCompleted && (
                            <span className="flex-shrink-0 px-2 py-0.5 rounded-full bg-[var(--status-success-bg)] border border-[var(--status-success)]/20 text-[10px] font-bold text-[var(--status-success)] flex items-center gap-0.5">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              Done
                            </span>
                          )}
                          {isNotRequested && (
                            <span className="flex-shrink-0 px-2 py-0.5 rounded-full bg-muted border border-border text-[10px] font-bold text-muted-foreground">
                              Not needed
                            </span>
                          )}
                          {isPending && !isCurrent && (
                            <span className="flex-shrink-0 px-2 py-0.5 rounded-full bg-[var(--status-warning-bg)] border border-[var(--status-warning)]/20 text-[10px] font-bold text-[var(--status-warning)]">
                              Upcoming
                            </span>
                          )}
                        </div>

                        <div className="mt-2 flex items-center gap-4">
                          {step.queuePosition && !isNotRequested ? (
                            <div className="flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                Position <span className="font-bold text-foreground">#{step.queuePosition}</span>
                              </span>
                            </div>
                          ) : null}

                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className={`text-xs ${
                              isNotRequested ? "text-muted-foreground" : "text-muted-foreground"
                            }`}>
                              {step.estimatedWaitMinutes === 0 ? (
                                <span className="font-semibold">0 min wait</span>
                              ) : (
                                <>
                                  ~<span className="font-bold text-foreground">
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
            </Card>

            {/* ── Go Home calculator ── */}
            <GoHomeCalculator waitMinutes={currentService.estimatedWaitMinutes} />

            {/* ── Notification opt-in ── */}
            <div className="bg-primary rounded-2xl px-5 py-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary-foreground/15 flex items-center justify-center flex-shrink-0">
                <Bell className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-primary-foreground">
                  Get notified when you're next
                </p>
                <p className="text-[11px] text-primary-foreground/60 mt-0.5">
                  We'll text you 10 minutes before your turn.
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="flex-shrink-0 bg-primary-foreground text-primary hover:bg-primary-foreground/90 text-[11px] font-bold"
              >
                Turn on
              </Button>
            </div>

            {/* ── Help footer ── */}
            <Card className="rounded-2xl px-5 py-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-foreground">Need help?</p>
                <p className="text-xs text-muted-foreground">
                  Ask at the front desk or call us
                </p>
              </div>
              <a
                href="tel:+16045551234"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-muted border border-border text-[11px] font-semibold text-primary hover:bg-[var(--status-info-bg)] transition-colors whitespace-nowrap"
              >
                <Phone className="w-3.5 h-3.5" />
                Call us
              </a>
            </Card>

            {/* ── Live stats (mobile only) ── */}
            <Card className="lg:hidden rounded-2xl p-5">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Live Queue Stats</p>

              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-xl bg-[var(--status-info-bg)] flex items-center justify-center mx-auto mb-2">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-xs text-muted-foreground mb-0.5">In Queue</p>
                  <p className="text-base font-bold text-foreground">4</p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 rounded-xl bg-[var(--status-success-bg)] flex items-center justify-center mx-auto mb-2">
                    <Activity className="w-5 h-5 text-[var(--status-success)]" />
                  </div>
                  <p className="text-xs text-muted-foreground mb-0.5">Avg Wait</p>
                  <p className="text-base font-bold text-foreground">25m</p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 rounded-xl bg-[var(--status-warning-bg)] flex items-center justify-center mx-auto mb-2">
                    <Clock className="w-5 h-5 text-[var(--status-warning)]" />
                  </div>
                  <p className="text-xs text-muted-foreground mb-0.5">Status</p>
                  <p className="text-base font-bold text-[var(--status-warning)]">Fast</p>
                </div>
              </div>
            </Card>

            {/* ── Facility info (mobile only) ── */}
            <Card className="lg:hidden rounded-2xl p-5">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Facility Info</p>

              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[var(--status-info-bg)] flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-foreground">Vancouver General</p>
                  <p className="text-xs text-muted-foreground">BC Care Network</p>
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-muted-foreground">899 W 12th Ave, Vancouver, BC V5Z 1M9</p>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <a href="tel:+16045550123" className="text-xs text-[hsl(var(--ring))] hover:text-primary transition-colors">
                    +1 (604) 555-0123
                  </a>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Current Capacity</p>
                  <span className="px-2 py-0.5 rounded-full bg-[var(--status-warning-bg)] border border-[var(--status-warning)]/20 text-[10px] font-bold text-[var(--status-warning)]">Moderate</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-[var(--status-warning)] rounded-full" style={{ width: "65%" }} />
                </div>
                <p className="text-[11px] text-muted-foreground mt-1.5">65% capacity</p>
              </div>
            </Card>

          </div>
        </div>

        {/* RIGHT SIDEBAR - Desktop only */}
        <aside className="hidden lg:block lg:w-96 lg:bg-card lg:border-l lg:border-border lg:overflow-y-auto flex-shrink-0">
          <div className="px-6 py-8 space-y-5">

            <Link
              to="/dashboard"
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-muted border border-border text-sm font-semibold text-primary hover:bg-[var(--status-info-bg)] hover:border-primary/20 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Link>

            {/* Facility info card */}
            <div className="bg-primary rounded-2xl p-5">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl bg-primary-foreground/15 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-base font-bold text-primary-foreground">BC Care</p>
                  <p className="text-sm text-primary-foreground/70">Vancouver General</p>
                </div>
              </div>
              <div className="space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-primary-foreground/60 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-primary-foreground/80">899 W 12th Ave, Vancouver, BC V5Z 1M9</p>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-primary-foreground/60 flex-shrink-0" />
                  <a href="tel:+16045550123" className="text-xs text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                    +1 (604) 555-0123
                  </a>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-primary-foreground/20">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-bold text-primary-foreground/60 uppercase tracking-widest">Current Capacity</p>
                  <span className="px-2 py-0.5 rounded-full bg-[var(--status-warning)] text-primary-foreground text-[10px] font-bold">Moderate</span>
                </div>
                <div className="h-2 rounded-full bg-primary-foreground/20 overflow-hidden">
                  <div className="h-full bg-[var(--status-warning)] rounded-full" style={{ width: "65%" }} />
                </div>
                <p className="text-[11px] text-primary-foreground/60 mt-1.5">65%</p>
              </div>
            </div>

            {/* Live queue stats */}
            <Card className="rounded-2xl p-5">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Live Queue Stats</p>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--status-info-bg)] flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">In Queue</p>
                    <p className="text-lg font-bold text-foreground">4 patients</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--status-success-bg)] flex items-center justify-center flex-shrink-0">
                    <Activity className="w-5 h-5 text-[var(--status-success)]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Avg Wait</p>
                    <p className="text-lg font-bold text-foreground">~25 min</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--status-warning-bg)] flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-[var(--status-warning)]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Queue Status</p>
                    <p className="text-lg font-bold text-[var(--status-warning)]">Moving fast</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Finding your way */}
            <Card className="rounded-2xl p-5">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Finding Your Way</p>

              <div className="relative bg-muted rounded-xl overflow-hidden mb-3" style={{ aspectRatio: "1/1" }}>
                <div className="absolute inset-0" style={{
                  backgroundImage: `
                    linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px),
                    linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)
                  `,
                  backgroundSize: "20px 20px"
                }} />

                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg">
                    <MapPin className="w-7 h-7 text-primary-foreground" />
                  </div>
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm font-bold text-foreground">Radiology</p>
                <p className="text-xs text-muted-foreground">Floor 2 · Room 12</p>
              </div>
            </Card>

          </div>
        </aside>

      </div>
    </div>
  );
}
