import type { Staff } from "@/schemas/shared-schema";
import type { Patient } from "@/schemas/patient-schema";
import type { DiagnosisCatalog, Medicine } from "@/schemas/catalog-schema";
import type { Visit } from "@/schemas/visit-schema";
import type { Investigation, PatientAccessToken } from "@/schemas/shared-schema";
import type { Prescription } from "@/schemas/prescription-schema";

// ═══════════════════════════════════════════════════════════════════════════
// STAFF
// ═══════════════════════════════════════════════════════════════════════════

export const mockStaff: Staff[] = [
  { id: "s1", name: "Dr. Anil Sharma", role: "doctor", phone: "9800000001", email: "anil@clinic.com" },
  { id: "s2", name: "Dr. Priya Gupta", role: "doctor", phone: "9800000002", email: "priya@clinic.com" },
  { id: "s3", name: "Ravi Kumar", role: "optometrist", phone: "9800000003" },
  { id: "s4", name: "Sita Thapa", role: "receptionist", phone: "9800000004" },
  { id: "s5", name: "Gita Maharjan", role: "receptionist", phone: "9800000005" },
];

// ═══════════════════════════════════════════════════════════════════════════
// PATIENTS
// ═══════════════════════════════════════════════════════════════════════════

export const mockPatients: Patient[] = [
  {
    id: "p1", first_name: "Ram", last_name: "Shrestha", phone: "9841000001",
    date_of_birth: "1985-03-15", age: 41, sex: "Male", occupation: "Teacher",
    address_street: "Putalisadak", address_city: "Kathmandu", address_state: "Bagmati", address_pin: "44600",
    created_at: "2025-01-10T10:00:00Z", updated_at: "2025-01-10T10:00:00Z",
  },
  {
    id: "p2", first_name: "Sushma", last_name: "Karki", phone: "9841000002",
    date_of_birth: "1970-08-22", age: 55, sex: "Female", occupation: "Homemaker",
    address_street: "New Road", address_city: "Kathmandu", address_state: "Bagmati", address_pin: "44600",
    created_at: "2025-01-12T09:30:00Z", updated_at: "2025-06-15T11:00:00Z",
  },
  {
    id: "p3", first_name: "Bikash", last_name: "Tamang", phone: "9841000003",
    date_of_birth: "1998-12-05", age: 27, sex: "Male", occupation: "Software Developer",
    address_street: "Thamel", address_city: "Kathmandu", address_state: "Bagmati", address_pin: "44600",
    created_at: "2025-02-01T14:00:00Z", updated_at: "2025-02-01T14:00:00Z",
  },
  {
    id: "p4", first_name: "Anita", last_name: "Basnet", phone: "9841000004",
    date_of_birth: "1960-05-10", age: 66, sex: "Female", occupation: "Retired",
    address_street: "Jawalakhel", address_city: "Lalitpur", address_state: "Bagmati", address_pin: "44700",
    created_at: "2025-03-05T08:00:00Z", updated_at: "2025-07-01T09:00:00Z",
  },
  {
    id: "p5", first_name: "Dipesh", last_name: "Adhikari", phone: "9841000005",
    date_of_birth: "2000-11-20", age: 25, sex: "Male", occupation: "Student",
    address_street: "Budhanilkantha", address_city: "Kathmandu", address_state: "Bagmati", address_pin: "44600",
    created_at: "2025-04-10T11:30:00Z", updated_at: "2025-04-10T11:30:00Z",
  },
  {
    id: "p6", first_name: "Kamala", last_name: "Rai", phone: "9841000006",
    date_of_birth: "1988-07-18", age: 37, sex: "Female", occupation: "Nurse",
    address_street: "Dharan", address_city: "Dharan", address_state: "Koshi", address_pin: "56700",
    created_at: "2025-04-15T10:00:00Z", updated_at: "2025-04-15T10:00:00Z",
  },
  {
    id: "p7", first_name: "Hari", last_name: "Pandey", phone: "9841000007",
    date_of_birth: "1975-01-30", age: 51, sex: "Male", occupation: "Farmer",
    address_street: "Pokhara Lakeside", address_city: "Pokhara", address_state: "Gandaki", address_pin: "33700",
    created_at: "2025-05-20T07:00:00Z", updated_at: "2025-05-20T07:00:00Z",
  },
  {
    id: "p8", first_name: "Nirmala", last_name: "Bhandari", phone: "9841000008",
    date_of_birth: "1992-09-12", age: 33, sex: "Female", occupation: "Accountant",
    address_street: "Baluwatar", address_city: "Kathmandu", address_state: "Bagmati", address_pin: "44600",
    created_at: "2025-06-01T13:00:00Z", updated_at: "2025-06-01T13:00:00Z",
  },
  {
    id: "p9", first_name: "Prakash", last_name: "Maharjan", phone: "9841000009",
    date_of_birth: "1955-04-25", age: 71, sex: "Male", occupation: "Retired",
    address_street: "Patan Durbar", address_city: "Lalitpur", address_state: "Bagmati", address_pin: "44700",
    created_at: "2025-06-10T09:00:00Z", updated_at: "2025-07-10T10:00:00Z",
  },
  {
    id: "p10", first_name: "Sarita", last_name: "Gurung", phone: "9841000010",
    date_of_birth: "2005-02-14", age: 21, sex: "Female", occupation: "Student",
    address_street: "Bouddha", address_city: "Kathmandu", address_state: "Bagmati", address_pin: "44600",
    created_at: "2025-07-01T08:00:00Z", updated_at: "2025-07-01T08:00:00Z",
  },
  {
    id: "p11", first_name: "Sunil", last_name: "Joshi", phone: "9841000011",
    date_of_birth: "1982-06-08", age: 44, sex: "Male", occupation: "Business Owner",
    address_street: "Battisputali", address_city: "Kathmandu", address_state: "Bagmati", address_pin: "44600",
    created_at: "2025-07-05T10:00:00Z", updated_at: "2025-07-05T10:00:00Z",
  },
  {
    id: "p12", first_name: "Laxmi", last_name: "Devkota", phone: "9841000012",
    date_of_birth: "1995-10-01", age: 30, sex: "Female", occupation: "Journalist",
    address_street: "Baneshwor", address_city: "Kathmandu", address_state: "Bagmati", address_pin: "44600",
    created_at: "2025-07-08T14:00:00Z", updated_at: "2025-07-08T14:00:00Z",
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// DIAGNOSIS CATALOG
// ═══════════════════════════════════════════════════════════════════════════

export const mockDiagnoses: DiagnosisCatalog[] = [
  { id: "d1", name: "Myopia", icd10_code: "H52.1", description: "Nearsightedness" },
  { id: "d2", name: "Hypermetropia", icd10_code: "H52.0", description: "Farsightedness" },
  { id: "d3", name: "Astigmatism", icd10_code: "H52.2", description: "Irregular corneal curvature" },
  { id: "d4", name: "Presbyopia", icd10_code: "H52.4", description: "Age-related near vision loss" },
  { id: "d5", name: "Primary Open Angle Glaucoma", icd10_code: "H40.11", description: "POAG" },
  { id: "d6", name: "Angle Closure Glaucoma", icd10_code: "H40.2", description: "ACG" },
  { id: "d7", name: "Allergic Conjunctivitis", icd10_code: "H10.1", description: "Allergic inflammation of conjunctiva" },
  { id: "d8", name: "Bacterial Conjunctivitis", icd10_code: "H10.0", description: "Bacterial infection of conjunctiva" },
  { id: "d9", name: "Dry Eye Disease", icd10_code: "H04.12", description: "Keratoconjunctivitis sicca" },
  { id: "d10", name: "Cataract, Nuclear Sclerosis", icd10_code: "H25.1", description: "Age-related nuclear cataract" },
  { id: "d11", name: "Cataract, Cortical", icd10_code: "H25.0", description: "Age-related cortical cataract" },
  { id: "d12", name: "Diabetic Retinopathy, NPDR", icd10_code: "E11.319", description: "Non-proliferative diabetic retinopathy" },
  { id: "d13", name: "Corneal Foreign Body", icd10_code: "T15.0", description: "Foreign body on corneal surface" },
  { id: "d14", name: "Blepharitis", icd10_code: "H01.0", description: "Inflammation of eyelid margin" },
  { id: "d15", name: "Pterygium", icd10_code: "H11.0", description: "Conjunctival growth over cornea" },
  { id: "d16", name: "Subconjunctival Hemorrhage", icd10_code: "H11.3", description: "Blood under conjunctiva" },
  { id: "d17", name: "Chalazion", icd10_code: "H00.1", description: "Meibomian gland cyst" },
  { id: "d18", name: "Keratitis", icd10_code: "H16.9", description: "Corneal inflammation" },
];

// ═══════════════════════════════════════════════════════════════════════════
// MEDICINE CATALOG
// ═══════════════════════════════════════════════════════════════════════════

export const mockMedicines: Medicine[] = [
  { id: "m1", generic_name: "Moxifloxacin", brand: "Vigamox", strength: "0.5%", form: "eye drop" },
  { id: "m2", generic_name: "Tobramycin", brand: "Tobrex", strength: "0.3%", form: "eye drop" },
  { id: "m3", generic_name: "Prednisolone Acetate", brand: "Pred Forte", strength: "1%", form: "eye drop" },
  { id: "m4", generic_name: "Carboxymethylcellulose", brand: "Refresh Tears", strength: "0.5%", form: "eye drop" },
  { id: "m5", generic_name: "Timolol Maleate", brand: "Timoptic", strength: "0.5%", form: "eye drop" },
  { id: "m6", generic_name: "Latanoprost", brand: "Xalatan", strength: "0.005%", form: "eye drop" },
  { id: "m7", generic_name: "Brimonidine Tartrate", brand: "Alphagan P", strength: "0.1%", form: "eye drop" },
  { id: "m8", generic_name: "Olopatadine", brand: "Patanol", strength: "0.1%", form: "eye drop" },
  { id: "m9", generic_name: "Ciprofloxacin", brand: "Ciloxan", strength: "0.3%", form: "eye ointment" },
  { id: "m10", generic_name: "Erythromycin", brand: "Ilotycin", strength: "0.5%", form: "eye ointment" },
  { id: "m11", generic_name: "Dorzolamide + Timolol", brand: "Cosopt", strength: "2%/0.5%", form: "eye drop" },
  { id: "m12", generic_name: "Cyclopentolate", brand: "Cyclogyl", strength: "1%", form: "eye drop" },
  { id: "m13", generic_name: "Tropicamide", brand: "Mydriacyl", strength: "1%", form: "eye drop" },
  { id: "m14", generic_name: "Fluorometholone", brand: "FML", strength: "0.1%", form: "eye drop" },
  { id: "m15", generic_name: "Ketorolac Tromethamine", brand: "Acular", strength: "0.5%", form: "eye drop" },
  { id: "m16", generic_name: "Hydroxypropyl Methylcellulose", brand: "GenTeal", strength: "0.3%", form: "gel" },
  { id: "m17", generic_name: "Acetazolamide", brand: "Diamox", strength: "250mg", form: "tablet" },
  { id: "m18", generic_name: "Ciprofloxacin", brand: "Ciplox", strength: "500mg", form: "tablet" },
  { id: "m19", generic_name: "Ibuprofen", brand: "Brufen", strength: "400mg", form: "tablet" },
  { id: "m20", generic_name: "Doxycycline", brand: "Doxy-1", strength: "100mg", form: "capsule" },
  { id: "m21", generic_name: "Natamycin", brand: "Natacyn", strength: "5%", form: "suspension" },
  { id: "m22", generic_name: "Pilocarpine", brand: "Pilocar", strength: "2%", form: "eye drop" },
];

// ═══════════════════════════════════════════════════════════════════════════
// VISITS (today + recent, multiple statuses for queue)
// ═══════════════════════════════════════════════════════════════════════════

const today = new Date().toISOString().split("T")[0];

export const mockVisits: Visit[] = [
  // Today's visits (for queue board)
  {
    id: "v1", patient_id: "p1", examined_by: "s1", status: "completed",
    visit_date: today, chief_complaint: "Blurred vision for distance, headache",
    created_at: `${today}T08:00:00Z`, updated_at: `${today}T09:30:00Z`,
  },
  {
    id: "v2", patient_id: "p2", examined_by: "s2", status: "examining",
    visit_date: today, chief_complaint: "Routine glaucoma follow-up, eye pressure check",
    created_at: `${today}T08:30:00Z`, updated_at: `${today}T10:00:00Z`,
  },
  {
    id: "v3", patient_id: "p3", examined_by: "s1", status: "waiting",
    visit_date: today, chief_complaint: "Eye strain and dryness from computer use",
    created_at: `${today}T09:00:00Z`, updated_at: `${today}T09:00:00Z`,
  },
  {
    id: "v4", patient_id: "p5", examined_by: undefined, status: "scheduled",
    visit_date: today, chief_complaint: "Contact lens fitting",
    created_at: `${today}T07:00:00Z`, updated_at: `${today}T07:00:00Z`,
  },
  {
    id: "v5", patient_id: "p6", examined_by: undefined, status: "scheduled",
    visit_date: today, chief_complaint: "Redness and itching in both eyes",
    created_at: `${today}T07:30:00Z`, updated_at: `${today}T07:30:00Z`,
  },
  {
    id: "v6", patient_id: "p8", examined_by: "s2", status: "waiting",
    visit_date: today, chief_complaint: "Foreign body sensation right eye",
    created_at: `${today}T09:30:00Z`, updated_at: `${today}T09:30:00Z`,
  },
  {
    id: "v7", patient_id: "p11", examined_by: "s1", status: "completed",
    visit_date: today, chief_complaint: "Difficulty reading, needs new glasses",
    created_at: `${today}T08:15:00Z`, updated_at: `${today}T09:45:00Z`,
  },
  {
    id: "v8", patient_id: "p10", examined_by: undefined, status: "cancelled",
    visit_date: today, chief_complaint: "Watery eyes",
    created_at: `${today}T07:45:00Z`, updated_at: `${today}T08:00:00Z`,
  },

  // Past visits (for patient history)
  {
    id: "v9", patient_id: "p2", examined_by: "s1", status: "completed",
    visit_date: "2025-01-12", chief_complaint: "Glaucoma initial assessment",
    created_at: "2025-01-12T09:30:00Z", updated_at: "2025-01-12T11:00:00Z",
  },
  {
    id: "v10", patient_id: "p4", examined_by: "s2", status: "completed",
    visit_date: "2025-06-20", chief_complaint: "Post-cataract follow-up, dry eyes",
    created_at: "2025-06-20T10:00:00Z", updated_at: "2025-06-20T11:30:00Z",
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// INVESTIGATIONS
// ═══════════════════════════════════════════════════════════════════════════
//
// Symptoms/refraction/exam findings/diagnoses/treatments/follow-ups now come
// from the real /visit/:id/* clinical endpoints — only investigations still
// have no endpoint, so they're the one clinical sub-document still mocked.

export const mockInvestigations: Record<string, Investigation[]> = {
  v10: [
    { id: "inv1", visit_id: "v10", type: "schirmer_test", result: "OD: 8mm, OS: 10mm", notes: "Borderline dry" },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// PRESCRIPTIONS
// ═══════════════════════════════════════════════════════════════════════════

export const mockPrescriptions: Prescription[] = [
  {
    id: "rx1", visit_id: "v1", patient_id: "p1",
    prescription_number: "RX-2026-0001", type: "spectacle",
    signed_by: "s1", issued_at: `${today}T09:30:00Z`, printed_at: `${today}T09:35:00Z`,
  },
  {
    id: "rx2", visit_id: "v7", patient_id: "p11",
    prescription_number: "RX-2026-0002", type: "spectacle",
    signed_by: "s1", issued_at: `${today}T09:45:00Z`, printed_at: null,
  },
  {
    id: "rx3", visit_id: "v9", patient_id: "p2",
    prescription_number: "RX-2025-0010", type: "combined",
    signed_by: "s1", issued_at: "2025-01-12T11:00:00Z", printed_at: "2025-01-12T11:05:00Z",
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// ACCESS TOKENS & OTP
// ═══════════════════════════════════════════════════════════════════════════

export const mockAccessTokens: PatientAccessToken[] = [
  { id: "at1", patient_id: "p1", token: "abc123def456", revoked: false, created_at: "2025-01-10T10:00:00Z" },
  { id: "at2", patient_id: "p2", token: "ghi789jkl012", revoked: false, created_at: "2025-01-12T09:30:00Z" },
  { id: "at3", patient_id: "p4", token: "mno345pqr678", revoked: false, created_at: "2025-03-05T08:00:00Z" },
];

/** Mock OTP store: phone → { code, expiry, verified } */
export const mockOtpStore: Record<string, { code: string; expiry: Date; verified: boolean }> = {};
