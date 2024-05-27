import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    // console.log('validateUser', email, password);

    const user = await this.userService.findOneByEmail(email);
    console.log('user', user);

    if (!user) {
      console.log('no user');
      return null;
    }

    // console.log('password', password);
    // console.log('user.password', user.password);
    const isPasswordMatching = await bcrypt.compare(password, user.password);

    if (!isPasswordMatching) {
      console.log('password not matching');
      return null;
    }

    const payload = { email };
    console.log('payload', payload);

    return {
      jwt_token: this.jwtService.sign(payload),
    };
  }

  async validateGoogleUser(email: string): Promise<any> {
    console.log('validateGoogleUser', email);

    const user = await this.userService.findOneByEmail(email);
    const payload = { email };

    if (user && user.password !== null) {
      return null;
    }

    if (!user) {
      this.userService.googleCreate(payload);
    }

    console.log('payload', payload);

    return {
      jwt_token: this.jwtService.sign(payload),
    };
  }

  async validateJwt(token: any) {
    try {
      console.log('Inside JWT Strategy Validate');

      const result = this.jwtService.verify(token);
      console.log(result);

      return result;
    } catch {
      return { error: 'invalid-token' };
    }
  }
}
