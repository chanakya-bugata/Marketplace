import { IsString, IsNumber, IsEnum, IsUUID, IsOptional, Min } from 'class-validator';
import { PaymentProvider, PaymentMethod } from '../types/payment.types';

export class CreatePaymentDto {
  @IsUUID()
  orderId: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  currency: string = 'USD';

  @IsEnum(PaymentProvider)
  provider: PaymentProvider;

  @IsEnum(PaymentMethod)
  method: PaymentMethod;
}

export class ProcessPaymentDto {
  @IsString()
  paymentMethodId: string;

  @IsString()
  @IsOptional()
  returnUrl?: string;
}

export class StripeWebhookDto {
  @IsString()
  id: string;

  @IsString()
  object: string;

  @IsString()
  type: string;

  data: any;
}

export class RazorpayWebhookDto {
  @IsString()
  event: string;

  @IsString()
  account_id: string;

  payload: any;
}