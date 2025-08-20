export interface MedicalExam {
  id: string;
  patientId: string;
  title: string;
  anatomicalRegion: string;
  examDate: string;
  patientWeight: number;
  patientAge: number;
  diagnosis: 'positive' | 'negative';
  department: string;
  description: string;
  conclusion: string;
  prescribingDoctorId: string;
  assignedRadiologistId: string;
}