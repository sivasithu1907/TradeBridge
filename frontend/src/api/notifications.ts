import { apiClient } from './client';
import { NotificationItem } from '../types';

interface RawNotification {
  id: string;
  type: 'rfq' | 'quote' | 'booking' | 'shipment' | 'message' | 'system';
  title: string;
  description: string | null;
  is_read: boolean;
  created_at: string;
}

function timeAgo(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function toFrontendNotification(n: RawNotification): NotificationItem {
  return {
    id: n.id,
    title: n.title,
    description: n.description || '',
    time: timeAgo(n.created_at),
    unread: !n.is_read,
    // Backend has 'booking' and 'message' types the original frontend
    // type doesn't model. 'booking' behaves like 'shipment' in the UI
    // (both route to shipment tracking, since booking confirmation is
    // the moment a shipment record is created). 'message' falls back to
    // 'system' since there's no dedicated messages route in the drawer yet.
    type: n.type === 'booking' ? 'shipment' : n.type === 'message' ? 'system' : n.type,
  };
}

export const notificationApi = {
  async list(): Promise<NotificationItem[]> {
    const { notifications } = await apiClient.get<{ notifications: RawNotification[] }>('/notifications');
    return notifications.map(toFrontendNotification);
  },

  async markAllRead(): Promise<void> {
    await apiClient.post('/notifications/mark-read');
  },
};
