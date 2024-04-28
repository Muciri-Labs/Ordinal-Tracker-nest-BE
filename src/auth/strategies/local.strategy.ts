import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { AuthService } from "../auth.service";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly authService: AuthService
    ) {
        console.log('LocalStrategy init');
        super({
            usernameField: 'email',
            passwordField: 'password'
        });
    }

    async validate(email: string, password: string): Promise<any> {
        // console.log('validate', email, password);
        const jwt = await this.authService.validateUser(email, password);
        if (!jwt) {
            return null;
        }

        return jwt;
    }
}