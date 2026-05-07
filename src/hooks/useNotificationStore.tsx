import { createContext, useContext, useState, useCallback, useEffect, type ReactNode, useMemo } from "react";
import type { Notification, NotificationStore } from "@/lib/notificationTypes";
import { NOTIFICATION_STORAGE_KEY } from "@/lib/notificationTypes";

function readNotificationStore(): NotificationStore {
  try {
    const raw = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
    if (!raw) return { notifications: [] };
    return JSON.parse(raw) as NotificationStore;
  } catch {
    return { notifications: [] };
  }
}

function writeNotificationStore(store: NotificationStore) {
  try {
    localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(store));
  } catch {}
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  activeAlerts: Notification[];
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read" | "dismissed">) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  dismissNotification: (id: string) => void;
  clearAll: () => void;
  getNotificationsByType: (type: Notification["type"]) => Notification[];
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  activeAlerts: [],
  addNotification: () => {},
  markAsRead: () => {},
  markAllAsRead: () => {},
  dismissNotification: () => {},
  clearAll: () => {},
  getNotificationsByType: () => [],
});

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<NotificationStore>(() => readNotificationStore());

  useEffect(() => {
    writeNotificationStore(store);
  }, [store]);

  const notifications = useMemo(() => {
    return [...store.notifications].sort((a, b) => b.timestamp - a.timestamp);
  }, [store.notifications]);

  const unreadCount = useMemo(() => {
    return store.notifications.filter(n => !n.read && !n.dismissed).length;
  }, [store.notifications]);

  const activeAlerts = useMemo(() => {
    return store.notifications.filter(n => !n.dismissed && (n.type === "emergency" || n.type === "doctor-alert"));
  }, [store.notifications]);

  const addNotification = useCallback((notification: Omit<Notification, "id" | "timestamp" | "read" | "dismissed">) => {
    setStore(prev => {
      const now = Date.now();
      const exists = prev.notifications.some(
        n => n.type === notification.type &&
             n.title === notification.title &&
             !n.dismissed &&
             (now - n.timestamp) < 3600000
      );
      if (exists) return prev;

      const newNotification: Notification = {
        ...notification,
        id: `notif_${now}_${Math.random().toString(36).substring(2, 9)}`,
        timestamp: now,
        read: false,
        dismissed: false,
      };
      const notifs = prev.notifications || [];
      return { notifications: [newNotification, ...notifs] };
    });
  }, []);

  const markAsRead = useCallback((id: string) => {
    setStore(prev => ({
      notifications: prev.notifications.map(n => n.id === id ? { ...n, read: true } : n),
    }));
  }, []);

  const markAllAsRead = useCallback(() => {
    setStore(prev => ({
      notifications: prev.notifications.map(n => ({ ...n, read: true })),
    }));
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setStore(prev => ({
      notifications: prev.notifications.map(n => n.id === id ? { ...n, dismissed: true, read: true } : n),
    }));
  }, []);

  const clearAll = useCallback(() => {
    setStore({ notifications: [] });
  }, []);

  const getNotificationsByType = useCallback((type: Notification["type"]) => {
    return store.notifications.filter(n => n.type === type && !n.dismissed);
  }, [store.notifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        activeAlerts,
        addNotification,
        markAsRead,
        markAllAsRead,
        dismissNotification,
        clearAll,
        getNotificationsByType,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationStore() {
  return useContext(NotificationContext);
}