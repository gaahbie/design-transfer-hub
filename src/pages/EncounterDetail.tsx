import { useParams, Link } from "react-router-dom";
import { getEncounterWithPatient } from "@/data/mockData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  AlertCircle,
  Activity,
  Thermometer,
  Heart,
  Wind,
  Droplets,
  User,
  Calendar,
  MapPin,
  Stethoscope,
  Clock,
  AlertTriangle,
  Pill,
  FileText,
  Shield,
} from "lucide-react";
import { format } from "date-fns";

export default function EncounterDetail() {
  const { encounterId } = useParams<{ encounterId: string }>();

  if (!encounterId) {
    return <div className="p-6 text-muted-foreground">Encounter not found</div>;
  }

  const data = getEncounterWithPatient(encounterId);

  if (!data) {
    return <div className="p-6 text-muted-foreground">Encounter not found</div>;
  }

  const { encounter, patient, vitals, labs, medications, allergies } = data;

  // Calculate clinical alerts
  const abnormalLabs = labs.filter((lab) => lab.abnormal_flag);
  const abnormalVitals: { name: string; value: string; severity: string; message: string }[] = [];

  if (vitals) {
    if (vitals.o2_saturation < 95) {
      abnormalVitals.push({
        name: "Oxygen Saturation",
        value: `${vitals.o2_saturation}%`,
        severity: vitals.o2_saturation < 90 ? "critical" : "warning",
        message: "Below expected range",
      });
    }
    if (vitals.systolic_bp > 140 || vitals.diastolic_bp > 90) {
      abnormalVitals.push({
        name: "Blood Pressure",
        value: `${vitals.systolic_bp}/${vitals.diastolic_bp} mm Hg`,
        severity: vitals.systolic_bp > 160 ? "critical" : "warning",
        message: "Above expected range",
      });
    }
    if (vitals.heart_rate > 100) {
      abnormalVitals.push({
        name: "Heart Rate",
        value: `${vitals.heart_rate} bpm`,
        severity: vitals.heart_rate > 120 ? "critical" : "warning",
        message: "Elevated",
      });
    }
    if (vitals.temperature_celsius > 38.0) {
      abnormalVitals.push({
        name: "Temperature",
        value: `${vitals.temperature_celsius}°C`,
        severity: vitals.temperature_celsius > 39.0 ? "critical" : "warning",
        message: "Elevated",
      });
    }
    if (vitals.pain_scale > 7) {
      abnormalVitals.push({
        name: "Pain Scale",
        value: `${vitals.pain_scale}/10`,
        severity: "warning",
        message: "High pain level reported",
      });
    }
  }

  const hasClinicalAlerts = abnormalLabs.length > 0 || abnormalVitals.length > 0;

  const triageBadge =
    encounter.triage_level <= 2
      ? "bg-[var(--status-critical-bg)] text-[var(--status-critical)] border-[var(--status-critical-border)]"
      : encounter.triage_level === 3
      ? "bg-[var(--status-warning-bg)] text-[var(--status-warning)] border-[var(--status-warning-border)]"
      : "bg-[var(--status-success-bg)] text-[var(--status-success)] border-[var(--status-success-border)]";

  return (
    <div className="min-h-screen bg-background">
      {/* ── Sticky header ── */}
      <div className="bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold">
                {patient?.first_name} {patient?.last_name}
              </h1>
              <div className="flex items-center gap-3 text-sm text-primary-foreground/70">
                <span>{patient?.age}y</span>
                <span>•</span>
                <span>{patient?.sex}</span>
                <span>•</span>
                <span>{patient?.blood_type}</span>
                <span>•</span>
                <span className="font-mono text-primary-foreground/50">{encounter.encounter_id}</span>
              </div>
            </div>
          </div>
          <Badge className={triageBadge}>CTAS {encounter.triage_level}</Badge>
        </div>
      </div>

      {/* ── Allergy Banner ── */}
      {allergies.length > 0 && (
        <div className="bg-[var(--status-critical-bg)] border-b-2 border-[var(--status-critical)]">
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-3">
            <div className="flex items-center gap-2 flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-[var(--status-critical)]" />
              <span className="text-sm font-bold text-[var(--status-critical)] uppercase tracking-wide">Allergies</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {allergies.map((a) => (
                <Badge
                  key={a.allergy_id}
                  variant="outline"
                  className={
                    a.severity === 'severe'
                      ? 'bg-[var(--status-critical)] text-white border-[var(--status-critical)]'
                      : a.severity === 'moderate'
                      ? 'bg-[var(--status-warning-bg)] text-[var(--status-warning)] border-[var(--status-warning-border)]'
                      : 'bg-muted text-foreground border-border'
                  }
                >
                  {a.allergen} — {a.reaction}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}
      {allergies.length === 0 && (
        <div className="bg-[var(--status-success-bg)] border-b border-[var(--status-success-border)]">
          <div className="max-w-7xl mx-auto px-6 py-2 flex items-center gap-2">
            <Shield className="w-4 h-4 text-[var(--status-success)]" />
            <span className="text-sm font-medium text-[var(--status-success)]">No Known Allergies (NKA)</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ════════════ Left Column ════════════ */}
          <div className="lg:col-span-2 space-y-6">
            {/* ── Encounter Summary ── */}
            <Card className="overflow-hidden">
              <div className="bg-[var(--status-info-bg)] px-6 py-3 flex items-center gap-2 border-b border-[var(--status-info-border)]">
                <Stethoscope className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-bold text-primary">Encounter Summary</h2>
              </div>
              <div className="p-6 grid grid-cols-2 gap-x-6 gap-y-4">
                {[
                  { label: "Chief Complaint", value: encounter.chief_complaint, icon: AlertCircle },
                  {
                    label: "Diagnosis",
                    value: encounter.diagnosis_description,
                    sub: encounter.diagnosis_code,
                    icon: FileText,
                  },
                  { label: "Encounter Type", value: encounter.encounter_type, icon: Stethoscope },
                  { label: "Disposition", value: encounter.disposition, icon: Shield },
                  {
                    label: "Encounter Date",
                    value: format(new Date(encounter.encounter_date), "MMM d, yyyy 'at' HH:mm"),
                    icon: Calendar,
                  },
                  { label: "Length of Stay", value: `${encounter.length_of_stay_hours} hours`, icon: Clock },
                  { label: "Facility", value: encounter.facility, icon: MapPin },
                  { label: "Attending Physician", value: encounter.attending_physician, icon: User },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                      <item.icon className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                        {item.label}
                      </p>
                      <p className="text-sm font-semibold text-foreground">{item.value}</p>
                      {"sub" in item && item.sub && (
                        <p className="text-xs text-muted-foreground">{item.sub}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* ── Vitals ── */}
            {vitals && (
              <Card className="overflow-hidden">
                <div className="bg-[var(--status-success-bg)] px-6 py-3 flex items-center justify-between border-b border-[var(--status-success-border)]">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[var(--status-success)]" />
                    <h2 className="text-sm font-bold text-[var(--status-success)]">Current Vitals</h2>
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    Recorded {format(new Date(vitals.recorded_at), "MMM d 'at' HH:mm")}
                  </span>
                </div>

                <div className="p-6 grid grid-cols-2 md:grid-cols-3 gap-4">
                  {/* Heart Rate */}
                  <VitalCard
                    icon={Heart}
                    iconColor="text-destructive"
                    iconBg="bg-[var(--status-critical-bg)]"
                    label="Heart Rate"
                    value={String(vitals.heart_rate)}
                    unit="bpm"
                    alert={vitals.heart_rate > 100 ? "Above normal" : undefined}
                    alertType="critical"
                  />
                  {/* Blood Pressure */}
                  <VitalCard
                    icon={Activity}
                    iconColor="text-primary"
                    iconBg="bg-[var(--status-info-bg)]"
                    label="Blood Pressure"
                    value={`${vitals.systolic_bp}/${vitals.diastolic_bp}`}
                    unit="mm Hg"
                    alert={vitals.systolic_bp > 140 || vitals.diastolic_bp > 90 ? "Above normal" : undefined}
                    alertType="critical"
                  />
                  {/* Temperature */}
                  <VitalCard
                    icon={Thermometer}
                    iconColor="text-[var(--status-warning)]"
                    iconBg="bg-[var(--status-warning-bg)]"
                    label="Temperature"
                    value={String(vitals.temperature_celsius)}
                    unit="°C"
                    alert={vitals.temperature_celsius > 38.0 ? "Elevated" : undefined}
                    alertType="warning"
                  />
                  {/* Respiratory Rate */}
                  <VitalCard
                    icon={Wind}
                    iconColor="text-[var(--status-success)]"
                    iconBg="bg-[var(--status-success-bg)]"
                    label="Respiratory Rate"
                    value={String(vitals.respiratory_rate)}
                    unit="/min"
                  />
                  {/* SpO2 */}
                  <VitalCard
                    icon={Droplets}
                    iconColor="text-primary"
                    iconBg="bg-[var(--status-info-bg)]"
                    label="SpO2"
                    value={String(vitals.o2_saturation)}
                    unit="%"
                    alert={vitals.o2_saturation < 95 ? "Below normal" : undefined}
                    alertType="critical"
                  />
                  {/* Pain Scale */}
                  <VitalCard
                    icon={AlertCircle}
                    iconColor="text-muted-foreground"
                    iconBg="bg-muted"
                    label="Pain Scale"
                    value={String(vitals.pain_scale)}
                    unit="/10"
                    alert={vitals.pain_scale > 7 ? "High" : undefined}
                    alertType="warning"
                  />
                </div>
              </Card>
            )}

            {/* ── Lab Results ── */}
            <Card className="overflow-hidden">
              <div className="bg-accent px-6 py-3 flex items-center gap-2 border-b border-border">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <h2 className="text-sm font-bold text-foreground">Lab Results</h2>
              </div>

              <div className="p-6">
                {labs.length > 0 ? (
                  <div className="space-y-3">
                    {labs.map((lab) => (
                      <div
                        key={lab.lab_id}
                        className={`p-4 rounded-xl border ${
                          lab.abnormal_flag
                            ? "bg-[var(--status-critical-bg)] border-[var(--status-critical-border)]"
                            : "bg-muted border-border"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold text-foreground text-sm">{lab.test_name}</p>
                            <p className="text-xs text-muted-foreground">{lab.test_code}</p>
                          </div>
                          {lab.abnormal_flag && (
                            <Badge className="gap-1 bg-destructive text-destructive-foreground border-0">
                              <AlertTriangle className="w-3 h-3" />
                              Abnormal
                            </Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-xs text-muted-foreground">Value</p>
                            <p className="font-semibold text-foreground">
                              {lab.value} {lab.unit}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Reference Range</p>
                            <p className="font-semibold text-foreground">
                              {lab.reference_range_low} - {lab.reference_range_high}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Collected</p>
                            <p className="font-semibold text-foreground">
                              {format(new Date(lab.collected_date), "HH:mm")}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No lab results available</p>
                )}
              </div>
            </Card>
          </div>

          {/* ════════════ Right Column ════════════ */}
          <div className="space-y-6">
            {/* ── Clinical Alerts ── */}
            <Card className="overflow-hidden">
              <div
                className={`px-6 py-3 flex items-center gap-2 border-b ${
                  hasClinicalAlerts
                    ? "bg-[var(--status-critical-bg)] border-[var(--status-critical-border)]"
                    : "bg-[var(--status-success-bg)] border-[var(--status-success-border)]"
                }`}
              >
                <AlertTriangle
                  className={`w-4 h-4 ${hasClinicalAlerts ? "text-destructive" : "text-[var(--status-success)]"}`}
                />
                <h2
                  className={`text-sm font-bold ${
                    hasClinicalAlerts ? "text-destructive" : "text-[var(--status-success)]"
                  }`}
                >
                  Clinical Alerts
                  {hasClinicalAlerts && (
                    <span className="ml-2 px-1.5 py-0.5 rounded-full bg-destructive text-destructive-foreground text-[10px]">
                      {abnormalVitals.length + abnormalLabs.length}
                    </span>
                  )}
                </h2>
              </div>

              <div className="p-6">
                {hasClinicalAlerts ? (
                  <div className="space-y-3">
                    {abnormalVitals.map((vital, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl border ${
                          vital.severity === "critical"
                            ? "bg-[var(--status-critical-bg)] border-[var(--status-critical-border)]"
                            : "bg-[var(--status-warning-bg)] border-[var(--status-warning-border)]"
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <AlertTriangle
                            className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                              vital.severity === "critical" ? "text-destructive" : "text-[var(--status-warning)]"
                            }`}
                          />
                          <div>
                            <p
                              className={`text-sm font-semibold ${
                                vital.severity === "critical" ? "text-destructive" : "text-[var(--status-warning)]"
                              }`}
                            >
                              {vital.name}
                            </p>
                            <p className="text-sm font-medium text-foreground">{vital.value}</p>
                            <p className="text-xs mt-1 text-muted-foreground">{vital.message}</p>
                          </div>
                        </div>
                      </div>
                    ))}

                    {abnormalLabs.length > 0 && (
                      <>
                        {abnormalVitals.length > 0 && <Separator />}
                        {abnormalLabs.map((lab) => (
                          <div
                            key={lab.lab_id}
                            className="p-3 rounded-xl bg-[var(--status-critical-bg)] border border-[var(--status-critical-border)]"
                          >
                            <div className="flex items-start gap-2">
                              <AlertTriangle className="w-4 h-4 mt-0.5 text-destructive flex-shrink-0" />
                              <div>
                                <p className="text-sm font-semibold text-destructive">{lab.test_name}</p>
                                <p className="text-sm font-medium text-foreground">
                                  {lab.value} {lab.unit}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Outside range ({lab.reference_range_low} - {lab.reference_range_high})
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </>
                    )}

                    <div className="mt-4 p-3 bg-[var(--status-info-bg)] rounded-xl border border-[var(--status-info-border)]">
                      <p className="text-xs text-primary font-medium">
                        ⓘ These findings should be interpreted in clinical context and may require review
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="w-10 h-10 rounded-full bg-[var(--status-success-bg)] flex items-center justify-center mx-auto mb-2">
                      <Shield className="w-5 h-5 text-[var(--status-success)]" />
                    </div>
                    <p className="text-sm font-medium text-foreground">All clear</p>
                    <p className="text-xs text-muted-foreground">No active clinical alerts</p>
                  </div>
                )}
              </div>
            </Card>

            {/* ── Active Medications ── */}
            <Card className="overflow-hidden">
              <div className="bg-[var(--status-info-bg)] px-6 py-3 flex items-center gap-2 border-b border-[var(--status-info-border)]">
                <Pill className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-bold text-primary">Active Medications</h2>
              </div>

              <div className="p-6">
                {medications.length > 0 ? (
                  <div className="space-y-3">
                    {medications.map((med) => (
                      <div
                        key={med.medication_id}
                        className="p-4 bg-muted rounded-xl border border-border"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Pill className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-foreground text-sm">{med.drug_name}</p>
                            <p className="text-xs text-muted-foreground mt-1">{med.dosage}</p>
                            <p className="text-xs text-muted-foreground">{med.frequency} · {med.route}</p>
                            <Separator className="my-2" />
                            <p className="text-[11px] text-muted-foreground">
                              {med.prescriber} · Started {format(new Date(med.start_date), "MMM d, yyyy")}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No active medications</p>
                )}
              </div>
            </Card>

            {/* ── Patient Information ── */}
            <Card className="overflow-hidden">
              <div className="bg-accent px-6 py-3 flex items-center gap-2 border-b border-border">
                <User className="w-4 h-4 text-muted-foreground" />
                <h2 className="text-sm font-bold text-foreground">Patient Information</h2>
              </div>

              <div className="p-6 space-y-4">
                {[
                  { label: "Primary Language", value: patient?.primary_language },
                  { label: "Insurance Number", value: patient?.insurance_number },
                  { label: "Emergency Contact", value: patient?.emergency_contact_phone },
                  { label: "Postal Code", value: patient?.postal_code },
                ].map((item, idx) => (
                  <div key={item.label}>
                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                      {item.label}
                    </p>
                    <p className="text-sm font-semibold text-foreground mt-0.5">{item.value}</p>
                    {idx < 3 && <Separator className="mt-3" />}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// VITAL CARD SUB-COMPONENT
// ─────────────────────────────────────────────────────────────
function VitalCard({
  icon: Icon,
  iconColor,
  iconBg,
  label,
  value,
  unit,
  alert,
  alertType,
}: {
  icon: any;
  iconColor: string;
  iconBg: string;
  label: string;
  value: string;
  unit: string;
  alert?: string;
  alertType?: "critical" | "warning";
}) {
  return (
    <div className="p-4 bg-card rounded-xl border border-border">
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-7 h-7 rounded-lg ${iconBg} flex items-center justify-center`}>
          <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
        </div>
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
      </div>
      <p className="text-2xl font-bold text-foreground leading-none">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{unit}</p>
      {alert && (
        <Badge
          className={`mt-2 text-[10px] border ${
            alertType === "critical"
              ? "bg-[var(--status-critical-bg)] text-destructive border-[var(--status-critical-border)]"
              : "bg-[var(--status-warning-bg)] text-[var(--status-warning)] border-[var(--status-warning-border)]"
          }`}
        >
          {alert}
        </Badge>
      )}
    </div>
  );
}
