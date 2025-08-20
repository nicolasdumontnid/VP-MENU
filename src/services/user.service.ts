import { Injectable } from '@angular/core';
import { Observable, of, delay, map } from 'rxjs';
import { User } from '../models/user.model';
import { SearchCriteria } from '../models/search-criteria.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private users: User[] = [
    { id: 'U001', firstName: 'Damien', lastName: 'Martin', specialty: 'Oncologist', email: 'damien.martin@hospital.com', photo: 'https://randomuser.me/api/portraits/men/1.jpg' },
    { id: 'U002', firstName: 'Nicolas', lastName: 'Durand', specialty: 'Oncologist', email: 'nicolas.durand@hospital.com', photo: 'https://randomuser.me/api/portraits/men/2.jpg' },
    { id: 'U003', firstName: 'Déborah', lastName: 'Lemoine', specialty: 'Pediatrician', email: 'deborah.lemoine@hospital.com', photo: 'https://randomuser.me/api/portraits/women/1.jpg' },
    { id: 'U004', firstName: 'Daniel', lastName: 'Rousseau', specialty: 'Radiographer', email: 'daniel.rousseau@hospital.com', photo: 'https://randomuser.me/api/portraits/men/3.jpg' },
    { id: 'U005', firstName: 'Sylvie', lastName: 'Moreau', specialty: 'General Practitioner', email: 'sylvie.moreau@hospital.com', photo: 'https://randomuser.me/api/portraits/women/2.jpg' },
    { id: 'U006', firstName: 'Claire', lastName: 'Simon', specialty: 'Cardiologist', email: 'claire.simon@hospital.com', photo: 'https://randomuser.me/api/portraits/women/3.jpg' },
    { id: 'U007', firstName: 'Julien', lastName: 'Michel', specialty: 'Emergency Doctor', email: 'julien.michel@hospital.com', photo: 'https://randomuser.me/api/portraits/men/4.jpg' },
    { id: 'U008', firstName: 'Fatima', lastName: 'Benali', specialty: 'Neurologist', email: 'fatima.benali@hospital.com', photo: 'https://randomuser.me/api/portraits/women/4.jpg' },
    { id: 'U009', firstName: 'Thomas', lastName: 'Garnier', specialty: 'Orthopedic Surgeon', email: 'thomas.garnier@hospital.com', photo: 'https://randomuser.me/api/portraits/men/5.jpg' },
    { id: 'U010', firstName: 'Marie', lastName: 'Dubois', specialty: 'Head Nurse', email: 'marie.dubois@hospital.com', photo: 'https://randomuser.me/api/portraits/women/5.jpg' }
  ];

  getCurrentUser(): Observable<User> {
    return of(this.users[0]).pipe(delay(100));
  }

  getById(id: string): Observable<User | undefined> {
    return of(this.users.find(user => user.id === id)).pipe(delay(100));
  }

  search(criteria: SearchCriteria): Observable<User[]> {
    return of(this.users).pipe(
      delay(100),
      map(users => {
        let filtered = users;
        if (criteria.query) {
          filtered = users.filter(user => 
            user.firstName.toLowerCase().includes(criteria.query.toLowerCase()) ||
            user.lastName.toLowerCase().includes(criteria.query.toLowerCase()) ||
            user.specialty.toLowerCase().includes(criteria.query.toLowerCase())
          );
        }
        const start = (criteria.page - 1) * criteria.pageSize;
        const end = start + criteria.pageSize;
        return filtered.slice(start, end);
      })
    );
  }

  create(user: Omit<User, 'id'>): Observable<User> {
    const newUser: User = {
      ...user,
      id: 'U' + String(this.users.length + 1).padStart(3, '0')
    };
    this.users.push(newUser);
    return of(newUser).pipe(delay(200));
  }

  update(id: string, user: Partial<User>): Observable<User | undefined> {
    const index = this.users.findIndex(u => u.id === id);
    if (index !== -1) {
      this.users[index] = { ...this.users[index], ...user };
      return of(this.users[index]).pipe(delay(200));
    }
    return of(undefined).pipe(delay(200));
  }

  delete(id: string): Observable<boolean> {
    const index = this.users.findIndex(u => u.id === id);
    if (index !== -1) {
      this.users.splice(index, 1);
      return of(true).pipe(delay(200));
    }
    return of(false).pipe(delay(200));
  }
}