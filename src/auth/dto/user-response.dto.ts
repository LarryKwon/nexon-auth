// src/auth/dto/user-response.dto.ts
import { Role } from '../schemas/role.enum'; // 경로 주의

export class UserResponseDto {
  _id: string; // 또는 ObjectId 등 실제 타입
  username: string;
  email?: string;
  roles: Role[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
