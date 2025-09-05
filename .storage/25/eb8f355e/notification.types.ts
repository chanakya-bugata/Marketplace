export enum NotificationType {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  PUSH = 'PUSH',
  IN_APP = 'IN_APP',
}

export enum NotificationStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  FAILED = 'FAILED',
  DELIVERED = 'DELIVERED',
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  status: NotificationStatus;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailNotification {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface SMSNotification {
  to: string;
  message: string;
}

export interface SocketNotification {
  userId: string;
  event: string;
  data: any;
}