import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConversationService } from '../../services/conversation.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-chat-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-modal.component.html',
  styleUrls: ['./chat-modal.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatModalComponent implements OnInit {
  @Input() conversation: any = null;
  @Output() closeModal = new EventEmitter<void>();
  
  newMessage = '';
  showMenu = false;
  currentUser$ = this.userService.getCurrentUser();

  constructor(
    private conversationService: ConversationService,
    private userService: UserService
  ) {}

  ngOnInit() {
    // Auto-focus on message input when modal opens
    setTimeout(() => {
      const messageInput = document.getElementById('messageInput');
      if (messageInput) {
        messageInput.focus();
      }
    }, 100);
  }

  close() {
    this.closeModal.emit();
  }

  toggleMenu() {
    this.showMenu = !this.showMenu;
  }

  markAsUnread() {
    if (this.conversation) {
      this.conversationService.markAsUnread(this.conversation.id).subscribe(() => {
        this.conversation.isRead = false;
        this.showMenu = false;
        this.close();
      });
    }
  }

  togglePin() {
    if (this.conversation) {
      const newPinnedStatus = !this.conversation.isPinned;
      this.conversationService.update(this.conversation.id, { isPinned: newPinnedStatus }).subscribe(() => {
        this.conversation.isPinned = newPinnedStatus;
        this.showMenu = false;
      });
    }
  }

  sendMessage() {
    if (this.newMessage.trim() && this.conversation) {
      const message = {
        senderId: 'U001', // Current user (Damien)
        content: this.newMessage.trim(),
        timestamp: new Date().toISOString()
      };

      this.conversationService.addMessage(this.conversation.id, message).subscribe(() => {
        // Add message to local conversation object for immediate UI update
        this.conversation.messages.push({
          ...message,
          id: `M${this.conversation.id}_${this.conversation.messages.length}`
        });
        this.conversation.lastMessageDate = message.timestamp;
        this.newMessage = '';
        
        // Scroll to bottom of messages
        setTimeout(() => {
          const messagesContainer = document.querySelector('.messages-container');
          if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
          }
        }, 100);
      });
    }
  }

  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  formatMessageTime(timestamp: string): string {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}