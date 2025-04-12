import React, { createContext, useState, useContext } from "react";

interface Notification {
  message: string;
  type?: string; 
}

interface NotificationContextProps {
  notification: Notification | null;
  showNotification: (message: string, type?: string) => void;
  hideNotification: () => void;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notification, setNotification] = useState<Notification | null>(null);

  const showNotification = (message: string, type?: string) => {
    if (!message) return; // Prevent empty messages
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000); // Auto-hide after 3 seconds
  };

  const hideNotification = () => {
    setNotification(null);
  };

  return (
    <NotificationContext.Provider value={{ notification, showNotification, hideNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextProps => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
};