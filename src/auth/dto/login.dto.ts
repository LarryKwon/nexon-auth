import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class LoginDto {
  @IsString({ message: '사용자 아이디는 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '사용자 아이디는 필수 항목입니다.' })
  @MinLength(4, { message: '사용자 아이디는 최소 4자 이상이어야 합니다.' })
  @MaxLength(20, { message: '사용자 아이디는 최대 20자를 넘을 수 없습니다.' })
  username: string;

  @IsString({ message: '비밀번호는 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '비밀번호는 필수 항목입니다.' })
  password: string;
}
