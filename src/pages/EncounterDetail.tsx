import { useParams, Link } from "react-router-dom";
import { getEncounterWithPatient } from "@/data/mockData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  AlertTriangle
} from "lucide-react";
import { format } from "date-fns";

export default function EncounterDetail() {
  const { encounterId } = useParams<{ encounterId: string }>();
  
  if (!encounterId) {
    return <div className="p-6 text-[#474543]">Encounter not found</div>;
  }

  const data = getEncounterWithPatient(encounterId);

  if (!data) {
    return <div className="p-6 text-[#474543]">Encounter not found</div>;
  }

  const { encounter, patient, vitals, labs, medications } = data;

  // Calculate clinical alerts
  const abnormalLabs = labs.filter(lab => lab.abnormal_flag);
  const abnormalVitals = [];
  
  if (vitals) {
    if (vitals.o2_saturation < 95) {
      abnormalVitals.push({
        name: "Oxygen Saturation",
        value: `${vitals.o2_saturation}%`,
        severity: vitals.o2_saturation < 90 ? "critical" : "warning",
        message: "Below expected range"
      });
    }
    if (vitals.systolic_bp > 140 || vitals.diastolic_bp > 90) {
      abnormalVitals.push({
        name: "Blood Pressure",
        value: `${vitals.systolic_bp}/${vitals.diastolic_bp} mm Hg`,
        severity: vitals.systolic_bp > 160 ? "critical" : "warning",
        message: "Above expected range"
      });
    }
    if (vitals.heart_rate > 100) {
      abnormalVitals.push({
        name: "Heart Rate",
        value: `${vitals.heart_rate} bpm`,
        severity: vitals.heart_rate > 120 ? "critical" : "warning",
        message: "Elevated"
      });
    }
    if (vitals.temperature_celsius > 38.0) {
      abnormalVitals.push({
        name: "Temperature",
        value: `${vitals.temperature_celsius}°C`,
        severity: vitals.temperature_celsius > 39.0 ? "critical" : "warning",
        message: "Elevated"
      });
    }
    if (vitals.pain_scale > 7) {
      abnormalVitals.push({
        name: "Pain Scale",
        value: `${vitals.pain_scale}/10`,
        severity: "warning",
        message: "High pain level reported"
      });
    }
  }

  const hasClinicalAlerts = abnormalLabs.length > 0 || abnormalVitals.length > 0;

  return (
    <div className="p-6 max-w-7xl mx-auto bg-[#F5F5F5]">
      {/* Back Button */}
      <Link 
        to="/" 
        className="inline-flex items-center gap-2 text-[#013366] hover:text-[#1E5189] mb-6 font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Encounter Queue
      </Link>

      {/* Header Section */}
      <div className="mb-6">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold text-[#2D2D2D] mb-1">
              {patient?.first_name} {patient?.last_name}
            </h1>
            <div className="flex items-center gap-4 text-sm text-[#474543]">
              <span>{patient?.age} years old</span>
              <span>•</span>
              <span>{patient?.sex}</span>
              <span>•</span>
              <span>Blood Type: {patient?.blood_type}</span>
            </div>
          </div>
          <Badge 
            className={
              encounter.triage_level <= 2 ? "bg-[#FEF2F2] text-[#CE3E39] border-[#FECACA]" :
              encounter.triage_level === 3 ? "bg-[#FFFBEB] text-[#F59E0B] border-[#FDE68A]" :
              "bg-[#F0FDF4] text-[#10B981] border-[#BBF7D0]"
            }
          >
            Triage Level {encounter.triage_level}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Encounter Summary & Vitals */}
        <div className="lg:col-span-2 space-y-6">
          {/* Encounter Summary */}
          <Card className="p-6 border-[#D8D8D8]">
            <h2 className="text-lg font-bold text-[#2D2D2D] mb-4 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-[#013366]" />
              Encounter Summary
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-[#474543] mb-1">Chief Complaint</p>
                <p className="text-sm font-semibold text-[#2D2D2D]">{encounter.chief_complaint}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-[#474543] mb-1">Diagnosis</p>
                <p className="text-sm font-semibold text-[#2D2D2D]">{encounter.diagnosis_description}</p>
                <p className="text-xs text-[#9F9D9C]">{encounter.diagnosis_code}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-[#474543] mb-1">Encounter Type</p>
                <p className="text-sm font-semibold text-[#2D2D2D]">{encounter.encounter_type}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-[#474543] mb-1">Disposition</p>
                <p className="text-sm font-semibold text-[#2D2D2D]">{encounter.disposition}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-[#474543] mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Encounter Date
                </p>
                <p className="text-sm font-semibold text-[#2D2D2D]">
                  {format(new Date(encounter.encounter_date), "MMM d, yyyy 'at' HH:mm")}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-[#474543] mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Length of Stay
                </p>
                <p className="text-sm font-semibold text-[#2D2D2D]">{encounter.length_of_stay_hours} hours</p>
              </div>
              <div>
                <p className="text-xs font-medium text-[#474543] mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  Facility
                </p>
                <p className="text-sm font-semibold text-[#2D2D2D]">{encounter.facility}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-[#474543] mb-1 flex items-center gap-1">
                  <User className="w-3 h-3" />
                  Attending Physician
                </p>
                <p className="text-sm font-semibold text-[#2D2D2D]">{encounter.attending_physician}</p>
              </div>
            </div>
          </Card>

          {/* Vitals */}
          {vitals && (
            <Card className="p-6 border-[#D8D8D8]">
              <h2 className="text-lg font-bold text-[#2D2D2D] mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#013366]" />
                Current Vitals
              </h2>
              
              <div className="text-xs text-[#474543] mb-4">
                Recorded at {format(new Date(vitals.recorded_at), "MMM d, yyyy 'at' HH:mm")}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {/* Heart Rate */}
                <div className="p-4 bg-[#F5F5F5] rounded-lg border border-[#E0DEDC]">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="w-4 h-4 text-[#CE3E39]" />
                    <p className="text-xs font-medium text-[#474543]">Heart Rate</p>
                  </div>
                  <p className="text-xl font-bold text-[#2D2D2D]">{vitals.heart_rate}</p>
                  <p className="text-xs text-[#474543]">bpm</p>
                  {vitals.heart_rate > 100 && (
                    <Badge className="mt-2 text-xs bg-[#FEF2F2] text-[#CE3E39] border-[#FECACA]">Above normal</Badge>
                  )}
                </div>

                {/* Blood Pressure */}
                <div className="p-4 bg-[#F5F5F5] rounded-lg border border-[#E0DEDC]">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-[#013366]" />
                    <p className="text-xs font-medium text-[#474543]">Blood Pressure</p>
                  </div>
                  <p className="text-xl font-bold text-[#2D2D2D]">
                    {vitals.systolic_bp}/{vitals.diastolic_bp}
                  </p>
                  <p className="text-xs text-[#474543]">mm Hg</p>
                  {(vitals.systolic_bp > 140 || vitals.diastolic_bp > 90) && (
                    <Badge className="mt-2 text-xs bg-[#FEF2F2] text-[#CE3E39] border-[#FECACA]">Above normal</Badge>
                  )}
                </div>

                {/* Temperature */}
                <div className="p-4 bg-[#F5F5F5] rounded-lg border border-[#E0DEDC]">
                  <div className="flex items-center gap-2 mb-2">
                    <Thermometer className="w-4 h-4 text-[#F59E0B]" />
                    <p className="text-xs font-medium text-[#474543]">Temperature</p>
                  </div>
                  <p className="text-xl font-bold text-[#2D2D2D]">{vitals.temperature_celsius}</p>
                  <p className="text-xs text-[#474543]">°C</p>
                  {vitals.temperature_celsius > 38.0 && (
                    <Badge className="mt-2 text-xs bg-[#FFFBEB] text-[#F59E0B] border-[#FDE68A]">Elevated</Badge>
                  )}
                </div>

                {/* Respiratory Rate */}
                <div className="p-4 bg-[#F5F5F5] rounded-lg border border-[#E0DEDC]">
                  <div className="flex items-center gap-2 mb-2">
                    <Wind className="w-4 h-4 text-[#10B981]" />
                    <p className="text-xs font-medium text-[#474543]">Respiratory Rate</p>
                  </div>
                  <p className="text-xl font-bold text-[#2D2D2D]">{vitals.respiratory_rate}</p>
                  <p className="text-xs text-[#474543]">/min</p>
                </div>

                {/* O2 Saturation */}
                <div className="p-4 bg-[#F5F5F5] rounded-lg border border-[#E0DEDC]">
                  <div className="flex items-center gap-2 mb-2">
                    <Droplets className="w-4 h-4 text-[#013366]" />
                    <p className="text-xs font-medium text-[#474543]">SpO2</p>
                  </div>
                  <p className="text-xl font-bold text-[#2D2D2D]">{vitals.o2_saturation}</p>
                  <p className="text-xs text-[#474543]">%</p>
                  {vitals.o2_saturation < 95 && (
                    <Badge className="mt-2 text-xs bg-[#FEF2F2] text-[#CE3E39] border-[#FECACA]">Below normal</Badge>
                  )}
                </div>

                {/* Pain Scale */}
                <div className="p-4 bg-[#F5F5F5] rounded-lg border border-[#E0DEDC]">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-[#474543]" />
                    <p className="text-xs font-medium text-[#474543]">Pain Scale</p>
                  </div>
                  <p className="text-xl font-bold text-[#2D2D2D]">{vitals.pain_scale}</p>
                  <p className="text-xs text-[#474543]">/10</p>
                  {vitals.pain_scale > 7 && (
                    <Badge className="mt-2 text-xs bg-[#FFFBEB] text-[#F59E0B] border-[#FDE68A]">High</Badge>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Lab Results */}
          <Card className="p-6 border-[#D8D8D8]">
            <h2 className="text-lg font-bold text-[#2D2D2D] mb-4">Lab Results</h2>
            
            {labs.length > 0 ? (
              <div className="space-y-3">
                {labs.map((lab) => (
                  <div 
                    key={lab.lab_id} 
                    className={`p-4 rounded-lg border ${
                      lab.abnormal_flag 
                        ? "bg-[#FEF2F2] border-[#FECACA]" 
                        : "bg-[#F5F5F5] border-[#E0DEDC]"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-[#2D2D2D] text-sm">{lab.test_name}</p>
                        <p className="text-xs text-[#474543]">{lab.test_code}</p>
                      </div>
                      {lab.abnormal_flag && (
                        <Badge className="gap-1 bg-[#CE3E39] text-white border-0">
                          <AlertTriangle className="w-3 h-3" />
                          Abnormal
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-xs text-[#474543]">Value</p>
                        <p className="font-semibold text-[#2D2D2D]">{lab.value} {lab.unit}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#474543]">Reference Range</p>
                        <p className="font-semibold text-[#2D2D2D]">
                          {lab.reference_range_low} - {lab.reference_range_high}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-[#474543]">Collected</p>
                        <p className="font-semibold text-[#2D2D2D]">
                          {format(new Date(lab.collected_date), "HH:mm")}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#474543]">No lab results available</p>
            )}
          </Card>
        </div>

        {/* Right Column - Clinical Alerts & Medications */}
        <div className="space-y-6">
          {/* Clinical Alerts */}
          <Card className="p-6 border-[#D8D8D8]">
            <h2 className="text-lg font-bold text-[#2D2D2D] mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-[#CE3E39]" />
              Clinical Alerts
            </h2>

            {hasClinicalAlerts ? (
              <div className="space-y-3">
                {/* Abnormal Vitals */}
                {abnormalVitals.map((vital, idx) => (
                  <div 
                    key={idx}
                    className={`p-3 rounded-lg border ${
                      vital.severity === "critical" 
                        ? "bg-[#FEF2F2] border-[#FECACA]" 
                        : "bg-[#FFFBEB] border-[#FDE68A]"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <AlertTriangle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                        vital.severity === "critical" ? "text-[#CE3E39]" : "text-[#F59E0B]"
                      }`} />
                      <div>
                        <p className={`text-sm font-semibold ${
                          vital.severity === "critical" ? "text-[#CE3E39]" : "text-[#F59E0B]"
                        }`}>
                          {vital.name}
                        </p>
                        <p className={`text-sm font-medium ${
                          vital.severity === "critical" ? "text-[#2D2D2D]" : "text-[#2D2D2D]"
                        }`}>
                          {vital.value}
                        </p>
                        <p className={`text-xs mt-1 ${
                          vital.severity === "critical" ? "text-[#474543]" : "text-[#474543]"
                        }`}>
                          {vital.message}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Abnormal Labs */}
                {abnormalLabs.length > 0 && (
                  <>
                    {abnormalVitals.length > 0 && <Separator className="bg-[#E0DEDC]" />}
                    {abnormalLabs.map((lab) => (
                      <div 
                        key={lab.lab_id}
                        className="p-3 rounded-lg bg-[#FEF2F2] border border-[#FECACA]"
                      >
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 mt-0.5 text-[#CE3E39] flex-shrink-0" />
                          <div>
                            <p className="text-sm font-semibold text-[#CE3E39]">
                              {lab.test_name}
                            </p>
                            <p className="text-sm font-medium text-[#2D2D2D]">
                              {lab.value} {lab.unit}
                            </p>
                            <p className="text-xs text-[#474543] mt-1">
                              Outside expected range ({lab.reference_range_low} - {lab.reference_range_high})
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                )}

                <div className="mt-4 p-3 bg-[#EFF6FF] rounded-lg border border-[#BFDBFE]">
                  <p className="text-xs text-[#013366] font-medium">
                    ⓘ These findings should be interpreted in clinical context and may require review
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-[#474543]">No active clinical alerts</p>
            )}
          </Card>

          {/* Active Medications */}
          <Card className="p-6 border-[#D8D8D8]">
            <h2 className="text-lg font-bold text-[#2D2D2D] mb-4">Active Medications</h2>
            
            {medications.length > 0 ? (
              <div className="space-y-3">
                {medications.map((med) => (
                  <div key={med.medication_id} className="p-3 bg-[#F5F5F5] rounded-lg border border-[#E0DEDC]">
                    <p className="font-semibold text-[#2D2D2D] text-sm">{med.drug_name}</p>
                    <p className="text-xs text-[#474543] mt-1">{med.dosage}</p>
                    <p className="text-xs text-[#474543]">{med.frequency}</p>
                    <p className="text-xs text-[#474543]">Route: {med.route}</p>
                    <Separator className="my-2 bg-[#E0DEDC]" />
                    <p className="text-xs text-[#9F9D9C]">Prescribed by {med.prescriber}</p>
                    <p className="text-xs text-[#9F9D9C]">
                      Started {format(new Date(med.start_date), "MMM d, yyyy")}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#474543]">No active medications</p>
            )}
          </Card>

          {/* Patient Information */}
          <Card className="p-6 border-[#D8D8D8]">
            <h2 className="text-lg font-bold text-[#2D2D2D] mb-4">Patient Information</h2>
            
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs font-medium text-[#474543]">Primary Language</p>
                <p className="font-semibold text-[#2D2D2D]">{patient?.primary_language}</p>
              </div>
              <Separator className="bg-[#E0DEDC]" />
              <div>
                <p className="text-xs font-medium text-[#474543]">Insurance Number</p>
                <p className="font-semibold text-[#2D2D2D]">{patient?.insurance_number}</p>
              </div>
              <Separator className="bg-[#E0DEDC]" />
              <div>
                <p className="text-xs font-medium text-[#474543]">Emergency Contact</p>
                <p className="font-semibold text-[#2D2D2D]">{patient?.emergency_contact_phone}</p>
              </div>
              <Separator className="bg-[#E0DEDC]" />
              <div>
                <p className="text-xs font-medium text-[#474543]">Postal Code</p>
                <p className="font-semibold text-[#2D2D2D]">{patient?.postal_code}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}