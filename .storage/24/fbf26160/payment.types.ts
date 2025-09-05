export enum PaymentProvider {
  STRIPE = 'STRIPE',
  RAZORPAY = 'RAZORPAY',
}

export enum PaymentMethod {
  CARD = 'CARD',
  UPI = 'UPI',
  NET_BANKING = 'NET_BANKING',
  WALLET = 'WALLET',
}

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  provider: PaymentProvider;
  method: PaymentMethod;
  status: PaymentStatus;
  providerPaymentId?: string;
  providerResponse?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  orderId: string;
  clientSecret?: string;
  status: string;
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}