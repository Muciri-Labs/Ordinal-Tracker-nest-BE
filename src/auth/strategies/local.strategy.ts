import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    console.log('LocalStrategy init');
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  async validate(email: string, password: string): Promise<any> {
    // console.log('validate', email, password);
    const result = await this.authService.validateUser(email, password);
    if (!result) {
      console.log('invalid credentials');

      return {
        error: 'invalid-credentials',
      };
    }

    console.log('result in local strategy', result);
    return result;
  }
}
