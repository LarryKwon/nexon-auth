import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'; // Swagger import 추가
import { Role } from '../schemas/role.enum'; // Role Enum 경로 확인

export class UserResponseDto {
  @ApiProperty({
    description: '사용자의 고유 MongoDB ID',
    example: '605c72ef97910a001f16a29a',
  })
  _id: string;

  @ApiProperty({
    description: '사용자 아이디',
    example: 'mapleUser123',
  })
  username: string;

  @ApiPropertyOptional({
    // 선택적 필드
    description: '사용자 이메일 주소',
    example: 'user@maplestory.com',
  })
  email?: string;

  @ApiProperty({
    description: '사용자의 역할 목록',
    example: [Role.USER],
    enum: Role,
    isArray: true,
  })
  roles: Role[];

  @ApiProperty({
    description: '계정 활성화 상태',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: '계정 생성 일시 (ISO 8601 형식)',
    example: '2023-01-15T10:30:00.000Z',
    type: String, // Date 객체지만, JSON 응답 시 보통 문자열로 직렬화됨
    format: 'date-time',
  })
  createdAt: Date;

  @ApiProperty({
    description: '계정 마지막 수정 일시 (ISO 8601 형식)',
    example: '2023-01-16T11:00:00.000Z',
    type: String,
    format: 'date-time',
  })
  updatedAt: Date;
}
