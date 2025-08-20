import { Injectable } from '@angular/core';
import { Observable, of, delay, map } from 'rxjs';
import { MedicalExam } from '../models/medical-exam.model';
import { SearchCriteria } from '../models/search-criteria.model';

@Injectable({
  providedIn: 'root'
})
export class MedicalExamService {
  private exams: MedicalExam[] = this.generateMockExams();

  private generateMockExams(): MedicalExam[] {
    const patientIds = ['P001', 'P002', 'P003', 'P004', 'P005', 'P006'];
    const doctorIds = ['U001', 'U002', 'U003', 'U004', 'U005', 'U006', 'U007', 'U008', 'U009', 'U010'];
    const regions = ['Chest', 'Abdomen', 'Head', 'Spine', 'Pelvis', 'Extremities'];
    const departments = ['Radiology', 'Oncology', 'Cardiology', 'Neurology', 'Orthopedics'];
    const examTypes = ['CT Scan', 'MRI', 'X-Ray', 'Ultrasound', 'PET Scan'];
    
    const exams: MedicalExam[] = [];
    let examCounter = 1;

    patientIds.forEach(patientId => {
      for (let i = 0; i < 10; i++) {
        const now = new Date();
        let examDate: Date;
        
        if (i === 0) {
          // At least one exam in current month
          examDate = new Date(now.getFullYear(), now.getMonth(), Math.floor(Math.random() * now.getDate()) + 1);
        } else {
          // Other exams in last 3 months
          const monthsBack = Math.floor(Math.random() * 3);
          examDate = new Date(now.getFullYear(), now.getMonth() - monthsBack, Math.floor(Math.random() * 28) + 1);
        }

        const region = regions[Math.floor(Math.random() * regions.length)];
        const examType = examTypes[Math.floor(Math.random() * examTypes.length)];
        
        exams.push({
          id: 'E' + String(examCounter++).padStart(3, '0'),
          patientId,
          title: `${examType} - ${region}`,
          anatomicalRegion: region,
          examDate: examDate.toISOString().split('T')[0],
          patientWeight: Math.floor(Math.random() * 40) + 50, // 50-90 kg
          patientAge: Math.floor(Math.random() * 60) + 10, // 10-70 years
          diagnosis: Math.random() > 0.7 ? 'positive' : 'negative',
          department: departments[Math.floor(Math.random() * departments.length)],
          description: `${examType} examination of ${region.toLowerCase()} region to evaluate potential abnormalities and provide diagnostic insights`,
          conclusion: Math.random() > 0.7 ? 'Abnormal findings detected, further investigation recommended' : 'Normal examination, no significant findings',
          prescribingDoctorId: doctorIds[Math.floor(Math.random() * doctorIds.length)],
          assignedRadiologistId: doctorIds[Math.floor(Math.random() * doctorIds.length)]
        });
      }
    });

    return exams;
  }

  getById(id: string): Observable<MedicalExam | undefined> {
    return of(this.exams.find(exam => exam.id === id)).pipe(delay(100));
  }

  search(criteria: SearchCriteria): Observable<MedicalExam[]> {
    return of(this.exams).pipe(
      delay(100),
      map(exams => {
        let filtered = exams;
        if (criteria.query) {
          filtered = exams.filter(exam => 
            exam.title.toLowerCase().includes(criteria.query.toLowerCase()) ||
            exam.anatomicalRegion.toLowerCase().includes(criteria.query.toLowerCase()) ||
            exam.department.toLowerCase().includes(criteria.query.toLowerCase())
          );
        }
        const start = (criteria.page - 1) * criteria.pageSize;
        const end = start + criteria.pageSize;
        return filtered.slice(start, end);
      })
    );
  }

  create(exam: Omit<MedicalExam, 'id'>): Observable<MedicalExam> {
    const newExam: MedicalExam = {
      ...exam,
      id: 'E' + String(this.exams.length + 1).padStart(3, '0')
    };
    this.exams.push(newExam);
    return of(newExam).pipe(delay(200));
  }

  update(id: string, exam: Partial<MedicalExam>): Observable<MedicalExam | undefined> {
    const index = this.exams.findIndex(e => e.id === id);
    if (index !== -1) {
      this.exams[index] = { ...this.exams[index], ...exam };
      return of(this.exams[index]).pipe(delay(200));
    }
    return of(undefined).pipe(delay(200));
  }

  delete(id: string): Observable<boolean> {
    const index = this.exams.findIndex(e => e.id === id);
    if (index !== -1) {
      this.exams.splice(index, 1);
      return of(true).pipe(delay(200));
    }
    return of(false).pipe(delay(200));
  }
}