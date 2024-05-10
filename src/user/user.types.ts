import { IsEmail } from 'class-validator';

export class TGoogleUser {
  @IsEmail()
  email: string;
}
