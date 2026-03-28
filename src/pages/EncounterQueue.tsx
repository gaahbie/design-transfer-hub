import { useState, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { format } from "date-fns";
import {
  LayoutDashboard,
  ClipboardList,
  Bell,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Stethoscope,
  FlaskConical,
  Scan,
  Pill,
  CheckCircle2,
  Clock,
  Search,
  X,
  TrendingDown,
  UserCheck,
  Users,
  AlertTriangle,
  AlertCircle,
  Info,
  RefreshCw,
  Settings,
  Activity,
} from "lucide-react";
import { getAllEncountersWithPatients, type ServiceLine, type JourneyStatus } from "@/data/mockData";

// ─────────────────────────────────────────────────────────────
// DESIGN SYSTEM TOKENS
// ─────────────────────────────────────────────────────────────
const TRIAGE = {
  1: { label: "Resuscitation", short: "Resus",       bg: "bg-[#7B0D1E]", text: "text-white", lightBg: "bg-[#FEF2F2]", border: "border-l-[#7B0D1E]", dot: "#7B0D1E", target: "Immediate" },
  2: { label: "Emergent",      short: "Emergent",    bg: "bg-[#CE3E39]", text: "text-white", lightBg: "bg-[#FEF2F2]", border: "border-l-[#CE3E39]", dot: "#CE3E39", target: "≤ 15 min" },
  3: { label: "Urgent",        short: "Urgent",      bg: "bg-[#D97706]", text: "text-white", lightBg: "bg-[#FFFBEB]", border: "border-l-[#D97706]", dot: "#D97706", target: "≤ 30 min" },
  4: { label: "Less Urgent",   short: "Less Urgent", bg: "bg-[#255A90]", text: "text-white", lightBg: "bg-[#EFF6FF]", border: "border-l-[#255A90]", dot: "#255A90", target: "≤ 60 min" },
  5: { label: "Non-Urgent",    short: "Non-Urgent",  bg: "bg-[#474543]", text: "text-white", lightBg: "bg-[#F5F5F5]", border: "border-l-[#474543]", dot: "#474543", target: "≤ 120 min" },
} as const;

const SERVICE_CONFIG: Record<ServiceLine, { label: string; Icon: any; color: string; lightBg: string; badgeBg: string; badgeText: string }> = {
  "doctor":     { label: "Doctor Consultation",     Icon: Stethoscope,  color: "#013366", lightBg: "#EFF6FF", badgeBg: "bg-[#EFF6FF]", badgeText: "text-[#013366]" },
  "blood-work": { label: "Blood Work",              Icon: FlaskConical, color: "#CE3E39", lightBg: "#FEF2F2", badgeBg: "bg-[#FEF2F2]", badgeText: "text-[#CE3E39]" },
  "imaging":    { label: "X-Ray / Imaging",         Icon: Scan,         color: "#474543", lightBg: "#F5F5F5", badgeBg: "bg-[#F5F5F5]", badgeText: "text-[#474543]" },
  "pharmacy":   { label: "Pharmacy / Medication",   Icon: Pill,         color: "#255A90", lightBg: "#F0F4FA", badgeBg: "bg-[#F0F4FA]", badgeText: "text-[#255A90]" },
};

const STATUS_STYLE: Record<JourneyStatus, { bg: string; text: string; border: string }> = {
  "Waiting":              { bg: "bg-[#F5F5F5]",  text: "text-[#474543]",  border: "border-[#D8D8D8]" },
  "In Progress":          { bg: "bg-[#EFF6FF]",  text: "text-[#013366]",  border: "border-[#BFDBFE]" },
  "Awaiting Lab Results": { bg: "bg-[#FFFBEB]",  text: "text-[#92400E]",  border: "border-[#FDE68A]" },
  "With Specialist":      { bg: "bg-[#F0F4FA]",  text: "text-[#1E5189]",  border: "border-[#BFDBFE]" },
  "Ready for Discharge":  { bg: "bg-[#F0FDF4]",  text: "text-[#166534]",  border: "border-[#BBF7D0]" },
  "In Triage":            { bg: "bg-[#F5F5F5]",  text: "text-[#2D2D2D]",  border: "border-[#D8D8D8]" },
  "Awaiting Medication":  { bg: "bg-[#FFF7ED]",  text: "text-[#9A3412]",  border: "border-[#FED7AA]" },
};

// ─────────────────────────────────────────────────────────────
// CLINICAL ALERTS
// ─────────────────────────────────────────────────────────────
type FindingSeverity = "critical" | "warning" | "info" | "clear";
interface ClinicalAlert { label: string; severity: FindingSeverity }

function computeClinicalAlerts(vitals: any, labs: any[]): ClinicalAlert[] {
  const out: ClinicalAlert[] = [];

  if (vitals) {
    if (vitals.o2_saturation < 90)       out.push({ label: `Critical SpO2 ${vitals.o2_saturation}%`,   severity: "critical" });
    else if (vitals.o2_saturation < 95)  out.push({ label: `Low SpO2 ${vitals.o2_saturation}%`,        severity: "warning" });

    if (vitals.systolic_bp > 180)        out.push({ label: "Hypertensive Crisis",                      severity: "critical" });
    else if (vitals.systolic_bp > 140)   out.push({ label: `High BP ${vitals.systolic_bp}/${vitals.diastolic_bp}`, severity: "warning" });

    if (vitals.heart_rate > 130)         out.push({ label: `Tachycardia ${vitals.heart_rate} bpm`,     severity: "critical" });
    else if (vitals.heart_rate > 100)    out.push({ label: `Tachycardia ${vitals.heart_rate} bpm`,     severity: "warning" });
    else if (vitals.heart_rate < 50)     out.push({ label: `Bradycardia ${vitals.heart_rate} bpm`,     severity: "warning" });

    if (vitals.temperature_celsius >= 39.5) out.push({ label: `High Fever ${vitals.temperature_celsius}°C`, severity: "critical" });
    else if (vitals.temperature_celsius >= 38.0) out.push({ label: `Fever ${vitals.temperature_celsius}°C`, severity: "warning" });

    if (vitals.pain_scale >= 9)          out.push({ label: `Severe Pain ${vitals.pain_scale}/10`,      severity: "critical" });
    else if (vitals.pain_scale >= 7)     out.push({ label: `Pain ${vitals.pain_scale}/10`,              severity: "warning" });

    if (vitals.respiratory_rate > 30)    out.push({ label: `High RR ${vitals.respiratory_rate}`,       severity: "critical" });
    else if (vitals.respiratory_rate > 20) out.push({ label: `Tachypnoea RR ${vitals.respiratory_rate}`, severity: "warning" });
  }

  labs?.filter((l: any) => l.abnormal_flag).forEach((lab: any) => {
    const codeMap: Record<string, { label: string; severity: FindingSeverity }> = {
      TROP: { label: "↑ Troponin",       severity: "critical" },
      DDIM: { label: "↑ D-Dimer",        severity: "warning" },
      WBC:  { label: "↑ WBC",            severity: "warning" },
      CRP:  { label: "↑ CRP",            severity: "warning" },
      PCT:  { label: "↑ Procalcitonin",  severity: "warning" },
      BNP:  { label: "↑ BNP",            severity: "warning" },
      GLU:  { label: "↑↑ Glucose",       severity: "critical" },
      KET:  { label: "Ketones ↑",        severity: "critical" },
      LAC:  { label: "↑ Lactate",        severity: "critical" },
      PAO2: { label: "↓ PaO2",           severity: "critical" },
    };
    if (codeMap[lab.test_code]) out.push(codeMap[lab.test_code]);
  });

  if (out.length === 0) out.push({ label: "All clear", severity: "clear" });
  return out.slice(0, 4); // max 4 chips per card
}

const FINDING_CHIP_STYLE: Record<FindingSeverity, string> = {
  critical: "bg-[#FEF2F2] text-[#CE3E39] border border-[#FECACA]",
  warning:  "bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A]",
  info:     "bg-[#EFF6FF] text-[#1E5189] border border-[#BFDBFE]",
  clear:    "bg-[#F0FDF4] text-[#166534] border border-[#BBF7D0]",
};

const FINDING_ICON: Record<FindingSeverity, any> = {
  critical: AlertCircle,
  warning:  AlertTriangle,
  info:     Info,
  clear:    CheckCircle2,
};

// ─────────────────────────────────────────────────────────────
// SMALL SHARED COMPONENTS
// ───────────────────────────────────────────────────────────
function StatusPill({ status }: { status: JourneyStatus }) {
  const s = STATUS_STYLE[status] ?? STATUS_STYLE["Waiting"];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${s.bg} ${s.text} ${s.border} whitespace-nowrap`}>
      {status}
    </span>
  );
}

function ServiceBadge({ serviceLine }: { serviceLine: ServiceLine }) {
  const cfg = SERVICE_CONFIG[serviceLine];
  const Icon = cfg.Icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${cfg.badgeBg} ${cfg.badgeText} whitespace-nowrap`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// ENCOUNTER CARD
// ─────────────────────────────────────────────────────────────
function EncounterCard({ enc, index }: { enc: ReturnType<typeof getAllEncountersWithPatients>[number]; index: number }) {
  const triage = TRIAGE[enc.triage_level as keyof typeof TRIAGE] ?? TRIAGE[3];
  const findings = computeClinicalAlerts(enc.vitals, enc.labs ?? []);
  const svc = SERVICE_CONFIG[enc.serviceLine];
  const statusStyle = STATUS_STYLE[enc.journeyStatus];

  const hasCritical = findings.some(f => f.severity === "critical");
  const ringClass = hasCritical ? "ring-1 ring-[#CE3E39]/30" : "";

  return (
    <div className={`bg-white rounded-xl border border-[#E0DEDC] border-l-4 ${triage.border} overflow-hidden hover:shadow-md transition-all duration-150 ${ringClass}`}>
      {/* Card header */}
      <div className="px-4 pt-4 pb-3">
        {/* Row 1: queue number + name + triage badge */}
        <div className="flex items-start gap-3 mb-2">
          <div className={`flex-shrink-0 w-9 h-9 rounded-full ${triage.bg} flex flex-col items-center justify-center`}>
            <span className="text-[8px] text-white/60 leading-none">#</span>
            <span className="text-sm font-bold text-white leading-none">{index + 1}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-0.5">
              <Link
                to={`/encounter/${enc.encounter_id}`}
                className="font-semibold text-[#2D2D2D] hover:text-[#013366] text-sm truncate leading-tight transition-colors"
              >
                {enc.patient?.first_name} {enc.patient?.last_name}
              </Link>
              <span className={`flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${triage.bg} ${triage.text}`}>
                CTAS {enc.triage_level} · {triage.short}
              </span>
            </div>
            {/* Chief complaint */}
            <p className="text-xs text-[#474543] leading-snug line-clamp-2">{enc.chief_complaint}</p>
          </div>
        </div>

        {/* Row 2: meta info */}
        <div className="flex items-center gap-1.5 flex-wrap mt-1 ml-12">
          <span className="text-[11px] text-[#9F9D9C]">{enc.patient?.age}y · {enc.patient?.sex}</span>
          <span className="text-[#DCDCDC]">·</span>
          <span className="text-[11px] text-[#9F9D9C]">Arrived {format(new Date(enc.encounter_date), "h:mm a")}</span>
          <span className="text-[#DCDCDC]">·</span>
          <span className={`text-[11px] font-semibold ${statusStyle.text}`}>{enc.journeyStatus}</span>
        </div>
      </div>

      {/* Clinical alerts */}
      <div className="px-4 py-2.5 border-t border-[#F0EEEC]">
        <p className="text-[10px] font-bold text-[#9F9D9C] uppercase tracking-widest mb-1.5">Clinical Alerts</p>
        <div className="flex flex-wrap gap-1">
          {findings.map((f, i) => {
            const Icon = FINDING_ICON[f.severity];
            return (
              <span key={i} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${FINDING_CHIP_STYLE[f.severity]}`}>
                <Icon className="w-2.5 h-2.5 flex-shrink-0" />
                {f.label}
              </span>
            );
          })}
        </div>
      </div>

      {/* Service line + attending */}
      <div className="px-4 py-2 bg-[#FAFAF9] border-t border-[#F0EEEC] flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <svc.Icon className="w-3 h-3 flex-shrink-0" style={{ color: svc.color }} />
          <span className="text-[11px] text-[#474543]">{svc.label}</span>
        </div>
        <span className="text-[11px] text-[#9F9D9C] truncate">{enc.attending_physician}</span>
      </div>

      {/* CTA */}
      <div className="border-t border-[#E0DEDC]">
        <Link
          to={`/encounter/${enc.encounter_id}`}
          className="flex items-center justify-center gap-1.5 w-full py-2.5 text-[#013366] hover:bg-[#013366] hover:text-white text-xs font-semibold transition-colors group"
        >
          Open Encounter
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// RISK GROUP SECTION
// ─────────────────────────────────────────────────────────────
function RiskGroupSection({
  encounters,
  visible,
  onToggle,
}: {
  encounters: ReturnType<typeof getAllEncountersWithPatients>;
  visible: boolean;
  onToggle: () => void;
}) {
  const critical = encounters.filter(e => e.triage_level <= 2);
  const moderate = encounters.filter(e => e.triage_level === 3);
  const low      = encounters.filter(e => e.triage_level >= 4);

  const groups = [
    { key: "critical", title: "Critical Risk",  subtitle: "CTAS 1–2", list: critical, triage: TRIAGE[2] },
    { key: "moderate", title: "Moderate Risk",  subtitle: "CTAS 3",   list: moderate, triage: TRIAGE[3] },
    { key: "low",      title: "Low Risk",       subtitle: "CTAS 4–5", list: low,      triage: TRIAGE[5] },
  ];

  return (
    <section className="mb-8">
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-bold text-[#2D2D2D]">Active Encounters by Risk</h2>
          <p className="text-xs text-[#9F9D9C]">Grouped by CTAS triage level · {encounters.length} total encounters</p>
        </div>
        <button
          onClick={onToggle}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#D8D8D8] bg-white text-xs font-semibold text-[#474543] hover:bg-[#F5F5F5] hover:border-[#9F9D9C] transition-colors"
        >
          {visible ? <><ChevronUp className="w-3.5 h-3.5" />Hide</> : <><ChevronDown className="w-3.5 h-3.5" />Show</>}
        </button>
      </div>

      {/* Collapsed summary bar */}
      {!visible && (
        <div className="flex items-center gap-5 px-5 py-3 bg-white rounded-xl border border-[#E0DEDC]">
          {groups.map(g => (
            <div key={g.key} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: g.triage.dot }} />
              <span className="text-sm font-bold text-[#2D2D2D]">{g.list.length}</span>
              <span className="text-xs text-[#9F9D9C]">{g.title}</span>
            </div>
          ))}
        </div>
      )}

      {/* Expanded columns */}
      {visible && (
        <div className="grid grid-cols-3 gap-5">
          {groups.map(g => (
            <div key={g.key}>
              {/* Column header */}
              <div className={`mb-3 px-4 py-3 rounded-xl ${g.triage.lightBg} border-l-4 ${g.triage.border} flex items-center justify-between`}>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${g.triage.bg} ${g.triage.text}`}>{g.subtitle}</span>
                    <span className="text-sm font-bold text-[#2D2D2D]">{g.title}</span>
                  </div>
                  <p className="text-[11px] text-[#9F9D9C] mt-0.5">Target wait: <span className="font-semibold text-[#474543]">{g.triage.target}</span></p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-[#2D2D2D] leading-none">{g.list.length}</p>
                  <p className="text-[11px] text-[#9F9D9C]">{g.list.length === 1 ? "patient" : "patients"}</p>
                </div>
              </div>

              {/* Cards */}
              <div className="space-y-3">
                {g.list.length === 0 ? (
                  <div className="text-center py-8 text-sm text-[#9F9D9C] bg-white rounded-xl border border-dashed border-[#E0DEDC]">
                    No patients
                  </div>
                ) : (
                  g.list.map((enc, i) => <EncounterCard key={enc.encounter_id} enc={enc} index={i + 1} />)
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// SERVICE QUEUE SECTION
// ─────────────────────────────────────────────────────────────
function ServiceQueueSection({
  encounters,
  selectedService,
  onSelectService,
}: {
  encounters: ReturnType<typeof getAllEncountersWithPatients>;
  selectedService: ServiceLine | null;
  onSelectService: (s: ServiceLine | null) => void;
}) {
  const serviceLines: ServiceLine[] = ["doctor", "blood-work", "imaging", "pharmacy"];

  const stats = useMemo(() => {
    return serviceLines.reduce((acc, sl) => {
      const inService = encounters.filter(e => e.serviceLine === sl);
      const active = inService.filter(e => e.journeyStatus === "In Progress").length;
      const waiting = inService.length - active;
      const waits = inService.map(e => e.estimatedWaitMinutes).filter(w => w > 0);
      const avgWait = waits.length > 0 ? Math.round(waits.reduce((s, w) => s + w, 0) / waits.length) : 0;
      acc[sl] = { waiting, active, avgWait };
      return acc;
    }, {} as Record<ServiceLine, { waiting: number; active: number; avgWait: number }>);
  }, [encounters]);

  return (
    <section className="mb-6">
      <div className="mb-3">
        <h2 className="text-sm font-bold text-[#2D2D2D]">Service Queues</h2>
        <p className="text-xs text-[#9F9D9C]">Click a service to filter the patient queue below</p>
      </div>
      <div className="flex gap-4">
        {serviceLines.map(sl => (
          <ServiceCard
            key={sl}
            serviceLine={sl}
            waiting={stats[sl].waiting}
            active={stats[sl].active}
            avgWait={stats[sl].avgWait}
            isSelected={selectedService === sl}
            onClick={() => onSelectService(selectedService === sl ? null : sl)}
          />
        ))}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// PATIENT QUEUE TABLE
// ─────────────────────────────────────────────────────────────
const ALL_STATUSES: JourneyStatus[] = [
  "Waiting", "In Progress", "Awaiting Lab Results",
  "With Specialist", "Awaiting Medication", "Ready for Discharge",
];

function PatientQueueTable({
  encounters,
  selectedService,
  onClearService,
}: {
  encounters: ReturnType<typeof getAllEncountersWithPatients>;
  selectedService: ServiceLine | null;
  onClearService: () => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredSvc = selectedService
    ? encounters.filter(e => e.serviceLine === selectedService)
    : encounters;

  const filteredSearch = searchQuery.trim()
    ? filteredSvc.filter(e => {
        const name = `${e.patient?.first_name ?? ""} ${e.patient?.last_name ?? ""}`.toLowerCase();
        return name.includes(searchQuery.toLowerCase());
      })
    : filteredSvc;

  const filtered = statusFilter !== "all"
    ? filteredSearch.filter(e => e.journeyStatus === statusFilter)
    : filteredSearch;

  const titleLabel = selectedService ? SERVICE_CONFIG[selectedService].label : "All Services";
  const helperLabel = selectedService
    ? `Showing ${filtered.length} patient${filtered.length !== 1 ? "s" : ""} in ${SERVICE_CONFIG[selectedService].label}`
    : `Showing all ${filtered.length} active encounters`;

  return (
    <section>
      {/* Section header */}
      <div className="flex items-start justify-between mb-3 gap-4 flex-wrap">
        <div>
          <h2 className="text-sm font-bold text-[#2D2D2D]">Patient Queue — {titleLabel}</h2>
          <p className="text-xs text-[#9F9D9C]">{helperLabel}</p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Active filter chip */}
          {selectedService && (() => {
            const ChipIcon = SERVICE_CONFIG[selectedService].Icon;
            return (
              <div className="flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-full bg-[#013366] text-white text-xs font-semibold">
                <ChipIcon className="w-3 h-3" />
                {SERVICE_CONFIG[selectedService].label}
                <button
                  onClick={onClearService}
                  className="ml-0.5 w-4 h-4 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            );
          })()}

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9F9D9C]" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search patient..."
              className="pl-8 pr-3 py-1.5 rounded-lg border border-[#D8D8D8] bg-white text-xs text-[#2D2D2D] placeholder-[#ABABAB] focus:outline-none focus:border-[#013366] focus:ring-1 focus:ring-[#013366]/20 w-44 transition-all"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2">
                <X className="w-3 h-3 text-[#9F9D9C]" />
              </button>
            )}
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-[#D8D8D8] bg-white text-xs text-[#474543] focus:outline-none focus:border-[#013366] appearance-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#E0DEDC] overflow-hidden">
        {/* Table header */}
        <div className="grid gap-3 px-4 py-2.5 bg-[#F8F8F7] border-b border-[#E0DEDC] text-[10px] font-bold text-[#9F9D9C] uppercase tracking-widest"
          style={{ gridTemplateColumns: "40px 1fr 180px 90px 160px 90px" }}>
          <span>#</span>
          <span>Patient</span>
          <span>Service</span>
          <span>Est. Wait</span>
          <span>Status</span>
          <span className="text-right">Action</span>
        </div>

        {/* Rows */}
        <div className="divide-y divide-[#F0EEEC]">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-sm text-[#9F9D9C]">
              No encounters match your filters.
            </div>
          ) : (
            filtered.map((enc, index) => {
              const triage = TRIAGE[enc.triage_level as keyof typeof TRIAGE] ?? TRIAGE[3];
              const findings = computeClinicalAlerts(enc.vitals, enc.labs ?? []);
              const hasCritical = findings.some(f => f.severity === "critical");
              const rowBg = hasCritical ? "hover:bg-[#FEF2F2]/60" : "hover:bg-[#F8F8F8]";

              return (
                <div
                  key={enc.encounter_id}
                  className={`grid gap-3 px-4 py-3 items-center transition-colors ${rowBg}`}
                  style={{ gridTemplateColumns: "40px 1fr 180px 90px 160px 90px" }}
                >
                  {/* Position */}
                  <div className={`w-7 h-7 rounded-full ${triage.bg} flex flex-col items-center justify-center flex-shrink-0`}>
                    <span className="text-[9px] font-bold text-white leading-none">{index + 1}</span>
                  </div>

                  {/* Patient */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Link to={`/encounter/${enc.encounter_id}`} className="font-semibold text-[#2D2D2D] text-sm hover:text-[#013366] transition-colors">
                        {enc.patient?.first_name} {enc.patient?.last_name}
                      </Link>
                      {hasCritical && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-[#CE3E39]">
                          <AlertCircle className="w-3 h-3" /> Critical
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#9F9D9C] truncate mt-0.5">
                      {enc.patient?.age}y · {enc.patient?.sex} · {enc.chief_complaint}
                    </p>
                  </div>

                  {/* Service */}
                  <div><ServiceBadge serviceLine={enc.serviceLine} /></div>

                  {/* Est. Wait */}
                  <div>
                    {enc.journeyStatus === "In Progress" ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#013366]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#013366] animate-pulse" />
                        Now
                      </span>
                    ) : (
                      <span className="text-sm font-semibold text-[#2D2D2D] tabular-nums">
                        {enc.estimatedWaitMinutes}
                        <span className="text-[11px] text-[#9F9D9C] font-normal ml-0.5">min</span>
                      </span>
                    )}
                  </div>

                  {/* Status */}
                  <div><StatusPill status={enc.journeyStatus} /></div>

                  {/* Action */}
                  <div className="flex justify-end">
                    <Link
                      to={`/encounter/${enc.encounter_id}`}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#013366] text-white text-[11px] font-semibold hover:bg-[#1E5189] transition-colors whitespace-nowrap"
                    >
                      Open
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// SERVICE CARD
// ─────────────────────────────────────────────────────────────
function ServiceCard({
  serviceLine,
  waiting,
  active,
  avgWait,
  isSelected,
  onClick,
}: {
  serviceLine: ServiceLine;
  waiting: number;
  active: number;
  avgWait: number;
  isSelected: boolean;
  onClick: () => void;
}) {
  const cfg = SERVICE_CONFIG[serviceLine];
  const Icon = cfg.Icon;

  return (
    <button
      onClick={onClick}
      className={`flex-1 min-w-0 text-left rounded-xl border transition-all duration-150 p-4 group ${
        isSelected
          ? "bg-[#013366] border-[#013366] shadow-md"
          : "bg-white border-[#E0DEDC] hover:border-[#9F9D9C] hover:shadow-sm"
      }`}
    >
      {/* Icon + label */}
      <div className="flex items-center gap-2.5 mb-3">
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isSelected ? "bg-white/20" : ""}`}
          style={isSelected ? {} : { backgroundColor: cfg.lightBg }}
        >
          <Icon className="w-4 h-4" style={{ color: isSelected ? "white" : cfg.color }} />
        </div>
        <span className={`text-sm font-semibold leading-tight ${isSelected ? "text-white" : "text-[#2D2D2D]"}`}>
          {cfg.label}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div>
          <p className={`text-xl font-bold tabular-nums leading-none ${isSelected ? "text-white" : "text-[#2D2D2D]"}`}>{waiting}</p>
          <p className={`text-[10px] mt-0.5 ${isSelected ? "text-white/70" : "text-[#9F9D9C]"}`}>Waiting</p>
        </div>
        <div>
          <p className={`text-xl font-bold tabular-nums leading-none ${isSelected ? "text-[#7DD3FC]" : "text-[#013366]"}`}>{active}</p>
          <p className={`text-[10px] mt-0.5 ${isSelected ? "text-white/70" : "text-[#9F9D9C]"}`}>Active</p>
        </div>
        <div>
          <p className={`text-xl font-bold tabular-nums leading-none ${isSelected ? "text-white" : "text-[#2D2D2D]"}`}>{avgWait}<span className={`text-xs font-normal ml-0.5 ${isSelected ? "text-white/70" : "text-[#9F9D9C]"}`}>m</span></p>
          <p className={`text-[10px] mt-0.5 ${isSelected ? "text-white/70" : "text-[#9F9D9C]"}`}>Avg wait</p>
        </div>
      </div>

      {isSelected && (
        <div className="mt-3 pt-2.5 border-t border-white/20">
          <p className="text-[11px] text-white/80 font-medium">Filtering queue below ↓</p>
        </div>
      )}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// COMBINED SIDEBAR  (nav + operational context in one panel)
// ────────────────────────────────────────────────────────────
function Sidebar({
  totalEncounters,
  encounters,
}: {
  totalEncounters: number;
  encounters: ReturnType<typeof getAllEncountersWithPatients>;
}) {
  const location  = useLocation();
  const isQueue    = location.pathname === "/queue";
  const isDashboard = location.pathname === "/dashboard";
  const isWaiting  = location.pathname === "/waiting";

  const primaryNav = [
    { to: "/dashboard", label: "Dashboard",       Icon: LayoutDashboard, active: isDashboard, badge: null },
    { to: "/queue",    label: "Full Queue",       Icon: ClipboardList,   active: isQueue,     badge: totalEncounters },
    { to: "/waiting",  label: "Patient View",     Icon: Users,           active: isWaiting,   badge: null, preview: true },
  ];

  const staff = [
    { label: "Doctors", Icon: UserCheck, color: "#7DD3FC", avail: 8,  total: 12 },
    { label: "Nurses",  Icon: Users,     color: "#93C5FD", avail: 15, total: 20 },
    { label: "Support", Icon: Users,     color: "#CBD5E1", avail: 6,  total: 8  },
  ];
  const totalAvail = staff.reduce((s, r) => s + r.avail, 0);
  const totalAll   = staff.reduce((s, r) => s + r.total, 0);

  const criticalCount = encounters.filter(e => e.triage_level <= 2).length;

  // Compute real avg wait by triage group
  const criticalEncs = encounters.filter(e => e.triage_level <= 2);
  const urgentEncs = encounters.filter(e => e.triage_level === 3);
  const lowEncs = encounters.filter(e => e.triage_level >= 4);

  const avgOf = (list: typeof encounters) => {
    const waits = list.map(e => e.estimatedWaitMinutes).filter(w => w > 0);
    return waits.length > 0 ? Math.round(waits.reduce((s, w) => s + w, 0) / waits.length) : 0;
  };

  const allAvgWait = avgOf(encounters);
  const criticalAvgWait = avgOf(criticalEncs);
  const urgentAvgWait = avgOf(urgentEncs);
  const lowAvgWait = avgOf(lowEncs);

  const waitRows = [
    { label: "Critical (CTAS 1–2)", wait: criticalAvgWait > 0 ? `${criticalAvgWait} min` : "< 5 min", dot: "#F87171" },
    { label: "Urgent (CTAS 3)",     wait: `${urgentAvgWait} min`,  dot: "#FCD34D" },
    { label: "Low risk (CTAS 4–5)", wait: `${lowAvgWait} min`,  dot: "#93C5FD" },
  ];

  return (
    <aside className="w-72 bg-[#013366] flex flex-col flex-shrink-0 overflow-y-auto">

      {/* ── Brand ── */}
      <div className="px-5 pt-5 pb-4 flex items-center justify-between border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
            <Activity className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest leading-none mb-0.5">BC Care</p>
            <p className="text-sm font-bold text-white leading-none">Worker Portal</p>
          </div>
        </div>
        <button className="relative w-8 h-8 flex items-center justify-center rounded-lg text-white/50 hover:bg-white/10 hover:text-white transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#CE3E39] rounded-full" />
        </button>
      </div>

      {/* ── Navigation ── */}
      <nav className="px-3 py-4 border-b border-white/10 flex-shrink-0 space-y-0.5">
        <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest px-3 mb-2">Navigation</p>
        {primaryNav.map(item => (
          <Link
            key={item.to}
            to={item.to}
            className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
              item.active
                ? "bg-white/15 text-white"
                : "text-white/55 hover:bg-white/10 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <item.Icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </div>
            {item.badge !== null && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${item.active ? "bg-white/20 text-white" : "bg-white/10 text-white/55"}`}>
                {item.badge}
              </span>
            )}
          </Link>
        ))}
      </nav>

      {/* ── Critical alert ── */}
      {criticalCount > 0 && (
        <div className="mx-4 mt-4 px-3 py-2.5 rounded-lg bg-[#CE3E39] flex items-center gap-2.5 flex-shrink-0">
          <AlertCircle className="w-4 h-4 text-white flex-shrink-0" />
          <div>
            <p className="text-xs font-bold text-white">{criticalCount} Critical Patient{criticalCount > 1 ? "s" : ""}</p>
            <p className="text-[11px] text-white/80">Immediate attention required</p>
          </div>
        </div>
      )}

      {/* ── Average wait time ── */}
      <div className="px-5 py-5 border-b border-white/10 flex-shrink-0">
        <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest mb-3">Avg. Wait Time</p>
        <div className="flex items-end justify-between gap-2 mb-4">
          <div>
            <p className="text-4xl font-bold text-white tabular-nums leading-none">
              {allAvgWait}<span className="text-base font-semibold text-white/50 ml-1">min</span>
            </p>
            <div className="flex items-center gap-1 mt-1.5">
              <TrendingDown className="w-3.5 h-3.5 text-[#34D399]" />
              <span className="text-xs font-semibold text-[#34D399]">Within target</span>
            </div>
          </div>
          <svg viewBox="0 0 60 26" className="w-16 h-7 flex-shrink-0 opacity-80">
            <polyline points="0,22 10,18 20,15 30,12 40,8 50,5 60,3" fill="none" stroke="#34D399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="60" cy="3" r="2.5" fill="#34D399" />
          </svg>
        </div>

        <div className="space-y-1.5">
          {waitRows.map(row => (
            <div key={row.label} className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: row.dot }} />
                <span className="text-[11px] text-white/55">{row.label}</span>
              </div>
              <span className="text-[11px] font-semibold text-white/80 tabular-nums">{row.wait}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Staff on shift ── */}
      <div className="px-5 py-5 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Staff On Shift</p>
          <span className="text-[11px] font-bold text-white/80">
            {totalAvail}<span className="text-white/40 font-normal"> / {totalAll}</span>
          </span>
        </div>

        <div className="space-y-3">
          {staff.map(s => (
            <div key={s.label}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <s.Icon className="w-3.5 h-3.5" style={{ color: s.color }} />
                  <span className="text-xs font-semibold text-white/70">{s.label}</span>
                </div>
                <span className="text-xs">
                  <span className="font-bold text-white/90">{s.avail}</span>
                  <span className="text-white/40"> / {s.total}</span>
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${(s.avail / s.total) * 100}%`, backgroundColor: s.color }} />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between px-3 py-2.5 rounded-lg bg-white/10">
          <span className="text-xs text-white/55">Patient : Staff ratio</span>
          <span className="text-xs font-bold text-white/80">{encounters.length} : {totalAvail}</span>
        </div>
      </div>

      {/* ── User + settings (pinned bottom) ── */}
      <div className="mt-auto border-t border-white/10 px-3 py-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2.5 flex-1 min-w-0 px-3 py-2.5 rounded-lg bg-white/10">
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <span className="text-[10px] font-bold text-white">JD</span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">J. Davidson RN</p>
              <p className="text-[10px] text-white/40">Emergency Dept.</p>
            </div>
          </div>
          <button className="w-9 h-9 flex items-center justify-center rounded-lg text-white/50 hover:bg-white/10 hover:text-white transition-colors flex-shrink-0">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

// ─────────────────────────────────────────────────────────────
// ROOT COMPONENT
// ─────────────────────────────────────────────────────────────
export default function EncounterQueue() {
  const [showRiskGroups, setShowRiskGroups] = useState(true);
  const [selectedService, setSelectedService] = useState<ServiceLine | null>(null);

  const encounters = useMemo(() => getAllEncountersWithPatients(), []);
  const lastUpdated = format(new Date(), "h:mm a");

  return (
    <div className="flex h-screen overflow-hidden">
      {/* ── Single combined sidebar ── */}
      <Sidebar totalEncounters={encounters.length} encounters={encounters} />

      {/* ── Main content (full remaining width) ── */}
      <div className="flex-1 overflow-y-auto bg-[#F2F4F7]">
        <div className="max-w-[1200px] mx-auto px-6 py-6">

          {/* ── Header ── */}
          <header className="mb-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl text-[#474543] leading-snug">
                  Good morning —{" "}
                  <span className="font-bold text-[#2D2D2D]">{encounters.length} active encounters</span>{" "}
                  need attention.
                </h1>
                <p className="text-sm text-[#9F9D9C] mt-0.5">
                  Sorted by clinical priority · CTAS triage scale · {format(new Date(), "EEEE, MMMM d, yyyy")}
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-[#ABABAB] flex-shrink-0 mt-1">
                <RefreshCw className="w-3 h-3" />
                Last updated {lastUpdated}
              </div>
            </div>

            {/* Quick triage summary bar */}
            <div className="mt-4 flex items-center gap-1 p-1 bg-white rounded-xl border border-[#E0DEDC] w-fit">
              {([1,2,3,4,5] as const).map(level => {
                const t = TRIAGE[level];
                const count = encounters.filter(e => e.triage_level === level).length;
                if (count === 0) return null;
                return (
                  <div key={level} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${t.bg}`}>
                    <span className="text-[10px] font-bold text-white/80">CTAS {level}</span>
                    <span className="text-sm font-bold text-white tabular-nums">{count}</span>
                    <span className="text-[10px] text-white/70 hidden sm:inline">{t.short}</span>
                  </div>
                );
              })}
            </div>
          </header>

          {/* ── Risk groups ── */}
          <RiskGroupSection
            encounters={encounters}
            visible={showRiskGroups}
            onToggle={() => setShowRiskGroups(v => !v)}
          />

          {/* ── Service queue cards ── */}
          <ServiceQueueSection
            encounters={encounters}
            selectedService={selectedService}
            onSelectService={setSelectedService}
          />

          <div className="h-8" />
        </div>
      </div>
    </div>
  );
}