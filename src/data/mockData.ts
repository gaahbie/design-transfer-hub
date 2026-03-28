// Mock data for the Care Platform Worker Dashboard

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

// ─────────────────────────────────────────────
// SERVICE LINE DATA
// ─────────────────────────────────────────────
export const encounterServiceData: Record<
  string,
  { serviceLine: ServiceLine; journeyStatus: JourneyStatus; estimatedWaitMinutes: number }
> = {
  E001: { serviceLine: 'doctor',     journeyStatus: 'In Progress',          estimatedWaitMinutes: 0  },
  E002: { serviceLine: 'blood-work', journeyStatus: 'Awaiting Lab Results', estimatedWaitMinutes: 18 },
  E003: { serviceLine: 'pharmacy',   journeyStatus: 'Awaiting Medication',  estimatedWaitMinutes: 12 },
  E004: { serviceLine: 'blood-work', journeyStatus: 'In Progress',          estimatedWaitMinutes: 8  },
  E005: { serviceLine: 'imaging',    journeyStatus: 'Waiting',              estimatedWaitMinutes: 38 },
  E006: { serviceLine: 'doctor',     journeyStatus: 'In Progress',          estimatedWaitMinutes: 0  },
  E007: { serviceLine: 'imaging',    journeyStatus: 'Waiting',              estimatedWaitMinutes: 52 },
  E008: { serviceLine: 'blood-work', journeyStatus: 'Awaiting Lab Results', estimatedWaitMinutes: 22 },
  E009: { serviceLine: 'doctor',     journeyStatus: 'In Progress',          estimatedWaitMinutes: 0  },
  E010: { serviceLine: 'pharmacy',   journeyStatus: 'Waiting',              estimatedWaitMinutes: 20 },
};

// ─────────────────────────────────────────────
// PATIENTS
// ─────────────────────────────────────────────
export const patients: Patient[] = [
  {
    patient_id: 'P001',
    first_name: 'Devon',
    last_name: 'Lane',
    date_of_birth: '1978-05-12',
    age: 46,
    sex: 'Female',
    postal_code: 'M5H 2N2',
    blood_type: 'O+',
    insurance_number: 'INS-001234',
    primary_language: 'English',
    emergency_contact_phone: '+1-416-555-0123',
  },
  {
    patient_id: 'P002',
    first_name: 'Kathryn',
    last_name: 'Murphy',
    date_of_birth: '1985-11-22',
    age: 39,
    sex: 'Female',
    postal_code: 'M4B 1B3',
    blood_type: 'A+',
    insurance_number: 'INS-002345',
    primary_language: 'English',
    emergency_contact_phone: '+1-416-555-0234',
  },
  {
    patient_id: 'P003',
    first_name: 'Brooklyn',
    last_name: 'Simmons',
    date_of_birth: '1990-03-08',
    age: 34,
    sex: 'Female',
    postal_code: 'M6K 3P6',
    blood_type: 'B+',
    insurance_number: 'INS-003456',
    primary_language: 'English',
    emergency_contact_phone: '+1-416-555-0345',
  },
  {
    patient_id: 'P004',
    first_name: 'Jerome',
    last_name: 'Bell',
    date_of_birth: '1972-08-15',
    age: 52,
    sex: 'Male',
    postal_code: 'M5A 1A1',
    blood_type: 'AB+',
    insurance_number: 'INS-004567',
    primary_language: 'English',
    emergency_contact_phone: '+1-416-555-0456',
  },
  {
    patient_id: 'P005',
    first_name: 'Ronald',
    last_name: 'Richards',
    date_of_birth: '1979-02-20',
    age: 45,
    sex: 'Male',
    postal_code: 'M2N 6K1',
    blood_type: 'O+',
    insurance_number: 'INS-005678',
    primary_language: 'English',
    emergency_contact_phone: '+1-416-555-0567',
  },
  {
    patient_id: 'P006',
    first_name: 'Marcus',
    last_name: 'Webb',
    date_of_birth: '1957-07-19',
    age: 67,
    sex: 'Male',
    postal_code: 'M3H 4K2',
    blood_type: 'A-',
    insurance_number: 'INS-006789',
    primary_language: 'English',
    emergency_contact_phone: '+1-416-555-0678',
  },
  {
    patient_id: 'P007',
    first_name: 'Sarah',
    last_name: 'Kim',
    date_of_birth: '1996-04-03',
    age: 28,
    sex: 'Female',
    postal_code: 'M6G 3B5',
    blood_type: 'B-',
    insurance_number: 'INS-007890',
    primary_language: 'Korean',
    emergency_contact_phone: '+1-416-555-0789',
  },
  {
    patient_id: 'P008',
    first_name: 'Henry',
    last_name: 'Torres',
    date_of_birth: '1969-09-11',
    age: 55,
    sex: 'Male',
    postal_code: 'M5V 2T6',
    blood_type: 'O-',
    insurance_number: 'INS-008901',
    primary_language: 'Spanish',
    emergency_contact_phone: '+1-416-555-0890',
  },
  {
    patient_id: 'P009',
    first_name: 'Amara',
    last_name: 'Osei',
    date_of_birth: '1982-01-25',
    age: 42,
    sex: 'Female',
    postal_code: 'M4C 1E1',
    blood_type: 'AB-',
    insurance_number: 'INS-009012',
    primary_language: 'French',
    emergency_contact_phone: '+1-416-555-0901',
  },
  {
    patient_id: 'P010',
    first_name: 'Liam',
    last_name: 'Chen',
    date_of_birth: '1993-06-30',
    age: 31,
    sex: 'Male',
    postal_code: 'M5T 1B8',
    blood_type: 'A+',
    insurance_number: 'INS-010123',
    primary_language: 'Mandarin',
    emergency_contact_phone: '+1-416-555-1012',
  },
];

// ─────────────────────────────────────────────
// ENCOUNTERS
// ─────────────────────────────────────────────
export const encounters: Encounter[] = [
  {
    encounter_id: 'E001',
    patient_id: 'P001',
    encounter_date: '2024-03-28T08:30:00',
    encounter_type: 'Emergency',
    facility: 'Toronto General Hospital',
    chief_complaint: 'Chest pain and shortness of breath',
    diagnosis_code: 'I20.0',
    diagnosis_description: 'Unstable angina',
    triage_level: 2,
    disposition: 'Admitted',
    length_of_stay_hours: 6.5,
    attending_physician: 'Dr. Sarah Chen',
  },
  {
    encounter_id: 'E002',
    patient_id: 'P002',
    encounter_date: '2024-03-28T09:15:00',
    encounter_type: 'Emergency',
    facility: 'Toronto General Hospital',
    chief_complaint: 'Severe headache and blurred vision',
    diagnosis_code: 'G43.1',
    diagnosis_description: 'Migraine with aura',
    triage_level: 3,
    disposition: 'Observation',
    length_of_stay_hours: 4.0,
    attending_physician: 'Dr. James Wilson',
  },
  {
    encounter_id: 'E003',
    patient_id: 'P003',
    encounter_date: '2024-03-28T10:00:00',
    encounter_type: 'Emergency',
    facility: 'Toronto General Hospital',
    chief_complaint: 'Minor laceration to left hand',
    diagnosis_code: 'S61.411A',
    diagnosis_description: 'Laceration without foreign body of left hand',
    triage_level: 4,
    disposition: 'Discharged',
    length_of_stay_hours: 2.0,
    attending_physician: 'Dr. Emily Rodriguez',
  },
  {
    encounter_id: 'E004',
    patient_id: 'P004',
    encounter_date: '2024-03-28T07:45:00',
    encounter_type: 'Emergency',
    facility: 'Toronto General Hospital',
    chief_complaint: 'Fever, productive cough, and difficulty breathing',
    diagnosis_code: 'J18.9',
    diagnosis_description: 'Pneumonia, unspecified organism',
    triage_level: 3,
    disposition: 'Admitted',
    length_of_stay_hours: 5.5,
    attending_physician: 'Dr. Michael Thompson',
  },
  {
    encounter_id: 'E005',
    patient_id: 'P005',
    encounter_date: '2024-03-28T11:30:00',
    encounter_type: 'Emergency',
    facility: 'Toronto General Hospital',
    chief_complaint: 'Acute RLQ abdominal pain and nausea',
    diagnosis_code: 'K35.80',
    diagnosis_description: 'Acute appendicitis',
    triage_level: 3,
    disposition: 'Surgery scheduled',
    length_of_stay_hours: 3.0,
    attending_physician: 'Dr. Lisa Park',
  },
  {
    encounter_id: 'E006',
    patient_id: 'P006',
    encounter_date: '2024-03-28T07:10:00',
    encounter_type: 'Emergency',
    facility: 'Toronto General Hospital',
    chief_complaint: 'Chest tightness, diaphoresis, and left arm pain',
    diagnosis_code: 'I21.9',
    diagnosis_description: 'Acute myocardial infarction, unspecified',
    triage_level: 2,
    disposition: 'Admitted — Cath Lab',
    length_of_stay_hours: 8.0,
    attending_physician: 'Dr. Sarah Chen',
  },
  {
    encounter_id: 'E007',
    patient_id: 'P007',
    encounter_date: '2024-03-28T10:45:00',
    encounter_type: 'Urgent Care',
    facility: 'Toronto General Hospital',
    chief_complaint: 'Left ankle swelling and pain after fall',
    diagnosis_code: 'S93.401A',
    diagnosis_description: 'Sprain of unspecified ligament of left ankle',
    triage_level: 4,
    disposition: 'Discharged',
    length_of_stay_hours: 2.5,
    attending_physician: 'Dr. Emily Rodriguez',
  },
  {
    encounter_id: 'E008',
    patient_id: 'P008',
    encounter_date: '2024-03-28T09:50:00',
    encounter_type: 'Emergency',
    facility: 'Toronto General Hospital',
    chief_complaint: 'Polyuria, polydipsia, and altered mental status',
    diagnosis_code: 'E11.65',
    diagnosis_description: 'Diabetic ketoacidosis',
    triage_level: 3,
    disposition: 'Admitted',
    length_of_stay_hours: 7.0,
    attending_physician: 'Dr. Michael Thompson',
  },
  {
    encounter_id: 'E009',
    patient_id: 'P009',
    encounter_date: '2024-03-28T07:00:00',
    encounter_type: 'Emergency',
    facility: 'Toronto General Hospital',
    chief_complaint: 'Severe respiratory distress and hypoxia',
    diagnosis_code: 'J96.00',
    diagnosis_description: 'Acute respiratory failure, unspecified',
    triage_level: 1,
    disposition: 'Admitted — ICU',
    length_of_stay_hours: 12.0,
    attending_physician: 'Dr. James Wilson',
  },
  {
    encounter_id: 'E010',
    patient_id: 'P010',
    encounter_date: '2024-03-28T12:00:00',
    encounter_type: 'Urgent Care',
    facility: 'Toronto General Hospital',
    chief_complaint: 'Sore throat, low-grade fever, and fatigue',
    diagnosis_code: 'J02.9',
    diagnosis_description: 'Acute pharyngitis, unspecified',
    triage_level: 5,
    disposition: 'Discharged',
    length_of_stay_hours: 1.0,
    attending_physician: 'Dr. Emily Rodriguez',
  },
];

// ─────────────────────────────────────────────
// VITALS
// ─────────────────────────────────────────────
export const vitals: Vitals[] = [
  {
    vitals_id: 'V001', patient_id: 'P001', encounter_id: 'E001',
    heart_rate: 105, systolic_bp: 160, diastolic_bp: 95,
    temperature_celsius: 37.2, respiratory_rate: 22, o2_saturation: 94,
    pain_scale: 7, recorded_at: '2024-03-28T08:45:00',
  },
  {
    vitals_id: 'V002', patient_id: 'P002', encounter_id: 'E002',
    heart_rate: 88, systolic_bp: 145, diastolic_bp: 90,
    temperature_celsius: 37.0, respiratory_rate: 18, o2_saturation: 98,
    pain_scale: 8, recorded_at: '2024-03-28T09:30:00',
  },
  {
    vitals_id: 'V003', patient_id: 'P003', encounter_id: 'E003',
    heart_rate: 72, systolic_bp: 118, diastolic_bp: 76,
    temperature_celsius: 36.8, respiratory_rate: 16, o2_saturation: 99,
    pain_scale: 3, recorded_at: '2024-03-28T10:15:00',
  },
  {
    vitals_id: 'V004', patient_id: 'P004', encounter_id: 'E004',
    heart_rate: 96, systolic_bp: 135, diastolic_bp: 82,
    temperature_celsius: 38.9, respiratory_rate: 24, o2_saturation: 91,
    pain_scale: 5, recorded_at: '2024-03-28T08:00:00',
  },
  {
    vitals_id: 'V005', patient_id: 'P005', encounter_id: 'E005',
    heart_rate: 92, systolic_bp: 128, diastolic_bp: 80,
    temperature_celsius: 37.5, respiratory_rate: 20, o2_saturation: 97,
    pain_scale: 7, recorded_at: '2024-03-28T11:45:00',
  },
  {
    vitals_id: 'V006', patient_id: 'P006', encounter_id: 'E006',
    heart_rate: 118, systolic_bp: 158, diastolic_bp: 96,
    temperature_celsius: 37.1, respiratory_rate: 20, o2_saturation: 93,
    pain_scale: 8, recorded_at: '2024-03-28T07:25:00',
  },
  {
    vitals_id: 'V007', patient_id: 'P007', encounter_id: 'E007',
    heart_rate: 75, systolic_bp: 120, diastolic_bp: 78,
    temperature_celsius: 36.9, respiratory_rate: 16, o2_saturation: 99,
    pain_scale: 5, recorded_at: '2024-03-28T11:00:00',
  },
  {
    vitals_id: 'V008', patient_id: 'P008', encounter_id: 'E008',
    heart_rate: 112, systolic_bp: 142, diastolic_bp: 88,
    temperature_celsius: 37.6, respiratory_rate: 24, o2_saturation: 96,
    pain_scale: 4, recorded_at: '2024-03-28T10:05:00',
  },
  {
    vitals_id: 'V009', patient_id: 'P009', encounter_id: 'E009',
    heart_rate: 136, systolic_bp: 88, diastolic_bp: 58,
    temperature_celsius: 37.8, respiratory_rate: 34, o2_saturation: 86,
    pain_scale: 6, recorded_at: '2024-03-28T07:15:00',
  },
  {
    vitals_id: 'V010', patient_id: 'P010', encounter_id: 'E010',
    heart_rate: 78, systolic_bp: 118, diastolic_bp: 74,
    temperature_celsius: 37.4, respiratory_rate: 15, o2_saturation: 99,
    pain_scale: 2, recorded_at: '2024-03-28T12:15:00',
  },
];

// ─────────────────────────────────────────────
// LAB RESULTS
// ─────────────────────────────────────────────
export const labResults: LabResult[] = [
  // E001 Devon Lane — Chest pain
  { lab_id: 'L001', patient_id: 'P001', encounter_id: 'E001', test_name: 'Troponin I', test_code: 'TROP', value: 0.8, unit: 'ng/mL', reference_range_low: 0, reference_range_high: 0.04, abnormal_flag: true, collected_date: '2024-03-28T09:00:00' },
  { lab_id: 'L002', patient_id: 'P001', encounter_id: 'E001', test_name: 'D-Dimer', test_code: 'DDIM', value: 650, unit: 'ng/mL', reference_range_low: 0, reference_range_high: 500, abnormal_flag: true, collected_date: '2024-03-28T09:00:00' },
  { lab_id: 'L003', patient_id: 'P001', encounter_id: 'E001', test_name: 'Hemoglobin', test_code: 'HGB', value: 12.5, unit: 'g/dL', reference_range_low: 12.0, reference_range_high: 16.0, abnormal_flag: false, collected_date: '2024-03-28T09:00:00' },
  // E002 Kathryn Murphy — Headache
  { lab_id: 'L004', patient_id: 'P002', encounter_id: 'E002', test_name: 'Glucose', test_code: 'GLU', value: 95, unit: 'mg/dL', reference_range_low: 70, reference_range_high: 100, abnormal_flag: false, collected_date: '2024-03-28T09:45:00' },
  // E004 Jerome Bell — Pneumonia
  { lab_id: 'L006', patient_id: 'P004', encounter_id: 'E004', test_name: 'White Blood Cell Count', test_code: 'WBC', value: 15.2, unit: 'x10^9/L', reference_range_low: 4.0, reference_range_high: 11.0, abnormal_flag: true, collected_date: '2024-03-28T08:15:00' },
  { lab_id: 'L007', patient_id: 'P004', encounter_id: 'E004', test_name: 'C-Reactive Protein', test_code: 'CRP', value: 85, unit: 'mg/L', reference_range_low: 0, reference_range_high: 10, abnormal_flag: true, collected_date: '2024-03-28T08:15:00' },
  { lab_id: 'L008', patient_id: 'P004', encounter_id: 'E004', test_name: 'Procalcitonin', test_code: 'PCT', value: 1.8, unit: 'ng/mL', reference_range_low: 0, reference_range_high: 0.5, abnormal_flag: true, collected_date: '2024-03-28T08:15:00' },
  // E005 Ronald Richards — Appendicitis
  { lab_id: 'L009', patient_id: 'P005', encounter_id: 'E005', test_name: 'White Blood Cell Count', test_code: 'WBC', value: 16.8, unit: 'x10^9/L', reference_range_low: 4.0, reference_range_high: 11.0, abnormal_flag: true, collected_date: '2024-03-28T12:00:00' },
  { lab_id: 'L010', patient_id: 'P005', encounter_id: 'E005', test_name: 'C-Reactive Protein', test_code: 'CRP', value: 45, unit: 'mg/L', reference_range_low: 0, reference_range_high: 10, abnormal_flag: true, collected_date: '2024-03-28T12:00:00' },
  // E006 Marcus Webb — Acute MI
  { lab_id: 'L011', patient_id: 'P006', encounter_id: 'E006', test_name: 'Troponin I', test_code: 'TROP', value: 1.4, unit: 'ng/mL', reference_range_low: 0, reference_range_high: 0.04, abnormal_flag: true, collected_date: '2024-03-28T07:30:00' },
  { lab_id: 'L012', patient_id: 'P006', encounter_id: 'E006', test_name: 'BNP', test_code: 'BNP', value: 480, unit: 'pg/mL', reference_range_low: 0, reference_range_high: 100, abnormal_flag: true, collected_date: '2024-03-28T07:30:00' },
  // E008 Henry Torres — DKA
  { lab_id: 'L013', patient_id: 'P008', encounter_id: 'E008', test_name: 'Glucose', test_code: 'GLU', value: 412, unit: 'mg/dL', reference_range_low: 70, reference_range_high: 100, abnormal_flag: true, collected_date: '2024-03-28T10:10:00' },
  { lab_id: 'L014', patient_id: 'P008', encounter_id: 'E008', test_name: 'Ketones', test_code: 'KET', value: 4.2, unit: 'mmol/L', reference_range_low: 0, reference_range_high: 0.6, abnormal_flag: true, collected_date: '2024-03-28T10:10:00' },
  // E009 Amara Osei — Respiratory failure
  { lab_id: 'L015', patient_id: 'P009', encounter_id: 'E009', test_name: 'Lactate', test_code: 'LAC', value: 4.8, unit: 'mmol/L', reference_range_low: 0.5, reference_range_high: 2.0, abnormal_flag: true, collected_date: '2024-03-28T07:20:00' },
  { lab_id: 'L016', patient_id: 'P009', encounter_id: 'E009', test_name: 'PaO2', test_code: 'PAO2', value: 48, unit: 'mmHg', reference_range_low: 80, reference_range_high: 100, abnormal_flag: true, collected_date: '2024-03-28T07:20:00' },
];

// ─────────────────────────────────────────────
// MEDICATIONS
// ─────────────────────────────────────────────
export const medications: Medication[] = [
  { medication_id: 'M001', patient_id: 'P001', drug_name: 'Aspirin', drug_code: 'ASA', dosage: '325 mg', frequency: 'Once daily', route: 'Oral', prescriber: 'Dr. Sarah Chen', start_date: '2023-06-15', end_date: null, active: true },
  { medication_id: 'M002', patient_id: 'P001', drug_name: 'Atorvastatin', drug_code: 'ATV', dosage: '40 mg', frequency: 'Once daily at bedtime', route: 'Oral', prescriber: 'Dr. Sarah Chen', start_date: '2023-06-15', end_date: null, active: true },
  { medication_id: 'M003', patient_id: 'P001', drug_name: 'Metoprolol', drug_code: 'MET', dosage: '50 mg', frequency: 'Twice daily', route: 'Oral', prescriber: 'Dr. Sarah Chen', start_date: '2024-03-28', end_date: null, active: true },
  { medication_id: 'M004', patient_id: 'P002', drug_name: 'Sumatriptan', drug_code: 'SUM', dosage: '50 mg', frequency: 'As needed', route: 'Oral', prescriber: 'Dr. James Wilson', start_date: '2023-11-10', end_date: null, active: true },
  { medication_id: 'M005', patient_id: 'P002', drug_name: 'Propranolol', drug_code: 'PROP', dosage: '40 mg', frequency: 'Twice daily', route: 'Oral', prescriber: 'Dr. James Wilson', start_date: '2023-11-10', end_date: null, active: true },
  { medication_id: 'M006', patient_id: 'P004', drug_name: 'Ceftriaxone', drug_code: 'CFT', dosage: '1 g', frequency: 'Every 12 hours', route: 'IV', prescriber: 'Dr. Michael Thompson', start_date: '2024-03-28', end_date: null, active: true },
  { medication_id: 'M007', patient_id: 'P004', drug_name: 'Azithromycin', drug_code: 'AZI', dosage: '500 mg', frequency: 'Once daily', route: 'Oral', prescriber: 'Dr. Michael Thompson', start_date: '2024-03-28', end_date: null, active: true },
  { medication_id: 'M008', patient_id: 'P004', drug_name: 'Acetaminophen', drug_code: 'APAP', dosage: '650 mg', frequency: 'Every 6 hours as needed', route: 'Oral', prescriber: 'Dr. Michael Thompson', start_date: '2024-03-28', end_date: null, active: true },
  { medication_id: 'M009', patient_id: 'P005', drug_name: 'Morphine', drug_code: 'MOR', dosage: '5 mg', frequency: 'Every 4 hours as needed', route: 'IV', prescriber: 'Dr. Lisa Park', start_date: '2024-03-28', end_date: null, active: true },
  { medication_id: 'M010', patient_id: 'P005', drug_name: 'Ondansetron', drug_code: 'OND', dosage: '4 mg', frequency: 'Every 8 hours as needed', route: 'IV', prescriber: 'Dr. Lisa Park', start_date: '2024-03-28', end_date: null, active: true },
  { medication_id: 'M011', patient_id: 'P006', drug_name: 'Nitroglycerin', drug_code: 'NTG', dosage: '0.4 mg', frequency: 'As needed (SL)', route: 'Sublingual', prescriber: 'Dr. Sarah Chen', start_date: '2024-03-28', end_date: null, active: true },
  { medication_id: 'M012', patient_id: 'P008', drug_name: 'Insulin Regular', drug_code: 'INS', dosage: '0.1 U/kg/hr', frequency: 'Continuous infusion', route: 'IV', prescriber: 'Dr. Michael Thompson', start_date: '2024-03-28', end_date: null, active: true },
  { medication_id: 'M013', patient_id: 'P009', drug_name: 'Norepinephrine', drug_code: 'NE', dosage: '0.1 mcg/kg/min', frequency: 'Continuous infusion', route: 'IV', prescriber: 'Dr. James Wilson', start_date: '2024-03-28', end_date: null, active: true },
  { medication_id: 'M014', patient_id: 'P010', drug_name: 'Amoxicillin', drug_code: 'AMX', dosage: '500 mg', frequency: 'Three times daily', route: 'Oral', prescriber: 'Dr. Emily Rodriguez', start_date: '2024-03-28', end_date: null, active: true },
];

// ─────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────
export function getPatientById(patientId: string): Patient | undefined {
  return patients.find(p => p.patient_id === patientId);
}

export function getEncounterById(encounterId: string): Encounter | undefined {
  return encounters.find(e => e.encounter_id === encounterId);
}

export function getVitalsByEncounterId(encounterId: string): Vitals | undefined {
  return vitals.find(v => v.encounter_id === encounterId);
}

export function getLabResultsByEncounterId(encounterId: string): LabResult[] {
  return labResults.filter(l => l.encounter_id === encounterId);
}

export function getMedicationsByPatientId(patientId: string): Medication[] {
  return medications.filter(m => m.patient_id === patientId && m.active);
}

export function getEncounterWithPatient(encounterId: string) {
  const encounter = getEncounterById(encounterId);
  if (!encounter) return null;
  const patient = getPatientById(encounter.patient_id);
  const encounterVitals = getVitalsByEncounterId(encounterId);
  const encounterLabs = getLabResultsByEncounterId(encounterId);
  const patientMeds = getMedicationsByPatientId(encounter.patient_id);
  return { encounter, patient, vitals: encounterVitals, labs: encounterLabs, medications: patientMeds };
}

export function getAllEncountersWithPatients() {
  const sorted = [...encounters].sort((a, b) => {
    if (a.triage_level !== b.triage_level) return a.triage_level - b.triage_level;
    return new Date(a.encounter_date).getTime() - new Date(b.encounter_date).getTime();
  });

  return sorted.map((encounter, idx) => {
    const patient = getPatientById(encounter.patient_id);
    const encounterVitals = getVitalsByEncounterId(encounter.encounter_id);
    const encounterLabs = getLabResultsByEncounterId(encounter.encounter_id);
    const serviceInfo = encounterServiceData[encounter.encounter_id];

    const hasAbnormalLabs = encounterLabs.some(l => l.abnormal_flag);
    const hasAbnormalVitals = encounterVitals
      ? encounterVitals.o2_saturation < 95 ||
        encounterVitals.systolic_bp > 140 ||
        encounterVitals.heart_rate > 100 ||
        encounterVitals.temperature_celsius > 38.0 ||
        encounterVitals.pain_scale > 6
      : false;

    return {
      ...encounter,
      patient,
      vitals: encounterVitals,
      labs: encounterLabs,
      hasClinicalAlerts: hasAbnormalLabs || hasAbnormalVitals,
      queuePosition: idx + 1,
      serviceLine: serviceInfo?.serviceLine ?? ('doctor' as ServiceLine),
      journeyStatus: serviceInfo?.journeyStatus ?? ('Waiting' as JourneyStatus),
      estimatedWaitMinutes: serviceInfo?.estimatedWaitMinutes ?? 30,
    };
  });
}