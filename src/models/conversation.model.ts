export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  examId: string;
  messages: Message[];
  isRead: boolean;
  isPinned: boolean;
  lastMessageDate: string;
}