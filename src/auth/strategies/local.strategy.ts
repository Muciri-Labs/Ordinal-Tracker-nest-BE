import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { AuthService } from "../auth.service";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly authService: AuthService
    ) {
        console.log('LocalStrategy');
        super({
            usernameField: 'email',
            passwordField: 'password'
        });
    }


    async validate(username: string, password: string): Promise<any> {
        console.log('validate', username, password);
        const jwt = await this.authService.validateUser(username, password);
        if (!jwt) {
            return null;
        }
        return jwt;
    }
}