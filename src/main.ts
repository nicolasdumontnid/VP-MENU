import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { DashboardComponent } from './components/dashboard/dashboard.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [DashboardComponent],
  template: `<app-dashboard></app-dashboard>`
})
export class App {}

bootstrapApplication(App);