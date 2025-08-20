import { Injectable } from '@angular/core';
import { Observable, of, delay, map } from 'rxjs';
import { Patient } from '../models/patient.model';
import { SearchCriteria } from '../models/search-criteria.model';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private patients: Patient[] = [
    { id: 'P001', firstName: 'Adam', lastName: 'Morel', dateOfBirth: '2005-03-14', gender: 'M', bloodType: 'O+', phone: '0624583912', email: 'adam.morel@example.com', address: '12 rue des Acacias, 57000 Metz', socialSecurityNumber: '105031445812345' },
    { id: 'P002', firstName: 'Gabriel', lastName: 'Laurent', dateOfBirth: '1998-07-02', gender: 'M', bloodType: 'A-', phone: '0645728109', email: 'gabriel.laurent@example.com', address: '45 avenue de la Liberté, 54000 Nancy', socialSecurityNumber: '198072245709876' },
    { id: 'P003', firstName: 'Rebecca', lastName: 'Cohen', dateOfBirth: '1985-11-21', gender: 'F', bloodType: 'B+', phone: '0758669310', email: 'rebecca.cohen@example.com', address: '7 place Saint-Jacques, 75004 Paris', socialSecurityNumber: '285112145896732' },
    { id: 'P004', firstName: 'Emmy', lastName: 'Dubois', dateOfBirth: '2010-06-05', gender: 'F', bloodType: 'AB-', phone: '0687142954', email: 'emmy.dubois@example.com', address: '18 rue des Lilas, 69003 Lyon', socialSecurityNumber: '210060545879611' },
    { id: 'P005', firstName: 'Bastien', lastName: 'Leroy', dateOfBirth: '1992-09-17', gender: 'M', bloodType: 'O-', phone: '0722483177', email: 'bastien.leroy@example.com', address: '30 rue de Verdun, 31000 Toulouse', socialSecurityNumber: '192091745123498' },
    { id: 'P006', firstName: 'Lucie', lastName: 'Bernard', dateOfBirth: '2001-01-29', gender: 'F', bloodType: 'A+', phone: '0639275502', email: 'lucie.bernard@example.com', address: '4 rue Victor Hugo, 13001 Marseille', socialSecurityNumber: '201012945876564' }
  ];

  getById(id: string): Observable<Patient | undefined> {
    return of(this.patients.find(patient => patient.id === id)).pipe(delay(100));
  }

  search(criteria: SearchCriteria): Observable<Patient[]> {
    return of(this.patients).pipe(
      delay(100),
      map(patients => {
        let filtered = patients;
        if (criteria.query) {
          filtered = patients.filter(patient => 
            patient.firstName.toLowerCase().includes(criteria.query.toLowerCase()) ||
            patient.lastName.toLowerCase().includes(criteria.query.toLowerCase()) ||
            patient.email.toLowerCase().includes(criteria.query.toLowerCase())
          );
        }
        const start = (criteria.page - 1) * criteria.pageSize;
        const end = start + criteria.pageSize;
        return filtered.slice(start, end);
      })
    );
  }

  create(patient: Omit<Patient, 'id'>): Observable<Patient> {
    const newPatient: Patient = {
      ...patient,
      id: 'P' + String(this.patients.length + 1).padStart(3, '0')
    };
    this.patients.push(newPatient);
    return of(newPatient).pipe(delay(200));
  }

  update(id: string, patient: Partial<Patient>): Observable<Patient | undefined> {
    const index = this.patients.findIndex(p => p.id === id);
    if (index !== -1) {
      this.patients[index] = { ...this.patients[index], ...patient };
      return of(this.patients[index]).pipe(delay(200));
    }
    return of(undefined).pipe(delay(200));
  }

  delete(id: string): Observable<boolean> {
    const index = this.patients.findIndex(p => p.id === id);
    if (index !== -1) {
      this.patients.splice(index, 1);
      return of(true).pipe(delay(200));
    }
    return of(false).pipe(delay(200));
  }
}