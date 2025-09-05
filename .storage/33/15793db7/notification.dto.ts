import { IsString, IsEnum, IsUUID, IsOptional, IsObject } from 'class-validator';
import { NotificationType } from '../types/notification.types';

export class CreateNotificationDto {
  @IsUUID()
  userId: string;

  @IsEnum(NotificationType)
  type: NotificationType;

  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsObject()
  @IsOptional()
  metadata?: any;
}

export class SendEmailDto {
  @IsString()
  to: string;

  @IsString()
  subject: string;

  @IsString()
  html: string;

  @IsString()
  @IsOptional()
  text?: string;
}

export class SendSMSDto {
  @IsString()
  to: string;

  @IsString()
  message: string;
}

export class SocketNotificationDto {
  @IsUUID()
  userId: string;

  @IsString()
  event: string;

  @IsObject()
  data: any;
}