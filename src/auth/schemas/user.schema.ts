import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Role } from './role.enum';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, trim: true })
  username: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ type: [String], enum: Role, required: true, default: [Role.USER] })
  roles: Role[];

  @Prop({ unique: true, sparse: true, trim: true })
  email?: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  currentHashedRefreshToken?: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({ username: 1 });
UserSchema.index({ email: 1 });
