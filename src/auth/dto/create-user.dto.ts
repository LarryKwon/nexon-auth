import {
  IsString,
  IsNotEmpty,
  MinLength,
  IsEmail,
  IsOptional,
  IsEnum,
  IsArray,
  ArrayMinSize,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'; // Swagger import 추가
import { Role } from '../schemas/role.enum'; // Role Enum 경로 확인

export class CreateUserDto {
  @ApiProperty({
    description: '생성할 사용자의 아이디',
    example: 'newMapleDev',
    minLength: 4,
    maxLength: 20,
    required: true,
  })
  @IsString({ message: '사용자 아이디는 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '사용자 아이디는 필수 항목입니다.' })
  @MinLength(4, { message: '사용자 아이디는 최소 4자 이상이어야 합니다.' })
  @MaxLength(20, { message: '사용자 아이디는 최대 20자를 넘을 수 없습니다.' })
  username: string;

  @ApiProperty({
    description: '생성할 사용자의 비밀번호',
    example: 'SecureP@ss1!',
    minLength: 8,
    type: 'string',
    format: 'password',
    required: true,
  })
  @IsString({ message: '비밀번호는 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '비밀번호는 필수 항목입니다.' })
  @MinLength(8, { message: '비밀번호는 최소 8자 이상이어야 합니다.' })
  password: string;

  @ApiPropertyOptional({
    // 선택적 필드이므로 ApiPropertyOptional 사용
    description: '생성할 사용자의 이메일 주소 (선택 사항)',
    example: 'dev@maplestory.com',
    maxLength: 50,
  })
  @IsEmail({}, { message: '유효한 이메일 주소를 입력해주세요.' })
  @IsOptional()
  @MaxLength(50, { message: '이메일은 최대 50자를 넘을 수 없습니다.' })
  email?: string;

  @ApiPropertyOptional({
    // 선택적 필드
    description:
      '사용자에게 할당할 역할 목록 (선택 사항, 기본값은 서비스에서 USER로 설정될 수 있음)',
    example: [Role.USER, Role.OPERATOR],
    enum: Role,
    isArray: true, // 배열 타입임을 명시
  })
  @IsArray({ message: '역할은 배열 형태여야 합니다.' })
  @IsEnum(Role, {
    each: true, // 배열의 각 요소가 Enum 값인지 확인
    message: '유효하지 않은 역할이 포함되어 있습니다.',
  })
  @ArrayMinSize(1, { message: '최소 하나 이상의 역할을 지정해야 합니다.' }) // 역할이 제공된다면 최소 1개 이상
  @IsOptional()
  roles?: Role[];
}
