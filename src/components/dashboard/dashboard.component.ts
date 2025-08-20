import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, combineLatest, map, startWith } from 'rxjs';
import { ConversationService } from '../../services/conversation.service';
import { UserService } from '../../services/user.service';
import { PatientService } from '../../services/patient.service';
import { MedicalExamService } from '../../services/medical-exam.service';
import { Conversation, Message } from '../../models/conversation.model';
import { User } from '../../models/user.model';
import { Patient } from '../../models/patient.model';
import { MedicalExam } from '../../models/medical-exam.model';
import { ChatModalComponent } from '../chat-modal/chat-modal.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ChatModalComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit {
  conversations$!: Observable<any[]>;
  presetFilter = '';
  chatFilter = '';
  selectedConversation: any = null;
  currentUser$ = this.userService.getCurrentUser();
  presetsExpanded = true;
  chatExpanded = true;

  presets = [
    { name: 'Hospital Saint-Luc (UCLouvain)', count: 12 },
    { name: 'Clinique Saint-Luc (Bouge)', count: 7 },
    { name: 'Hôpital Vivalia (Arlon)', count: 3 },
    { name: 'URGENCE Jolimont', count: 1 }
  ];

  boxes = [
    { name: 'Inbox', count: Math.floor(Math.random() * 20) + 1, icon: 'fas fa-inbox' },
    { name: 'Pending', count: Math.floor(Math.random() * 20) + 1, icon: 'fas fa-pause' },
    { name: 'Second Opinion', count: Math.floor(Math.random() * 20) + 1, icon: 'fas fa-users' },
    { name: 'Completed', count: Math.floor(Math.random() * 20) + 1, icon: 'fas fa-check-square' }
  ];

  constructor(
    private conversationService: ConversationService,
    private userService: UserService,
    private patientService: PatientService,
    private medicalExamService: MedicalExamService
  ) {}

  ngOnInit() {
    this.loadConversations();
  }

  private loadConversations() {
    this.conversations$ = combineLatest([
      this.conversationService.search({ query: '', page: 1, pageSize: 50 }),
      this.userService.search({ query: '', page: 1, pageSize: 50 }),
      this.patientService.search({ query: '', page: 1, pageSize: 50 }),
      this.medicalExamService.search({ query: '', page: 1, pageSize: 100 })
    ]).pipe(
      map(([conversations, users, patients, exams]) => {
        return conversations
          .filter(conv => this.chatFilter ? 
            this.getOtherParticipant(conv, users)?.firstName.toLowerCase().includes(this.chatFilter.toLowerCase()) ||
            this.getOtherParticipant(conv, users)?.lastName.toLowerCase().includes(this.chatFilter.toLowerCase()) ||
            this.getPatientForExam(conv.examId, patients, exams)?.firstName.toLowerCase().includes(this.chatFilter.toLowerCase()) ||
            this.getPatientForExam(conv.examId, patients, exams)?.lastName.toLowerCase().includes(this.chatFilter.toLowerCase())
            : true
          )
          .map(conv => ({
            ...conv,
            otherParticipant: this.getOtherParticipant(conv, users),
            patient: this.getPatientForExam(conv.examId, patients, exams),
            exam: exams.find(e => e.id === conv.examId)
          }));
      })
    );
  }

  get filteredPresets() {
    return this.presets.filter(preset => 
      preset.name.toLowerCase().includes(this.presetFilter.toLowerCase())
    );
  }

  private getOtherParticipant(conversation: Conversation, users: User[]): User | undefined {
    const otherUserId = conversation.participantIds.find(id => id !== 'U001');
    return users.find(u => u.id === otherUserId);
  }

  private getPatientForExam(examId: string, patients: Patient[], exams: MedicalExam[]): Patient | undefined {
    const exam = exams.find(e => e.id === examId);
    return exam ? patients.find(p => p.id === exam.patientId) : undefined;
  }

  openConversation(conversation: any) {
    // Mark as read when opening
    if (!conversation.isRead) {
      this.conversationService.markAsRead(conversation.id).subscribe();
    }
    this.selectedConversation = conversation;
  }

  closeModal() {
    this.selectedConversation = null;
    this.loadConversations(); // Refresh conversations to reflect any changes
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    if (messageDate.getTime() === today.getTime()) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  }

  truncateText(text: string, maxLength: number): string {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  onChatFilterChange() {
    this.loadConversations();
  }

  togglePresets() {
    this.presetsExpanded = !this.presetsExpanded;
  }

  toggleChat() {
    this.chatExpanded = !this.chatExpanded;
  }
}