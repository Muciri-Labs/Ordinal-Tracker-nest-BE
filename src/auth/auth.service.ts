import { Injectable } from '@nestjs/common';
import { UserService } from 'src/db/user/user.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService
    ) { }

    async validateUser(email: string, password: string): Promise<any> {
        // console.log('validateUser', email, password);

        const user = await this.userService.findOneByEmail(email);

        // console.log('user', user);

        if (!user) {
            return null;
        }

        if (user.password !== password) {
            return null;
        }

        const payload = { email };

        return {
            jwt_token: this.jwtService.sign(payload),
        };
    }

    async validateGoogleUser(email: string): Promise<any> {
        // console.log('validateGoogleUser', email);

        const user = await this.userService.findOneByEmail(email);

        if (user) {
            return null;
        }

        const payload = { email };

        // console.log('payload', payload);

        return {
            jwt_token: this.jwtService.sign(payload),
        };
    }
}
