import { apiClient } from './client';

export interface MessageThread {
  bookingId: string;
  bookingNumber: string;
  importerName: string;
  forwarderName: string;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
}

export interface ThreadMessage {
  id: string;
  bookingId: string;
  senderUserId: string;
  senderName: string;
  senderRole: 'importer' | 'forwarder' | 'admin';
  body: string;
  isRead: boolean;
  createdAt: string;
}

interface RawThread {
  booking_id: string;
  booking_number: string;
  importer_name: string;
  forwarder_name: string;
  last_message: string | null;
  last_message_at: string | null;
  unread_count: string;
}

interface RawMessage {
  id: string;
  booking_id: string;
  sender_user_id: string;
  sender_name: string;
  sender_role: 'importer' | 'forwarder' | 'admin';
  body: string;
  is_read: boolean;
  created_at: string;
}

function toFrontendThread(t: RawThread): MessageThread {
  return {
    bookingId: t.booking_id,
    bookingNumber: t.booking_number,
    importerName: t.importer_name,
    forwarderName: t.forwarder_name,
    lastMessage: t.last_message,
    lastMessageAt: t.last_message_at,
    unreadCount: Number(t.unread_count),
  };
}

function toFrontendMessage(m: RawMessage): ThreadMessage {
  return {
    id: m.id,
    bookingId: m.booking_id,
    senderUserId: m.sender_user_id,
    senderName: m.sender_name,
    senderRole: m.sender_role,
    body: m.body,
    isRead: m.is_read,
    createdAt: m.created_at,
  };
}

export const messageApi = {
  async listThreads(): Promise<MessageThread[]> {
    const { threads } = await apiClient.get<{ threads: RawThread[] }>('/messages/threads');
    return threads.map(toFrontendThread);
  },

  async getThreadMessages(bookingId: string): Promise<ThreadMessage[]> {
    const { messages } = await apiClient.get<{ messages: RawMessage[] }>(`/messages/booking/${bookingId}`);
    return messages.map(toFrontendMessage);
  },

  async send(bookingId: string, body: string): Promise<ThreadMessage> {
    const { message } = await apiClient.post<{ message: RawMessage }>('/messages', { bookingId, body });
    return toFrontendMessage(message);
  },
};
