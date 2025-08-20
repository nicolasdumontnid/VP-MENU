import { Injectable } from '@angular/core';
import { Observable, of, delay, map, BehaviorSubject } from 'rxjs';
import { Conversation, Message } from '../models/conversation.model';
import { SearchCriteria } from '../models/search-criteria.model';

@Injectable({
  providedIn: 'root'
})
export class ConversationService {
  private conversations: Conversation[] = this.generateMockConversations();
  private conversationsSubject = new BehaviorSubject<Conversation[]>(this.conversations);

  private generateMockConversations(): Conversation[] {
    const damienId = 'U001';
    const otherUserIds = ['U002', 'U003', 'U004', 'U005', 'U006', 'U007', 'U008', 'U009', 'U010'];
    const examIds = [
      'E001', 'E002', 'E003', 'E004', 'E005', 'E006', 'E007', 'E008', 'E009', 'E010',
      'E011', 'E012', 'E013', 'E014', 'E015', 'E016', 'E017', 'E018', 'E019', 'E020'
    ];
    
    const conversations: Conversation[] = [];
    const now = new Date();
    
    for (let i = 0; i < 20; i++) {
      const otherUserId = otherUserIds[Math.floor(Math.random() * otherUserIds.length)];
      const examId = examIds[i];
      
      // Generate messages for each conversation
      const messageCount = Math.floor(Math.random() * 6) + 5; // 5-10 messages
      const messages: Message[] = [];
      
      for (let j = 0; j < messageCount; j++) {
        const senderId = Math.random() > 0.5 ? damienId : otherUserId;
        const baseDate = i < 6 ? now : new Date(now.getTime() - Math.random() * 90 * 24 * 60 * 60 * 1000); // Last 3 months
        const messageDate = new Date(baseDate.getTime() - (messageCount - j - 1) * 60 * 60 * 1000); // Messages spread over hours
        
        const messageContents = [
          'I need to review this case with you.',
          'The results show some interesting findings.',
          'Could you take a look at this examination?',
          'I have some concerns about the diagnosis.',
          'The patient history suggests we need to investigate further.',
          'What do you think about these symptoms?',
          'I agree with your assessment.',
          'Let me check the previous examinations.',
          'This requires immediate attention.',
          'Thank you for your consultation.'
        ];
        
        messages.push({
          id: `M${i}_${j}`,
          senderId,
          content: messageContents[Math.floor(Math.random() * messageContents.length)],
          timestamp: messageDate.toISOString()
        });
      }
      
      // Sort messages by timestamp
      messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      
      const lastMessage = messages[messages.length - 1];
      let isRead = true;
      let isPinned = false;
      
      // 3 conversations unread
      if (i < 3) {
        isRead = false;
      }
      
      // 2 conversations pinned (one read, one unread)
      if (i < 2) {
        isPinned = true;
        if (i === 0) {
          isRead = false; // First pinned conversation is unread
        }
      }
      
      conversations.push({
        id: `C${String(i + 1).padStart(3, '0')}`,
        participantIds: [damienId, otherUserId],
        examId,
        messages,
        isRead,
        isPinned,
        lastMessageDate: lastMessage.timestamp
      });
    }
    
    return conversations;
  }

  getById(id: string): Observable<Conversation | undefined> {
    return of(this.conversations.find(conversation => conversation.id === id)).pipe(delay(100));
  }

  search(criteria: SearchCriteria): Observable<Conversation[]> {
    return this.conversationsSubject.asObservable().pipe(
      delay(100),
      map(conversations => {
        let filtered = conversations;
        if (criteria.query) {
          filtered = conversations.filter(conversation => {
            const lastMessage = conversation.messages[conversation.messages.length - 1];
            return lastMessage?.content.toLowerCase().includes(criteria.query.toLowerCase());
          });
        }
        
        // Sort: pinned first, then unread, then by last message date
        filtered.sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          if (!a.isRead && b.isRead) return -1;
          if (a.isRead && !b.isRead) return 1;
          return new Date(b.lastMessageDate).getTime() - new Date(a.lastMessageDate).getTime();
        });
        
        const start = (criteria.page - 1) * criteria.pageSize;
        const end = start + criteria.pageSize;
        return filtered.slice(start, end);
      })
    );
  }

  create(conversation: Omit<Conversation, 'id'>): Observable<Conversation> {
    const newConversation: Conversation = {
      ...conversation,
      id: 'C' + String(this.conversations.length + 1).padStart(3, '0')
    };
    this.conversations.push(newConversation);
    this.conversationsSubject.next(this.conversations);
    return of(newConversation).pipe(delay(200));
  }

  update(id: string, conversation: Partial<Conversation>): Observable<Conversation | undefined> {
    const index = this.conversations.findIndex(c => c.id === id);
    if (index !== -1) {
      this.conversations[index] = { ...this.conversations[index], ...conversation };
      this.conversationsSubject.next(this.conversations);
      return of(this.conversations[index]).pipe(delay(200));
    }
    return of(undefined).pipe(delay(200));
  }

  delete(id: string): Observable<boolean> {
    const index = this.conversations.findIndex(c => c.id === id);
    if (index !== -1) {
      this.conversations.splice(index, 1);
      this.conversationsSubject.next(this.conversations);
      return of(true).pipe(delay(200));
    }
    return of(false).pipe(delay(200));
  }

  markAsRead(id: string): Observable<boolean> {
    return this.update(id, { isRead: true }).pipe(map(result => !!result));
  }

  markAsUnread(id: string): Observable<boolean> {
    return this.update(id, { isRead: false }).pipe(map(result => !!result));
  }

  addMessage(conversationId: string, message: Omit<Message, 'id'>): Observable<Message> {
    const conversation = this.conversations.find(c => c.id === conversationId);
    if (conversation) {
      const newMessage: Message = {
        ...message,
        id: `M${conversationId}_${conversation.messages.length}`
      };
      conversation.messages.push(newMessage);
      conversation.lastMessageDate = newMessage.timestamp;
      this.conversationsSubject.next(this.conversations);
      return of(newMessage).pipe(delay(100));
    }
    throw new Error('Conversation not found');
  }
}