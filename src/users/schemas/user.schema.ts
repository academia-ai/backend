import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

export enum AccountStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  password: string;

  @Prop()
  otp: number;

  @Prop()
  otpExpiry?: Date; // Better as Date type

  @Prop()
  refreshToken?: string;

  @Prop()
  refreshTokenExpiry?: Date;

  @Prop({ default: 0 })
  tokenVersion: number;

  @Prop({
    type: String,
    enum: AccountStatus,
    default: AccountStatus.PENDING,
  })
  accountStatus: AccountStatus;

  @Prop({ default: true })
  isActive: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
