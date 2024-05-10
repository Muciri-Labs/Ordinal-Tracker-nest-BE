import { IsEmail, IsString, Length } from 'class-validator';

export class DtoSignup {
  @IsEmail()
  email: string;

  @IsString()
  @Length(6, 20)
  password: string;
}

export class DtoSignin {
  @IsEmail()
  email: string;

  @IsString()
  @Length(6, 20)
  password: string;
}
