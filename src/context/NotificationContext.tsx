'use client';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from 'react';
import { useSession } from 'next-auth/react';
import * as signalR from '@microsoft/signalr';
import { createSignalRConnection } from '@/lib/signalr';
import type { Notification, NotificationsResponse } from '@/types/notification';

interface NotificationContextValue {
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue>({
  notifications: [],
  unreadCount: 0,
  isConnected: false,
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  deleteNotification: async () => {},
  refresh: async () => {},
});

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const connectionRef = useRef<signalR.HubConnection | null>(null);

  // Load notifications from API proxy
  const refresh = useCallback(async () => {
    if (!session?.accessToken) return;
    try {
      const res = await fetch('/api/notifications', {
        headers: { Authorization: `Bearer ${session.accessToken}` },
      });
      if (!res.ok) throw new Error('Failed to fetch notifications');
      const data = (await res.json()) as NotificationsResponse;
      setNotifications(data.notifications ?? []);
      setUnreadCount(data.unreadCount ?? 0);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  }, [session?.accessToken]);

  // Initial load
  useEffect(() => {
    refresh();
  }, [refresh]);

  // SignalR connection
  useEffect(() => {
    if (!session?.accessToken) return;

    let cancelled = false;

    const connect = async () => {
      try {
        console.log('Starting SignalR connection...');
        const connection = await createSignalRConnection(session.accessToken!);

        // Listen for new notifications pushed from backend
        connection.on('ReceiveNotification', (notification: Notification) => {
          console.log('Received notification:', notification);
          setNotifications((prev) => [notification, ...prev]);
          setUnreadCount((prev) => prev + 1);
        });

        connection.onclose(() => {
          console.warn('SignalR connection closed');
          if (!cancelled) setIsConnected(false);
        });

        connection.onreconnected(() => {
          console.log('SignalR reconnected');
          if (!cancelled) setIsConnected(true);
        });

        console.log('Starting SignalR hub connection...');
        await connection.start();

        console.log('SignalR connected successfully');
        if (!cancelled) {
          connectionRef.current = connection;
          setIsConnected(true);
        } else {
          await connection.stop();
        }
      } catch (err) {
        console.error('SignalR connection failed:', err);
        if (err instanceof Error) {
          console.error('Error message:', err.message);
          console.error('Error stack:', err.stack);
        }
        // Fall back to polling every 30s if SignalR fails
        console.log('Falling back to polling mode (30s interval)');
        const interval = setInterval(() => {
          if (!cancelled) refresh();
        }, 30000);
        return () => clearInterval(interval);
      }
    };

    connect();

    return () => {
      cancelled = true;
      connectionRef.current?.stop();
      connectionRef.current = null;
      setIsConnected(false);
    };
  }, [session?.accessToken, refresh]);

  const markAsRead = async (id: string) => {
    if (!session?.accessToken) return;
    try {
      const res = await fetch(`/api/notifications/${id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${session.accessToken}` },
      });
      if (!res.ok) throw new Error('Failed to mark as read');
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const markAllAsRead = async () => {
    if (!session?.accessToken) return;
    try {
      const res = await fetch('/api/notifications/read-all', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${session.accessToken}` },
      });
      if (!res.ok) throw new Error('Failed to mark all as read');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const deleteNotification = async (id: string) => {
    if (!session?.accessToken) return;
    try {
      const wasUnread = notifications.find((n) => n.id === id && !n.isRead);
      const res = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session.accessToken}` },
      });
      if (!res.ok) throw new Error('Failed to delete notification');
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (wasUnread) setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isConnected,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        refresh,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);
