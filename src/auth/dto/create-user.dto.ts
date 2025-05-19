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
import { Role } from '../schemas/role.enum'; // 경로에 맞게 수정

export class CreateUserDto {
  @IsString({ message: '사용자 아이디는 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '사용자 아이디는 필수 항목입니다.' })
  @MinLength(4, { message: '사용자 아이디는 최소 4자 이상이어야 합니다.' })
  @MaxLength(20, { message: '사용자 아이디는 최대 20자를 넘을 수 없습니다.' })
  username: string;

  @IsString({ message: '비밀번호는 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '비밀번호는 필수 항목입니다.' })
  @MinLength(8, { message: '비밀번호는 최소 8자 이상이어야 합니다.' })
  password: string;

  @IsEmail({}, { message: '유효한 이메일 주소를 입력해주세요.' })
  @IsOptional()
  @MaxLength(50, { message: '이메일은 최대 50자를 넘을 수 없습니다.' })
  email?: string;

  @IsArray({ message: '역할은 배열 형태여야 합니다.' })
  @IsEnum(Role, {
    each: true,
    message: '유효하지 않은 역할이 포함되어 있습니다.',
  })
  @ArrayMinSize(1, { message: '최소 하나 이상의 역할을 지정해야 합니다.' })
  @IsOptional()
  roles?: Role[];
}
