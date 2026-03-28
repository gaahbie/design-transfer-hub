import { Link } from "react-router-dom";
import { getAllEncountersWithPatients, type ServiceLine, type JourneyStatus } from "@/data/mockData";
import { format } from "date-fns";
import { useState, useMemo } from "react";
import {
  Heart,
  Droplets,
  Thermometer,
  Clock,
  ChevronLeft,
  CheckCircle2,
  Activity,
  Wind,
  Stethoscope,
  FlaskConical,
  Scan,
  Pill,
  X,
  Search,
  ChevronDown,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";

const triageConfig: Record<number, { shortLabel: string; bgColor: string; lightBg: string; borderColor: string }> = {
  1: { shortLabel: "Resus", bgColor: "bg-[#7B0D1E]", lightBg: "bg-[#FEF2F2]", borderColor: "border-l-[#7B0D1E]" },
  2: { shortLabel: "Emergent", bgColor: "bg-[#CE3E39]", lightBg: "bg-[#FEF2F2]", borderColor: "border-l-[#CE3E39]" },
  3: { shortLabel: "Urgent", bgColor: "bg-[#D97706]", lightBg: "bg-[#FFFBEB]", borderColor: "border-l-[#D97706]" },
  4: { shortLabel: "Less Urgent", bgColor: "bg-[#255A90]", lightBg: "bg-[#EFF6FF]", borderColor: "border-l-[#255A90]" },
  5: { shortLabel: "Non-Urgent", bgColor: "bg-[#474543]", lightBg: "bg-[#F5F5F5]", borderColor: "border-l-[#474543]" },
};

type VitalStatus = "critical" | "borderline" | "normal";

const getVitalStatus = (type: string, value: number): VitalStatus => {
  switch (type) {
    case "hr": return value < 50 || value > 130 ? "critical" : value < 60 || value > 100 ? "borderline" : "normal";
    case "spo2": return value < 90 ? "critical" : value < 95 ? "borderline" : "normal";
    case "temp": return value > 39.5 || value < 35 ? "critical" : value > 38.0 || value < 36.0 ? "borderline" : "normal";
    case "sbp": return value > 180 || value < 80 ? "critical" : value > 140 || value < 90 ? "borderline" : "normal";
    case "rr": return value > 30 || value < 8 ? "critical" : value > 20 || value < 12 ? "borderline" : "normal";
    default: return "normal";
  }
};

const vitalValueColor: Record<VitalStatus, string> = {
  critical: "text-[#CE3E39]",
  borderline: "text-[#D97706]",
  normal: "text-[#2D2D2D]",
};
const vitalIconColor: Record<VitalStatus, string> = {
  critical: "text-[#CE3E39]",
  borderline: "text-[#D97706]",
  normal: "text-[#9F9D9C]",
};

const avatarColors = ["bg-[#013366]", "bg-[#255A90]", "bg-[#1E5189]", "bg-[#474543]", "bg-[#2D2D2D]", "bg-[#01264C]"];
const getInitials = (f: string, l: string) => `${f[0]}${l[0]}`;

const journeyStatuses: JourneyStatus[] = [
  "In Progress", "Waiting", "Awaiting Lab Results",
  "With Specialist", "Ready for Discharge",
  "Awaiting Medication", "In Triage",
];

const ALL_JOURNEY_STATUSES: JourneyStatus[] = [
  "Waiting",
  "In Progress",
  "Awaiting Lab Results",
  "With Specialist",
  "Ready for Discharge",
  "In Triage",
  "Awaiting Medication",
];

const STATUS_STYLE: Record<JourneyStatus, { bg: string; text: string; border: string }> = {
  "Waiting":              { bg: "bg-[#F5F5F5]",  text: "text-[#474543]",  border: "border-[#D8D8D8]" },
  "In Progress":          { bg: "bg-[#EFF6FF]",  text: "text-[#013366]",  border: "border-[#BFDBFE]" },
  "Awaiting Lab Results": { bg: "bg-[#FFFBEB]",  text: "text-[#92400E]",  border: "border-[#FDE68A]" },
  "With Specialist":      { bg: "bg-[#F0F4FA]",  text: "text-[#1E5189]",  border: "border-[#BFDBFE]" },
  "Ready for Discharge":  { bg: "bg-[#F0FDF4]",  text: "text-[#166534]",  border: "border-[#BBF7D0]" },
  "In Triage":            { bg: "bg-[#F5F5F5]",  text: "text-[#2D2D2D]",  border: "border-[#D8D8D8]" },
  "Awaiting Medication":  { bg: "bg-[#FFF7ED]",  text: "text-[#9A3412]",  border: "border-[#FED7AA]" },
};

const SERVICE_CONFIG: Record<ServiceLine, { label: string; Icon: any; color: string; lightBg: string; badgeBg: string; badgeText: string }> = {
  "doctor":     { label: "Doctor Consultation",     Icon: Stethoscope,  color: "#013366", lightBg: "#EFF6FF", badgeBg: "bg-[#EFF6FF]", badgeText: "text-[#013366]" },
  "blood-work": { label: "Blood Work",              Icon: FlaskConical, color: "#CE3E39", lightBg: "#FEF2F2", badgeBg: "bg-[#FEF2F2]", badgeText: "text-[#CE3E39]" },
  "imaging":    { label: "X-Ray / Imaging",         Icon: Scan,         color: "#474543", lightBg: "#F5F5F5", badgeBg: "bg-[#F5F5F5]", badgeText: "text-[#474543]" },
  "pharmacy":   { label: "Pharmacy / Medication",   Icon: Pill,         color: "#255A90", lightBg: "#F0F4FA", badgeBg: "bg-[#F0F4FA]", badgeText: "text-[#255A90]" },
};

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

export default function FullQueue() {
  const [selectedService, setSelectedService] = useState<ServiceLine | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<JourneyStatus | null>(null);
  
  const encounters = getAllEncountersWithPatients();
  const sorted = [...encounters].sort((a, b) => {
    if (a.triage_level !== b.triage_level) return a.triage_level - b.triage_level;
    return new Date(a.encounter_date).getTime() - new Date(b.encounter_date).getTime()
  });

  // Apply all filters: service, search, and status
  const filtered = useMemo(() => {
    let result = sorted;

    // Filter by service
    if (selectedService) {
      result = result.filter(e => e.serviceLine === selectedService);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(e => {
        const fullName = `${e.patient?.first_name} ${e.patient?.last_name}`.toLowerCase();
        return fullName.includes(query) || e.chief_complaint.toLowerCase().includes(query);
      });
    }

    // Filter by status
    if (statusFilter) {
      result = result.filter(e => e.journeyStatus === statusFilter);
    }

    return result;
  }, [sorted, selectedService, searchQuery, statusFilter]);

  const criticalCount = filtered.filter(e => e.triage_level <= 2).length;
  const moderateCount = filtered.filter(e => e.triage_level === 3).length;
  const lowCount = filtered.filter(e => e.triage_level >= 4).length;

  // Service queue stats
  const serviceLines: ServiceLine[] = ["doctor", "blood-work", "imaging", "pharmacy"];
  const serviceStats = useMemo(() => {
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
    <div className="min-h-screen bg-[#F5F5F5]">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link
            to="/dashboard"
            className="flex items-center gap-1.5 text-sm text-[#255A90] hover:text-[#013366] font-medium"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>

        <div className="flex items-end justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#2D2D2D]">
              Encounter Queue
            </h1>
            <p className="text-sm text-[#9F9D9C] mt-0.5">
              {sorted.length} active · Ordered by clinical priority · {format(new Date(), "EEEE MMMM d")}
            </p>
          </div>
          {/* Summary pills */}
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FEF2F2] text-sm font-semibold text-[#CE3E39]">
              <span className="w-2 h-2 rounded-full bg-[#CE3E39]" />
              {criticalCount} Critical
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FFFBEB] text-sm font-semibold text-[#D97706]">
              <span className="w-2 h-2 rounded-full bg-[#D97706]" />
              {moderateCount} Moderate
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F5F5F5] text-sm font-semibold text-[#474543]">
              <span className="w-2 h-2 rounded-full bg-[#474543]" />
              {lowCount} Low
            </span>
          </div>
        </div>

        {/* Search and Status Filter */}
        <div className="flex items-center gap-3 mb-6">
          {/* Search input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9F9D9C]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search patients by name or complaint..."
              className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-[#E0DEDC] bg-white text-sm text-[#2D2D2D] placeholder:text-[#9F9D9C] focus:outline-none focus:ring-2 focus:ring-[#255A90] focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9F9D9C] hover:text-[#2D2D2D]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Status filter dropdown */}
          <div className="relative">
            <select
              value={statusFilter || ""}
              onChange={(e) => setStatusFilter(e.target.value ? e.target.value as JourneyStatus : null)}
              className="appearance-none pl-4 pr-10 py-2.5 rounded-lg border border-[#E0DEDC] bg-white text-sm text-[#2D2D2D] focus:outline-none focus:ring-2 focus:ring-[#255A90] focus:border-transparent cursor-pointer min-w-[200px]"
            >
              <option value="">All Statuses</option>
              {ALL_JOURNEY_STATUSES.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9F9D9C] pointer-events-none" />
          </div>
        </div>

        {/* Service Queues Section */}
        <section className="mb-6">
          <div className="mb-3">
            <h2 className="text-sm font-bold text-[#2D2D2D]">Service Queues</h2>
            <p className="text-xs text-[#9F9D9C]">Click a service to filter the queue below</p>
          </div>
          <div className="flex gap-4">
            {serviceLines.map(sl => (
              <ServiceCard
                key={sl}
                serviceLine={sl}
                waiting={serviceStats[sl].waiting}
                active={serviceStats[sl].active}
                avgWait={serviceStats[sl].avgWait}
                isSelected={selectedService === sl}
                onClick={() => setSelectedService(selectedService === sl ? null : sl)}
              />
            ))}
          </div>
        </section>

        {/* Active filter chip */}
        {selectedService && (
          <div className="mb-4 flex items-center gap-2">
            <span className="text-xs text-[#9F9D9C]">Filtering by:</span>
            <div className="flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-full bg-[#013366] text-white text-xs font-semibold">
              {(() => {
                const Icon = SERVICE_CONFIG[selectedService].Icon;
                return <Icon className="w-3 h-3" />;
              })()}
              {SERVICE_CONFIG[selectedService].label}
              <button
                onClick={() => setSelectedService(null)}
                className="ml-0.5 w-4 h-4 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
            <span className="text-xs text-[#474543] font-semibold">
              {filtered.length} patient{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>
        )}

        <Card className="overflow-hidden border-[#D8D8D8]">
          {/* Table header */}
          <div className="grid grid-cols-[48px_1fr_120px_200px_80px] gap-4 px-5 py-3 bg-[#F5F5F5] border-b border-[#E0DEDC]">
            <p className="text-[11px] font-bold text-[#9F9D9C] uppercase tracking-widest">#</p>
            <p className="text-[11px] font-bold text-[#9F9D9C] uppercase tracking-widest">Patient</p>
            <p className="text-[11px] font-bold text-[#9F9D9C] uppercase tracking-widest">Triage</p>
            <p className="text-[11px] font-bold text-[#9F9D9C] uppercase tracking-widest">Vitals</p>
            <p className="text-[11px] font-bold text-[#9F9D9C] uppercase tracking-widest text-right">Action</p>
          </div>

          <div className="divide-y divide-[#E0DEDC]">
            {filtered.map((encounter, idx) => {
              const pos = idx + 1;
              const triage = triageConfig[encounter.triage_level] ?? triageConfig[3];
              const vitals = encounter.vitals;
              const journeyStatus = journeyStatuses[idx % journeyStatuses.length];
              const isActive = idx === 0;

              const hrS = vitals ? getVitalStatus("hr", vitals.heart_rate) : "normal";
              const spo2S = vitals ? getVitalStatus("spo2", vitals.o2_saturation) : "normal";
              const tempS = vitals ? getVitalStatus("temp", vitals.temperature_celsius) : "normal";
              const rrS = vitals ? getVitalStatus("rr", vitals.respiratory_rate) : "normal";
              const sbpS = vitals ? getVitalStatus("sbp", vitals.systolic_bp) : "normal";

              const allNormal = vitals
                ? [hrS, spo2S, tempS, rrS, sbpS].every(s => s === "normal")
                : true;

              return (
                <div
                  key={encounter.encounter_id}
                  className={`grid grid-cols-[48px_1fr_120px_200px_80px] gap-4 items-center px-5 py-4 hover:bg-[#F8F8F8] transition-colors ${
                    isActive ? "bg-[#013366]/[0.03] border-l-4 border-l-[#013366]" : `border-l-4 ${triage.borderColor}`
                  }`}
                >
                  {/* Position */}
                  <div className={`w-8 h-8 rounded-full ${triage.bgColor} flex flex-col items-center justify-center flex-shrink-0`}>
                    <span className="text-[7px] text-white/60 leading-none">#</span>
                    <span className="text-xs font-bold text-white leading-none">{pos}</span>
                  </div>

                  {/* Patient */}
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className={`flex-shrink-0 ${avatarColors[idx % avatarColors.length]}`} style={{ width: 36, height: 36 }}>
                      <AvatarFallback className="text-white text-xs font-semibold">
                        {encounter.patient && getInitials(encounter.patient.first_name, encounter.patient.last_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/encounter/${encounter.encounter_id}`}
                          className="font-semibold text-[#2D2D2D] hover:text-[#013366] text-sm truncate"
                        >
                          {encounter.patient?.first_name} {encounter.patient?.last_name}
                        </Link>
                        {isActive && (
                          <span className="flex-shrink-0 inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#013366] text-white">
                            <Clock className="w-2.5 h-2.5" />
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#9F9D9C] truncate">{encounter.chief_complaint}</p>
                      <p className="text-[11px] text-[#474543] italic">{journeyStatus}</p>
                    </div>
                  </div>

                  {/* Triage */}
                  <div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold text-white ${triage.bgColor}`}>
                      L{encounter.triage_level} · {triage.shortLabel}
                    </span>
                    <p className="text-[10px] text-[#9F9D9C] mt-1">
                      {format(new Date(encounter.encounter_date), "h:mm a")}
                    </p>
                  </div>

                  {/* Vitals */}
                  <div>
                    {vitals ? (
                      allNormal ? (
                        <div className="flex items-center gap-1 text-[#10B981]">
                          <CheckCircle2 className="w-3 h-3" />
                          <span className="text-[11px] font-medium">All normal</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="flex items-center gap-1">
                            <Heart className={`w-3 h-3 ${vitalIconColor[hrS]}`} />
                            <span className={`text-xs font-semibold tabular-nums ${vitalValueColor[hrS]}`}>{vitals.heart_rate}</span>
                            <span className="text-[10px] text-[#ABABAB]">bpm</span>
                          </div>
                          <span className="text-[#DCDCDC]">·</span>
                          <div className="flex items-center gap-1">
                            <Droplets className={`w-3 h-3 ${vitalIconColor[spo2S]}`} />
                            <span className={`text-xs font-semibold tabular-nums ${vitalValueColor[spo2S]}`}>{vitals.o2_saturation}%</span>
                          </div>
                          <span className="text-[#DCDCDC]">·</span>
                          <div className="flex items-center gap-1">
                            <Thermometer className={`w-3 h-3 ${vitalIconColor[tempS]}`} />
                            <span className={`text-xs font-semibold tabular-nums ${vitalValueColor[tempS]}`}>{vitals.temperature_celsius}°</span>
                          </div>
                        </div>
                      )
                    ) : (
                      <span className="text-[11px] text-[#9F9D9C]">No vitals</span>
                    )}
                  </div>

                  {/* Action */}
                  <div className="text-right">
                    <Link
                      to={`/encounter/${encounter.encounter_id}`}
                      className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#013366] text-white hover:bg-[#1E5189] transition-colors"
                    >
                      Open
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}