export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'M' | 'F';
  bloodType: string;
  phone: string;
  email: string;
  address: string;
  socialSecurityNumber: string;
}