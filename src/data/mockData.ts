// Real data from uploaded CSVs — Build Worker Health Dashboard

export type ServiceLine = 'doctor' | 'blood-work' | 'imaging' | 'pharmacy';
export type JourneyStatus =
  | 'Waiting'
  | 'In Progress'
  | 'Awaiting Lab Results'
  | 'With Specialist'
  | 'Ready for Discharge'
  | 'In Triage'
  | 'Awaiting Medication';

export interface Patient {
  patient_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  age: number;
  sex: string;
  postal_code: string;
  blood_type: string;
  insurance_number: string;
  primary_language: string;
  emergency_contact_phone: string;
}

export interface Encounter {
  encounter_id: string;
  patient_id: string;
  encounter_date: string;
  encounter_type: string;
  facility: string;
  chief_complaint: string;
  diagnosis_code: string;
  diagnosis_description: string;
  triage_level: number;
  disposition: string;
  length_of_stay_hours: number;
  attending_physician: string;
}

export interface Vitals {
  vitals_id: string;
  patient_id: string;
  encounter_id: string;
  heart_rate: number;
  systolic_bp: number;
  diastolic_bp: number;
  temperature_celsius: number;
  respiratory_rate: number;
  o2_saturation: number;
  pain_scale: number;
  recorded_at: string;
}

export interface LabResult {
  lab_id: string;
  patient_id: string;
  encounter_id: string;
  test_name: string;
  test_code: string;
  value: number;
  unit: string;
  reference_range_low: number;
  reference_range_high: number;
  abnormal_flag: boolean;
  collected_date: string;
}

export interface Medication {
  medication_id: string;
  patient_id: string;
  drug_name: string;
  drug_code: string;
  dosage: string;
  frequency: string;
  route: string;
  prescriber: string;
  start_date: string;
  end_date: string | null;
  active: boolean;
}

export interface Allergy {
  allergy_id: string;
  patient_id: string;
  allergen: string;
  reaction: string;
  severity: 'mild' | 'moderate' | 'severe';
}

// Map chief complaint → service line
function mapServiceLine(complaint: string): ServiceLine {
  const c = complaint.toLowerCase();
  if (c.includes('chest pain') || c.includes('shortness of breath') || c.includes('abdominal pain') || c.includes('headache') || c.includes('dizziness') || c.includes('anxiety') || c.includes('fever')) return 'doctor';
  if (c.includes('injury') || c.includes('back pain') || c.includes('fracture')) return 'imaging';
  if (c.includes('rash') || c.includes('skin') || c.includes('nausea') || c.includes('vomiting')) return 'blood-work';
  if (c.includes('cough') || c.includes('cold')) return 'pharmacy';
  return 'doctor';
}

// Map triage + elapsed time → journey status
function mapJourneyStatus(triage: number, minutesSinceArrival: number): JourneyStatus {
  if (minutesSinceArrival < 8) return 'In Triage';
  if (triage <= 2) {
    if (minutesSinceArrival < 20) return 'Waiting';
    if (minutesSinceArrival < 60) return 'In Progress';
    if (minutesSinceArrival < 120) return 'Awaiting Lab Results';
    return 'Ready for Discharge';
  }
  if (triage === 3) {
    if (minutesSinceArrival < 35) return 'Waiting';
    if (minutesSinceArrival < 90) return 'In Progress';
    if (minutesSinceArrival < 150) return 'With Specialist';
    return 'Ready for Discharge';
  }
  // triage 4-5
  if (minutesSinceArrival < 60) return 'Waiting';
  if (minutesSinceArrival < 120) return 'Awaiting Medication';
  if (minutesSinceArrival < 180) return 'In Progress';
  return 'Ready for Discharge';
}

// Compute estimated remaining wait based on CTAS targets
function computeEstimatedWait(triage: number, minutesSinceArrival: number, status: JourneyStatus): number {
  if (status === 'In Progress' || status === 'Ready for Discharge') return 0;
  const targets: Record<number, number> = { 1: 5, 2: 15, 3: 30, 4: 60, 5: 120 };
  const target = targets[triage] ?? 30;
  // Estimated remaining = target total visit time minus elapsed, with some variance
  const totalExpected = target + 45 + (triage * 15); // target wait + treatment time
  const remaining = Math.max(0, totalExpected - minutesSinceArrival);
  return remaining;
}

export const patients: Patient[] = [
  { patient_id: 'PAT-001747', first_name: 'Joanne', last_name: 'Stephenson', date_of_birth: '1992-11-15', age: 33, sex: 'F', postal_code: 'V8S 1Y6', blood_type: 'A+', insurance_number: '2112 181 851', primary_language: 'Other', emergency_contact_phone: '531-637-0500' },
  { patient_id: 'PAT-001645', first_name: 'Jacqueline', last_name: 'Hernandez', date_of_birth: '2010-04-29', age: 15, sex: 'F', postal_code: 'V8V 4G6', blood_type: 'A-', insurance_number: '3536 760 219', primary_language: 'French', emergency_contact_phone: '+1 (169) 335-1588' },
  { patient_id: 'PAT-001668', first_name: 'Adrian', last_name: 'Collier', date_of_birth: '1981-02-15', age: 45, sex: 'M', postal_code: 'V8S 0G4', blood_type: 'O+', insurance_number: '5083 767 211', primary_language: 'English', emergency_contact_phone: '(526) 118-9003' },
  { patient_id: 'PAT-000776', first_name: 'Elizabeth', last_name: 'Perez', date_of_birth: '1976-07-27', age: 49, sex: 'F', postal_code: 'V8S 5B1', blood_type: 'O+', insurance_number: '1008 150 927', primary_language: 'English', emergency_contact_phone: '441 862 3690' },
  { patient_id: 'PAT-001421', first_name: 'William', last_name: 'Holland', date_of_birth: '1986-02-01', age: 40, sex: 'M', postal_code: 'V9A 2T6', blood_type: 'A+', insurance_number: '1078 901 836', primary_language: 'English', emergency_contact_phone: '189.455.9067' },
  { patient_id: 'PAT-000096', first_name: 'Christopher', last_name: 'Olson', date_of_birth: '2009-08-17', age: 16, sex: 'M', postal_code: 'V9A 6S6', blood_type: 'O+', insurance_number: '2762 896 292', primary_language: 'English', emergency_contact_phone: '958.514.9368' },
  { patient_id: 'PAT-001116', first_name: 'Mark', last_name: 'Sutton', date_of_birth: '1979-07-04', age: 46, sex: 'M', postal_code: 'V8P 3L8', blood_type: 'A+', insurance_number: '1746 472 129', primary_language: 'English', emergency_contact_phone: '+1 (691) 928-4552' },
  { patient_id: 'PAT-001177', first_name: 'Bryce', last_name: 'Wolf', date_of_birth: '1996-12-07', age: 29, sex: 'M', postal_code: 'V9A 5A6', blood_type: 'O+', insurance_number: '5466 695 453', primary_language: 'English', emergency_contact_phone: '701-418-8421' },
  { patient_id: 'PAT-001792', first_name: 'Michael', last_name: 'Hughes', date_of_birth: '1981-07-10', age: 44, sex: 'M', postal_code: 'V8W 9Y4', blood_type: 'A+', insurance_number: '9583 977 081', primary_language: 'English', emergency_contact_phone: '(168) 154-1858' },
  { patient_id: 'PAT-000108', first_name: 'Benjamin', last_name: 'Murray', date_of_birth: '1988-01-26', age: 38, sex: 'M', postal_code: 'V9B 3L1', blood_type: 'A-', insurance_number: '2596 033 225', primary_language: 'English', emergency_contact_phone: '805-411-9986' },
  { patient_id: 'PAT-001918', first_name: 'Jose', last_name: 'Page', date_of_birth: '1960-05-23', age: 65, sex: 'M', postal_code: 'V8V 2W0', blood_type: 'O+', insurance_number: '2599 974 726', primary_language: 'French', emergency_contact_phone: '1-540-458-8311' },
  { patient_id: 'PAT-001191', first_name: 'Andrea', last_name: 'Garcia', date_of_birth: '1951-03-19', age: 75, sex: 'F', postal_code: 'V8P 7P9', blood_type: 'B+', insurance_number: '8007 490 539', primary_language: 'English', emergency_contact_phone: '481 785 2282' },
  { patient_id: 'PAT-000045', first_name: 'Sandy', last_name: 'Ruiz', date_of_birth: '1979-01-13', age: 47, sex: 'F', postal_code: 'V9C 6E8', blood_type: 'O+', insurance_number: '1369 982 099', primary_language: 'English', emergency_contact_phone: '(305) 310-0330 x923' },
  { patient_id: 'PAT-001894', first_name: 'Monica', last_name: 'Chavez', date_of_birth: '2024-11-27', age: 1, sex: 'F', postal_code: 'V8X 5L7', blood_type: 'O+', insurance_number: '1814 848 475', primary_language: 'English', emergency_contact_phone: '(763) 094-4238' },
  { patient_id: 'PAT-001997', first_name: 'Michael', last_name: 'Howard', date_of_birth: '1974-12-31', age: 51, sex: 'M', postal_code: 'V8T 6S3', blood_type: 'O+', insurance_number: '9008 847 819', primary_language: 'English', emergency_contact_phone: '689 860 6106' },
  { patient_id: 'PAT-000144', first_name: 'Taylor', last_name: 'Griffith', date_of_birth: '1975-11-11', age: 50, sex: 'F', postal_code: 'V8P 5K7', blood_type: 'O+', insurance_number: '1172 588 217', primary_language: 'English', emergency_contact_phone: '(727) 877-4701' },
  { patient_id: 'PAT-001233', first_name: 'Joshua', last_name: 'Wright', date_of_birth: '2004-11-16', age: 21, sex: 'M', postal_code: 'V8T 3B1', blood_type: 'A+', insurance_number: '7156 472 525', primary_language: 'English', emergency_contact_phone: '491-122-5288' },
  { patient_id: 'PAT-001124', first_name: 'Julie', last_name: 'Browning', date_of_birth: '1985-04-28', age: 40, sex: 'F', postal_code: 'V8R 6T0', blood_type: 'A+', insurance_number: '9790 735 882', primary_language: 'English', emergency_contact_phone: '876 829 7514' },
  { patient_id: 'PAT-000008', first_name: 'Danielle', last_name: 'Hoffman', date_of_birth: '1987-12-01', age: 38, sex: 'F', postal_code: 'V9B 7R5', blood_type: 'B+', insurance_number: '3285 389 354', primary_language: 'Mandarin', emergency_contact_phone: '1-296-965-3287' },
];

// Generate today-based arrival times staggered over the last ~4 hours
function todayAt(hoursAgo: number): string {
  const now = new Date();
  const d = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
  return d.toISOString();
}

export const encounters: Encounter[] = [
  { encounter_id: 'ENC-0005422', patient_id: 'PAT-001997', encounter_date: todayAt(3.5), encounter_type: 'emergency', facility: 'Victoria General Hospital', chief_complaint: 'headache', diagnosis_code: 'I10', diagnosis_description: 'Essential hypertension', triage_level: 2, disposition: 'admitted', length_of_stay_hours: 24.0, attending_physician: 'Dr. Brenda Johnson' },
  { encounter_id: 'ENC-0008293', patient_id: 'PAT-001894', encounter_date: todayAt(2.8), encounter_type: 'emergency', facility: 'Royal Jubilee Hospital', chief_complaint: 'dizziness', diagnosis_code: 'E11.9', diagnosis_description: 'Type 2 diabetes mellitus', triage_level: 2, disposition: 'discharged', length_of_stay_hours: 0.0, attending_physician: 'Dr. Rhonda Taylor' },
  { encounter_id: 'ENC-0007580', patient_id: 'PAT-000008', encounter_date: todayAt(1.2), encounter_type: 'emergency', facility: 'Royal Jubilee Hospital', chief_complaint: 'chest pain', diagnosis_code: 'R07.9', diagnosis_description: 'Chest pain, unspecified', triage_level: 2, disposition: 'discharged', length_of_stay_hours: 0.0, attending_physician: 'Dr. Gregory Wilson' },
  { encounter_id: 'ENC-0002871', patient_id: 'PAT-001191', encounter_date: todayAt(4.1), encounter_type: 'emergency', facility: 'Royal Jubilee Hospital', chief_complaint: 'abdominal pain', diagnosis_code: 'K35.9', diagnosis_description: 'Acute appendicitis', triage_level: 1, disposition: 'discharged', length_of_stay_hours: 0.0, attending_physician: 'Dr. Christine Morgan' },
  { encounter_id: 'ENC-0006073', patient_id: 'PAT-001918', encounter_date: todayAt(1.8), encounter_type: 'emergency', facility: 'Royal Jubilee Hospital', chief_complaint: 'back pain', diagnosis_code: 'M54.5', diagnosis_description: 'Low back pain', triage_level: 3, disposition: 'discharged', length_of_stay_hours: 0.0, attending_physician: 'Dr. Lisa Fox' },
  { encounter_id: 'ENC-0009552', patient_id: 'PAT-001233', encounter_date: todayAt(0.9), encounter_type: 'emergency', facility: 'Royal Jubilee Hospital', chief_complaint: 'headache', diagnosis_code: 'I10', diagnosis_description: 'Essential hypertension', triage_level: 3, disposition: 'discharged', length_of_stay_hours: 0.0, attending_physician: 'Dr. Steven Pennington' },
  { encounter_id: 'ENC-0003916', patient_id: 'PAT-001894', encounter_date: todayAt(3.9), encounter_type: 'emergency', facility: 'Saanich Peninsula Hospital', chief_complaint: 'anxiety/depression', diagnosis_code: 'F32.9', diagnosis_description: 'Major depressive disorder', triage_level: 1, disposition: 'discharged', length_of_stay_hours: 0.0, attending_physician: 'Dr. Mary Foster' },
  { encounter_id: 'ENC-0008866', patient_id: 'PAT-001747', encounter_date: todayAt(2.2), encounter_type: 'emergency', facility: 'Cowichan District Hospital', chief_complaint: 'abdominal pain', diagnosis_code: 'K35.9', diagnosis_description: 'Acute appendicitis', triage_level: 3, disposition: 'discharged', length_of_stay_hours: 0.0, attending_physician: 'Dr. Jason Garrison' },
  { encounter_id: 'ENC-0000388', patient_id: 'PAT-001421', encounter_date: todayAt(0.3), encounter_type: 'emergency', facility: 'Cowichan District Hospital', chief_complaint: 'injury from fall', diagnosis_code: 'S82.0', diagnosis_description: 'Fracture of patella', triage_level: 5, disposition: 'admitted', length_of_stay_hours: 63.2, attending_physician: 'Dr. Nathaniel Perez' },
  { encounter_id: 'ENC-0009852', patient_id: 'PAT-001894', encounter_date: todayAt(3.2), encounter_type: 'emergency', facility: 'Cowichan District Hospital', chief_complaint: 'skin rash', diagnosis_code: 'R00.0', diagnosis_description: 'Tachycardia', triage_level: 1, disposition: 'transferred', length_of_stay_hours: 26.9, attending_physician: 'Dr. Ryan White' },
  { encounter_id: 'ENC-0004841', patient_id: 'PAT-000144', encounter_date: todayAt(0.5), encounter_type: 'emergency', facility: 'Royal Jubilee Hospital', chief_complaint: 'nausea and vomiting', diagnosis_code: 'K21.0', diagnosis_description: 'Gastroesophageal reflux disease', triage_level: 3, disposition: 'discharged', length_of_stay_hours: 0.0, attending_physician: 'Dr. Joshua Gibson' },
  { encounter_id: 'ENC-0003829', patient_id: 'PAT-001645', encounter_date: todayAt(2.5), encounter_type: 'emergency', facility: 'Victoria General Hospital', chief_complaint: 'cough and cold symptoms', diagnosis_code: 'J06.9', diagnosis_description: 'Acute upper respiratory infection', triage_level: 5, disposition: 'discharged', length_of_stay_hours: 0.0, attending_physician: 'Dr. Gregory Wilson' },
  { encounter_id: 'ENC-0007129', patient_id: 'PAT-000045', encounter_date: todayAt(1.5), encounter_type: 'emergency', facility: 'Victoria General Hospital', chief_complaint: 'cough and cold symptoms', diagnosis_code: 'J06.9', diagnosis_description: 'Acute upper respiratory infection', triage_level: 4, disposition: 'discharged', length_of_stay_hours: 0.0, attending_physician: 'Dr. William Wang' },
  { encounter_id: 'ENC-0007123', patient_id: 'PAT-000108', encounter_date: todayAt(1.0), encounter_type: 'emergency', facility: 'Victoria General Hospital', chief_complaint: 'back pain', diagnosis_code: 'M54.5', diagnosis_description: 'Low back pain', triage_level: 4, disposition: 'discharged', length_of_stay_hours: 0.0, attending_physician: 'Dr. Christine Morgan' },
  { encounter_id: 'ENC-0009573', patient_id: 'PAT-001116', encounter_date: todayAt(2.0), encounter_type: 'emergency', facility: 'Royal Jubilee Hospital', chief_complaint: 'shortness of breath', diagnosis_code: 'J18.9', diagnosis_description: 'Pneumonia, unspecified', triage_level: 1, disposition: 'discharged', length_of_stay_hours: 0.0, attending_physician: 'Dr. Mary Foster' },
  { encounter_id: 'ENC-0001215', patient_id: 'PAT-001124', encounter_date: todayAt(3.7), encounter_type: 'emergency', facility: 'Victoria General Hospital', chief_complaint: 'chest pain', diagnosis_code: 'I21.9', diagnosis_description: 'Acute myocardial infarction', triage_level: 1, disposition: 'admitted', length_of_stay_hours: 24.0, attending_physician: 'Dr. Rachel Reyes' },
  { encounter_id: 'ENC-0003370', patient_id: 'PAT-000776', encounter_date: todayAt(2.3), encounter_type: 'emergency', facility: 'Royal Jubilee Hospital', chief_complaint: 'cough and cold symptoms', diagnosis_code: 'J06.9', diagnosis_description: 'Acute upper respiratory infection', triage_level: 5, disposition: 'observation', length_of_stay_hours: 5.3, attending_physician: 'Dr. Brandon Davis' },
  { encounter_id: 'ENC-0000810', patient_id: 'PAT-001421', encounter_date: todayAt(0.7), encounter_type: 'emergency', facility: 'Saanich Peninsula Hospital', chief_complaint: 'nausea and vomiting', diagnosis_code: 'K21.0', diagnosis_description: 'Gastroesophageal reflux disease', triage_level: 2, disposition: 'discharged', length_of_stay_hours: 0.0, attending_physician: 'Dr. David Hall' },
  { encounter_id: 'ENC-0004599', patient_id: 'PAT-001894', encounter_date: todayAt(1.6), encounter_type: 'emergency', facility: 'Victoria General Hospital', chief_complaint: 'dizziness', diagnosis_code: 'E11.9', diagnosis_description: 'Type 2 diabetes mellitus', triage_level: 3, disposition: 'discharged', length_of_stay_hours: 0.0, attending_physician: 'Dr. Bryan Brown' },
  { encounter_id: 'ENC-0003497', patient_id: 'PAT-001792', encounter_date: todayAt(0.4), encounter_type: 'emergency', facility: 'Victoria General Hospital', chief_complaint: 'fever', diagnosis_code: 'J02.9', diagnosis_description: 'Acute pharyngitis', triage_level: 4, disposition: 'discharged', length_of_stay_hours: 0.0, attending_physician: 'Dr. Mark Wright' },
  { encounter_id: 'ENC-0001530', patient_id: 'PAT-001668', encounter_date: todayAt(2.6), encounter_type: 'emergency', facility: 'Saanich Peninsula Hospital', chief_complaint: 'back pain', diagnosis_code: 'M54.5', diagnosis_description: 'Low back pain', triage_level: 4, disposition: 'discharged', length_of_stay_hours: 0.0, attending_physician: 'Dr. David Rodriguez' },
  { encounter_id: 'ENC-0008995', patient_id: 'PAT-001894', encounter_date: todayAt(1.3), encounter_type: 'emergency', facility: 'Royal Jubilee Hospital', chief_complaint: 'anxiety/depression', diagnosis_code: 'F32.9', diagnosis_description: 'Major depressive disorder', triage_level: 2, disposition: 'discharged', length_of_stay_hours: 0.0, attending_physician: 'Dr. Cassandra Miller' },
  { encounter_id: 'ENC-0006552', patient_id: 'PAT-000096', encounter_date: todayAt(0.6), encounter_type: 'emergency', facility: 'Victoria General Hospital', chief_complaint: 'injury from fall', diagnosis_code: 'S93.4', diagnosis_description: 'Sprain of ankle', triage_level: 2, disposition: 'transferred', length_of_stay_hours: 24.0, attending_physician: 'Dr. Nathaniel Perez' },
  { encounter_id: 'ENC-0009243', patient_id: 'PAT-001177', encounter_date: todayAt(1.9), encounter_type: 'emergency', facility: 'Cowichan District Hospital', chief_complaint: 'abdominal pain', diagnosis_code: 'R10.9', diagnosis_description: 'Abdominal pain, unspecified', triage_level: 3, disposition: 'discharged', length_of_stay_hours: 0.0, attending_physician: 'Dr. Lisa Fox' },
  { encounter_id: 'ENC-0006312', patient_id: 'PAT-001894', encounter_date: todayAt(0.1), encounter_type: 'emergency', facility: 'Royal Jubilee Hospital', chief_complaint: 'chest pain', diagnosis_code: 'R07.9', diagnosis_description: 'Chest pain, unspecified', triage_level: 5, disposition: 'discharged', length_of_stay_hours: 0.0, attending_physician: 'Dr. Mary Foster' },
];

export const vitals: Vitals[] = [
  { vitals_id: 'VIT-000857', patient_id: 'PAT-001997', encounter_id: 'ENC-0005422', heart_rate: 86, systolic_bp: 162, diastolic_bp: 86, temperature_celsius: 36.9, respiratory_rate: 14, o2_saturation: 98.8, pain_scale: 5, recorded_at: '2025-09-04 23:12:00' },
  { vitals_id: 'VIT-001507', patient_id: 'PAT-001894', encounter_id: 'ENC-0008293', heart_rate: 116, systolic_bp: 132, diastolic_bp: 69, temperature_celsius: 37.0, respiratory_rate: 20, o2_saturation: 98.6, pain_scale: 3, recorded_at: '2025-07-15 02:22:00' },
  { vitals_id: 'VIT-000641', patient_id: 'PAT-000008', encounter_id: 'ENC-0007580', heart_rate: 91, systolic_bp: 144, diastolic_bp: 76, temperature_celsius: 36.9, respiratory_rate: 14, o2_saturation: 95.8, pain_scale: 7, recorded_at: '2023-05-03 14:20:00' },
  { vitals_id: 'VIT-001748', patient_id: 'PAT-001191', encounter_id: 'ENC-0002871', heart_rate: 94, systolic_bp: 126, diastolic_bp: 72, temperature_celsius: 38.2, respiratory_rate: 17, o2_saturation: 97.7, pain_scale: 5, recorded_at: '2024-08-29 04:49:00' },
  { vitals_id: 'VIT-001261', patient_id: 'PAT-001918', encounter_id: 'ENC-0006073', heart_rate: 75, systolic_bp: 106, diastolic_bp: 76, temperature_celsius: 37.2, respiratory_rate: 21, o2_saturation: 99.5, pain_scale: 6, recorded_at: '2023-10-01 20:24:00' },
  { vitals_id: 'VIT-001246', patient_id: 'PAT-001233', encounter_id: 'ENC-0009552', heart_rate: 82, systolic_bp: 159, diastolic_bp: 88, temperature_celsius: 37.3, respiratory_rate: 10, o2_saturation: 98.3, pain_scale: 0, recorded_at: '2023-11-07 00:13:00' },
  { vitals_id: 'VIT-001672', patient_id: 'PAT-001894', encounter_id: 'ENC-0003916', heart_rate: 98, systolic_bp: 122, diastolic_bp: 73, temperature_celsius: 36.3, respiratory_rate: 14, o2_saturation: 98.6, pain_scale: 0, recorded_at: '2023-11-09 05:29:00' },
  { vitals_id: 'VIT-000599', patient_id: 'PAT-001747', encounter_id: 'ENC-0008866', heart_rate: 99, systolic_bp: 115, diastolic_bp: 88, temperature_celsius: 37.6, respiratory_rate: 15, o2_saturation: 97.7, pain_scale: 7, recorded_at: '2024-09-08 14:19:00' },
  { vitals_id: 'VIT-001508', patient_id: 'PAT-001421', encounter_id: 'ENC-0000388', heart_rate: 88, systolic_bp: 136, diastolic_bp: 72, temperature_celsius: 36.5, respiratory_rate: 16, o2_saturation: 96.7, pain_scale: 5, recorded_at: '2025-10-15 01:18:00' },
  { vitals_id: 'VIT-000949', patient_id: 'PAT-001894', encounter_id: 'ENC-0009852', heart_rate: 71, systolic_bp: 135, diastolic_bp: 65, temperature_celsius: 36.9, respiratory_rate: 18, o2_saturation: 98.7, pain_scale: 4, recorded_at: '2026-01-28 01:58:00' },
  { vitals_id: 'VIT-001738', patient_id: 'PAT-000144', encounter_id: 'ENC-0004841', heart_rate: 54, systolic_bp: 162, diastolic_bp: 86, temperature_celsius: 37.2, respiratory_rate: 21, o2_saturation: 97.4, pain_scale: 4, recorded_at: '2023-08-19 01:00:00' },
  { vitals_id: 'VIT-000897', patient_id: 'PAT-001645', encounter_id: 'ENC-0003829', heart_rate: 61, systolic_bp: 109, diastolic_bp: 82, temperature_celsius: 37.0, respiratory_rate: 16, o2_saturation: 96.2, pain_scale: 7, recorded_at: '2023-07-05 04:45:00' },
  { vitals_id: 'VIT-000330', patient_id: 'PAT-000045', encounter_id: 'ENC-0007129', heart_rate: 54, systolic_bp: 114, diastolic_bp: 57, temperature_celsius: 36.7, respiratory_rate: 17, o2_saturation: 97.8, pain_scale: 3, recorded_at: '2023-04-10 16:04:00' },
  { vitals_id: 'VIT-000546', patient_id: 'PAT-000108', encounter_id: 'ENC-0007123', heart_rate: 84, systolic_bp: 130, diastolic_bp: 86, temperature_celsius: 37.2, respiratory_rate: 20, o2_saturation: 99.4, pain_scale: 0, recorded_at: '2023-09-27 17:26:00' },
  { vitals_id: 'VIT-001212', patient_id: 'PAT-001116', encounter_id: 'ENC-0009573', heart_rate: 91, systolic_bp: 131, diastolic_bp: 72, temperature_celsius: 36.9, respiratory_rate: 19, o2_saturation: 91.4, pain_scale: 2, recorded_at: '2025-05-08 13:32:00' },
  { vitals_id: 'VIT-000446', patient_id: 'PAT-001124', encounter_id: 'ENC-0001215', heart_rate: 104, systolic_bp: 113, diastolic_bp: 79, temperature_celsius: 37.4, respiratory_rate: 19, o2_saturation: 97.6, pain_scale: 7, recorded_at: '2023-03-10 13:13:00' },
  { vitals_id: 'VIT-001611', patient_id: 'PAT-000776', encounter_id: 'ENC-0003370', heart_rate: 75, systolic_bp: 103, diastolic_bp: 80, temperature_celsius: 36.9, respiratory_rate: 8, o2_saturation: 96.3, pain_scale: 0, recorded_at: '2023-06-27 21:01:00' },
  { vitals_id: 'VIT-001117', patient_id: 'PAT-001421', encounter_id: 'ENC-0000810', heart_rate: 90, systolic_bp: 114, diastolic_bp: 92, temperature_celsius: 36.4, respiratory_rate: 20, o2_saturation: 98.7, pain_scale: 5, recorded_at: '2024-10-12 18:04:00' },
  { vitals_id: 'VIT-001988', patient_id: 'PAT-001894', encounter_id: 'ENC-0004599', heart_rate: 70, systolic_bp: 119, diastolic_bp: 68, temperature_celsius: 36.9, respiratory_rate: 16, o2_saturation: 93.8, pain_scale: 5, recorded_at: '2023-08-01 06:54:00' },
  { vitals_id: 'VIT-000287', patient_id: 'PAT-001792', encounter_id: 'ENC-0003497', heart_rate: 87, systolic_bp: 118, diastolic_bp: 60, temperature_celsius: 36.8, respiratory_rate: 12, o2_saturation: 97.8, pain_scale: 2, recorded_at: '2023-10-29 23:06:00' },
  { vitals_id: 'VIT-000105', patient_id: 'PAT-001668', encounter_id: 'ENC-0001530', heart_rate: 85, systolic_bp: 120, diastolic_bp: 66, temperature_celsius: 37.4, respiratory_rate: 11, o2_saturation: 99.6, pain_scale: 3, recorded_at: '2023-05-13 10:40:00' },
  { vitals_id: 'VIT-000666', patient_id: 'PAT-001894', encounter_id: 'ENC-0008995', heart_rate: 77, systolic_bp: 121, diastolic_bp: 78, temperature_celsius: 36.8, respiratory_rate: 16, o2_saturation: 95.9, pain_scale: 6, recorded_at: '2024-02-24 19:02:00' },
  { vitals_id: 'VIT-000563', patient_id: 'PAT-000096', encounter_id: 'ENC-0006552', heart_rate: 106, systolic_bp: 133, diastolic_bp: 77, temperature_celsius: 36.5, respiratory_rate: 16, o2_saturation: 94.1, pain_scale: 8, recorded_at: '2025-07-03 03:49:00' },
  { vitals_id: 'VIT-001841', patient_id: 'PAT-001177', encounter_id: 'ENC-0009243', heart_rate: 67, systolic_bp: 132, diastolic_bp: 71, temperature_celsius: 36.7, respiratory_rate: 13, o2_saturation: 97.5, pain_scale: 1, recorded_at: '2025-01-05 20:41:00' },
  { vitals_id: 'VIT-001139', patient_id: 'PAT-001894', encounter_id: 'ENC-0006312', heart_rate: 74, systolic_bp: 114, diastolic_bp: 74, temperature_celsius: 36.8, respiratory_rate: 16, o2_saturation: 96.5, pain_scale: 0, recorded_at: '2025-07-21 04:38:00' },
];

export const labResults: LabResult[] = [
  { lab_id: 'LAB-002095', patient_id: 'PAT-001997', encounter_id: 'ENC-0005422', test_name: 'Glucose, Fasting', test_code: '1558-6', value: 5.0, unit: 'mmol/L', reference_range_low: 3.9, reference_range_high: 6.1, abnormal_flag: false, collected_date: '2025-09-05' },
  { lab_id: 'LAB-002717', patient_id: 'PAT-001421', encounter_id: 'ENC-0000388', test_name: 'Hemoglobin', test_code: '718-7', value: 127.0, unit: 'g/L', reference_range_low: 120.0, reference_range_high: 170.0, abnormal_flag: false, collected_date: '2025-10-15' },
  { lab_id: 'LAB-001463', patient_id: 'PAT-000108', encounter_id: 'ENC-0007123', test_name: 'LDL Cholesterol', test_code: '2089-1', value: 2.57, unit: 'mmol/L', reference_range_low: 1.5, reference_range_high: 3.4, abnormal_flag: false, collected_date: '2023-09-29' },
  { lab_id: 'LAB-001074', patient_id: 'PAT-001116', encounter_id: 'ENC-0009573', test_name: 'Troponin I', test_code: '10839-9', value: 0.02, unit: 'ng/mL', reference_range_low: 0.0, reference_range_high: 0.04, abnormal_flag: false, collected_date: '2025-05-08' },
  { lab_id: 'LAB-000103', patient_id: 'PAT-001421', encounter_id: 'ENC-0000810', test_name: 'Troponin I', test_code: '10839-9', value: 0.02, unit: 'ng/mL', reference_range_low: 0.0, reference_range_high: 0.04, abnormal_flag: false, collected_date: '2024-10-14' },
  { lab_id: 'LAB-000476', patient_id: 'PAT-001894', encounter_id: 'ENC-0004599', test_name: 'Glucose, Fasting', test_code: '1558-6', value: 8.74, unit: 'mmol/L', reference_range_low: 3.9, reference_range_high: 6.1, abnormal_flag: true, collected_date: '2023-08-02' },
  { lab_id: 'LAB-001949', patient_id: 'PAT-001177', encounter_id: 'ENC-0009243', test_name: 'Creatinine', test_code: '2160-0', value: 56.0, unit: 'umol/L', reference_range_low: 60.0, reference_range_high: 110.0, abnormal_flag: true, collected_date: '2025-01-06' },
  { lab_id: 'LAB-000837', patient_id: 'PAT-001894', encounter_id: 'ENC-0006312', test_name: 'Total Cholesterol', test_code: '2093-3', value: 4.35, unit: 'mmol/L', reference_range_low: 3.5, reference_range_high: 5.2, abnormal_flag: false, collected_date: '2025-07-22' },
];

export const medications: Medication[] = [
  { medication_id: 'MED-003782', patient_id: 'PAT-001747', drug_name: 'furosemide', drug_code: '02572996', dosage: '20mg', frequency: 'once daily', route: 'oral', prescriber: 'Dr. John Taylor', start_date: '2024-09-15', end_date: null, active: true },
  { medication_id: 'MED-001669', patient_id: 'PAT-001645', drug_name: 'metoprolol', drug_code: '02660000', dosage: '100mg', frequency: 'twice daily', route: 'oral', prescriber: 'Dr. John Taylor', start_date: '2025-03-19', end_date: '2025-08-31', active: false },
  { medication_id: 'MED-001965', patient_id: 'PAT-001645', drug_name: 'lisinopril', drug_code: '02179661', dosage: '20mg', frequency: 'once daily', route: 'oral', prescriber: 'Dr. Jason Sandoval', start_date: '2024-06-03', end_date: null, active: true },
  { medication_id: 'MED-002445', patient_id: 'PAT-001668', drug_name: 'pantoprazole', drug_code: '02917755', dosage: '20mg', frequency: 'once daily', route: 'oral', prescriber: 'Dr. Todd Bean', start_date: '2024-08-06', end_date: null, active: true },
  { medication_id: 'MED-003722', patient_id: 'PAT-001668', drug_name: 'acetaminophen', drug_code: '02292877', dosage: '650mg', frequency: 'as needed', route: 'oral', prescriber: 'Dr. Sarah Charles', start_date: '2026-01-27', end_date: '2026-04-30', active: false },
  { medication_id: 'MED-000256', patient_id: 'PAT-000776', drug_name: 'prednisone', drug_code: '02553436', dosage: '20mg', frequency: 'once daily', route: 'oral', prescriber: 'Dr. David Rodriguez', start_date: '2025-07-02', end_date: null, active: true },
  { medication_id: 'MED-001034', patient_id: 'PAT-000776', drug_name: 'amoxicillin', drug_code: '02445119', dosage: '500mg', frequency: 'three times daily', route: 'oral', prescriber: 'Dr. Stephen Singleton', start_date: '2023-10-26', end_date: null, active: true },
  { medication_id: 'MED-004078', patient_id: 'PAT-000776', drug_name: 'amoxicillin', drug_code: '02708185', dosage: '250mg', frequency: 'three times daily', route: 'oral', prescriber: 'Dr. Anthony Miller', start_date: '2024-10-26', end_date: '2025-01-18', active: false },
  { medication_id: 'MED-000795', patient_id: 'PAT-001421', drug_name: 'sitagliptin', drug_code: '02300575', dosage: '50mg', frequency: 'once daily', route: 'oral', prescriber: 'Dr. Grant Porter', start_date: '2025-03-21', end_date: null, active: true },
  { medication_id: 'MED-002465', patient_id: 'PAT-001421', drug_name: 'sertraline', drug_code: '02777889', dosage: '50mg', frequency: 'once daily', route: 'oral', prescriber: 'Dr. Ryan White', start_date: '2024-01-14', end_date: null, active: true },
  { medication_id: 'MED-003115', patient_id: 'PAT-001421', drug_name: 'sitagliptin', drug_code: '02679522', dosage: '25mg', frequency: 'once daily', route: 'oral', prescriber: 'Dr. Michael Lopez', start_date: '2026-01-11', end_date: '2026-06-10', active: false },
  { medication_id: 'MED-002341', patient_id: 'PAT-000096', drug_name: 'sertraline', drug_code: '02175644', dosage: '100mg', frequency: 'once daily', route: 'oral', prescriber: 'Dr. Todd Bean', start_date: '2025-05-06', end_date: null, active: true },
  { medication_id: 'MED-003658', patient_id: 'PAT-000096', drug_name: 'escitalopram', drug_code: '02950641', dosage: '10mg', frequency: 'once daily', route: 'oral', prescriber: 'Dr. Steven Pennington', start_date: '2024-12-16', end_date: '2025-11-30', active: false },
  { medication_id: 'MED-003839', patient_id: 'PAT-000096', drug_name: 'sertraline', drug_code: '02087143', dosage: '100mg', frequency: 'once daily', route: 'oral', prescriber: 'Dr. Nathaniel Perez', start_date: '2025-02-20', end_date: null, active: true },
  { medication_id: 'MED-004201', patient_id: 'PAT-001177', drug_name: 'escitalopram', drug_code: '02027256', dosage: '20mg', frequency: 'once daily', route: 'oral', prescriber: 'Dr. Joshua Gibson', start_date: '2024-08-10', end_date: null, active: true },
  { medication_id: 'MED-000688', patient_id: 'PAT-001792', drug_name: 'pantoprazole', drug_code: '02569613', dosage: '20mg', frequency: 'once daily', route: 'oral', prescriber: 'Dr. Grant Porter', start_date: '2024-03-14', end_date: null, active: true },
  { medication_id: 'MED-000850', patient_id: 'PAT-001792', drug_name: 'omeprazole', drug_code: '02052011', dosage: '40mg', frequency: 'once daily', route: 'oral', prescriber: 'Dr. Jason Sandoval', start_date: '2023-08-25', end_date: null, active: true },
  { medication_id: 'MED-001855', patient_id: 'PAT-001792', drug_name: 'acetaminophen', drug_code: '02987484', dosage: '650mg', frequency: 'as needed', route: 'oral', prescriber: 'Dr. Gregory Wilson', start_date: '2023-12-23', end_date: '2024-03-27', active: false },
  { medication_id: 'MED-000560', patient_id: 'PAT-000108', drug_name: 'insulin glargine', drug_code: '02143803', dosage: '10 units', frequency: 'once daily', route: 'subcutaneous', prescriber: 'Dr. Brenda Rodriguez', start_date: '2023-12-12', end_date: null, active: true },
  { medication_id: 'MED-001335', patient_id: 'PAT-000108', drug_name: 'ibuprofen', drug_code: '02538321', dosage: '400mg', frequency: 'as needed', route: 'oral', prescriber: 'Dr. Gabrielle Garza', start_date: '2024-07-24', end_date: null, active: true },
  { medication_id: 'MED-001792', patient_id: 'PAT-001918', drug_name: 'prednisone', drug_code: '02165469', dosage: '50mg', frequency: 'once daily', route: 'oral', prescriber: 'Dr. Joshua Wood', start_date: '2024-02-09', end_date: null, active: true },
  { medication_id: 'MED-003426', patient_id: 'PAT-001918', drug_name: 'sertraline', drug_code: '02564255', dosage: '50mg', frequency: 'once daily', route: 'oral', prescriber: 'Dr. Caroline Calderon', start_date: '2024-10-19', end_date: null, active: true },
  { medication_id: 'MED-000626', patient_id: 'PAT-001191', drug_name: 'lisinopril', drug_code: '02270547', dosage: '10mg', frequency: 'once daily', route: 'oral', prescriber: 'Dr. Joshua Wood', start_date: '2026-01-06', end_date: '2026-02-14', active: false },
  { medication_id: 'MED-000807', patient_id: 'PAT-001191', drug_name: 'acetaminophen', drug_code: '02588374', dosage: '650mg', frequency: 'as needed', route: 'oral', prescriber: 'Dr. Bryan Barajas', start_date: '2023-11-17', end_date: '2024-08-08', active: false },
  { medication_id: 'MED-000903', patient_id: 'PAT-001191', drug_name: 'acetaminophen', drug_code: '02044673', dosage: '650mg', frequency: 'as needed', route: 'oral', prescriber: 'Dr. Bryan Barajas', start_date: '2025-05-09', end_date: null, active: true },
  { medication_id: 'MED-001685', patient_id: 'PAT-000045', drug_name: 'amoxicillin', drug_code: '02899608', dosage: '250mg', frequency: 'three times daily', route: 'oral', prescriber: 'Dr. Lisa Smith', start_date: '2025-07-03', end_date: null, active: true },
  { medication_id: 'MED-003371', patient_id: 'PAT-000045', drug_name: 'amoxicillin', drug_code: '02824737', dosage: '250mg', frequency: 'three times daily', route: 'oral', prescriber: 'Dr. Amanda Pace', start_date: '2023-03-26', end_date: null, active: true },
  { medication_id: 'MED-000653', patient_id: 'PAT-001894', drug_name: 'amlodipine', drug_code: '02320539', dosage: '5mg', frequency: 'once daily', route: 'oral', prescriber: 'Dr. Mark Wright', start_date: '2026-01-31', end_date: '2027-01-29', active: false },
  { medication_id: 'MED-003640', patient_id: 'PAT-001997', drug_name: 'pantoprazole', drug_code: '02442231', dosage: '20mg', frequency: 'once daily', route: 'oral', prescriber: 'Dr. Stephen Singleton', start_date: '2025-07-23', end_date: null, active: true },
  { medication_id: 'MED-000079', patient_id: 'PAT-000144', drug_name: 'gabapentin', drug_code: '02354335', dosage: '300mg', frequency: 'three times daily', route: 'oral', prescriber: 'Dr. Deborah Jordan', start_date: '2023-01-17', end_date: null, active: true },
  { medication_id: 'MED-002138', patient_id: 'PAT-000144', drug_name: 'escitalopram', drug_code: '02372682', dosage: '20mg', frequency: 'once daily', route: 'oral', prescriber: 'Dr. Lisa Fox', start_date: '2025-11-05', end_date: null, active: true },
  { medication_id: 'MED-002894', patient_id: 'PAT-000144', drug_name: 'acetaminophen', drug_code: '02437397', dosage: '650mg', frequency: 'as needed', route: 'oral', prescriber: 'Dr. John Taylor', start_date: '2025-08-15', end_date: null, active: true },
  { medication_id: 'MED-000551', patient_id: 'PAT-001233', drug_name: 'amlodipine', drug_code: '02558816', dosage: '10mg', frequency: 'once daily', route: 'oral', prescriber: 'Dr. David Rodriguez', start_date: '2025-05-23', end_date: null, active: true },
  { medication_id: 'MED-003158', patient_id: 'PAT-001233', drug_name: 'amoxicillin', drug_code: '02302546', dosage: '250mg', frequency: 'three times daily', route: 'oral', prescriber: 'Dr. Brandon Davis', start_date: '2024-07-24', end_date: null, active: true },
  { medication_id: 'MED-000101', patient_id: 'PAT-001124', drug_name: 'acetaminophen', drug_code: '02495046', dosage: '325mg', frequency: 'as needed', route: 'oral', prescriber: 'Dr. Stephen Singleton', start_date: '2025-04-03', end_date: '2025-06-25', active: false },
  { medication_id: 'MED-003442', patient_id: 'PAT-001124', drug_name: 'gabapentin', drug_code: '02323202', dosage: '600mg', frequency: 'three times daily', route: 'oral', prescriber: 'Dr. Joshua Gibson', start_date: '2023-01-23', end_date: null, active: true },
  { medication_id: 'MED-001622', patient_id: 'PAT-000008', drug_name: 'sitagliptin', drug_code: '02653064', dosage: '25mg', frequency: 'once daily', route: 'oral', prescriber: 'Dr. Michael Lopez', start_date: '2025-12-04', end_date: null, active: true },
  { medication_id: 'MED-002815', patient_id: 'PAT-000008', drug_name: 'metoprolol', drug_code: '02680581', dosage: '100mg', frequency: 'twice daily', route: 'oral', prescriber: 'Dr. Cassandra Miller', start_date: '2025-08-02', end_date: null, active: true },
  { medication_id: 'MED-003753', patient_id: 'PAT-000008', drug_name: 'pantoprazole', drug_code: '02828816', dosage: '20mg', frequency: 'once daily', route: 'oral', prescriber: 'Dr. Christopher Moore', start_date: '2025-08-08', end_date: '2025-11-11', active: false },
];

export const allergies: Allergy[] = [
  { allergy_id: 'ALG-001', patient_id: 'PAT-001747', allergen: 'Penicillin', reaction: 'Anaphylaxis', severity: 'severe' },
  { allergy_id: 'ALG-002', patient_id: 'PAT-001645', allergen: 'Sulfonamides', reaction: 'Rash', severity: 'moderate' },
  { allergy_id: 'ALG-003', patient_id: 'PAT-001668', allergen: 'Latex', reaction: 'Contact dermatitis', severity: 'moderate' },
  { allergy_id: 'ALG-004', patient_id: 'PAT-000776', allergen: 'Penicillin', reaction: 'Hives', severity: 'moderate' },
  { allergy_id: 'ALG-005', patient_id: 'PAT-000776', allergen: 'Ibuprofen', reaction: 'GI bleeding', severity: 'severe' },
  { allergy_id: 'ALG-006', patient_id: 'PAT-001421', allergen: 'Codeine', reaction: 'Nausea / vomiting', severity: 'mild' },
  { allergy_id: 'ALG-007', patient_id: 'PAT-001116', allergen: 'ASA (Aspirin)', reaction: 'Bronchospasm', severity: 'severe' },
  { allergy_id: 'ALG-008', patient_id: 'PAT-001894', allergen: 'Egg', reaction: 'Anaphylaxis', severity: 'severe' },
  { allergy_id: 'ALG-009', patient_id: 'PAT-000144', allergen: 'Morphine', reaction: 'Respiratory depression', severity: 'severe' },
  { allergy_id: 'ALG-010', patient_id: 'PAT-000144', allergen: 'Shellfish', reaction: 'Urticaria', severity: 'moderate' },
  { allergy_id: 'ALG-011', patient_id: 'PAT-001124', allergen: 'Penicillin', reaction: 'Anaphylaxis', severity: 'severe' },
  { allergy_id: 'ALG-012', patient_id: 'PAT-001124', allergen: 'Sulfonamides', reaction: 'Stevens-Johnson syndrome', severity: 'severe' },
  { allergy_id: 'ALG-013', patient_id: 'PAT-000008', allergen: 'Contrast dye', reaction: 'Anaphylactoid reaction', severity: 'severe' },
];

// ─────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────
export function getAllEncountersWithPatients() {
  const now = new Date();
  return encounters.map((enc) => {
    const patient = patients.find((p) => p.patient_id === enc.patient_id) ?? null;
    const encVitals = vitals.find((v) => v.encounter_id === enc.encounter_id) ?? null;
    const encLabs = labResults.filter((l) => l.encounter_id === enc.encounter_id);
    const encMeds = medications.filter((m) => m.patient_id === enc.patient_id);
    const encAllergies = allergies.filter((a) => a.patient_id === enc.patient_id);

    const minutesSinceArrival = Math.max(0, (now.getTime() - new Date(enc.encounter_date).getTime()) / 60000);
    const serviceLine = mapServiceLine(enc.chief_complaint);
    const journeyStatus = mapJourneyStatus(enc.triage_level, minutesSinceArrival);
    const estimatedWaitMinutes = computeEstimatedWait(enc.triage_level, minutesSinceArrival, journeyStatus);

    return {
      ...enc,
      patient,
      vitals: encVitals,
      labs: encLabs,
      medications: encMeds,
      allergies: encAllergies,
      serviceLine,
      journeyStatus,
      estimatedWaitMinutes,
    };
  });
}

export function getEncounterWithPatient(encounterId: string) {
  const encounter = encounters.find((e) => e.encounter_id === encounterId);
  if (!encounter) return null;
  const patient = patients.find((p) => p.patient_id === encounter.patient_id) ?? null;
  const encVitals = vitals.find((v) => v.encounter_id === encounterId) ?? null;
  const encLabs = labResults.filter((l) => l.encounter_id === encounterId);
  const encMeds = medications.filter((m) => m.patient_id === encounter.patient_id);
  const encAllergies = allergies.filter((a) => a.patient_id === encounter.patient_id);
  return { encounter, patient, vitals: encVitals, labs: encLabs, medications: encMeds, allergies: encAllergies };
}
