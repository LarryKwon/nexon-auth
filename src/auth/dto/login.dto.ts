import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger'; // Swagger import 추가

export class LoginDto {
  @ApiProperty({
    description: '사용자 로그인 아이디',
    example: 'mapleUser123',
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
    description: '사용자 비밀번호',
    example: 'P@sswOrd123!',
    type: 'string', // type을 명시해주는 것이 좋습니다 (특히 Swagger UI에서)
    format: 'password', // Swagger UI에서 입력 필드를 비밀번호 형태로 보여줌
    required: true,
  })
  @IsString({ message: '비밀번호는 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '비밀번호는 필수 항목입니다.' })
  password: string;
}
