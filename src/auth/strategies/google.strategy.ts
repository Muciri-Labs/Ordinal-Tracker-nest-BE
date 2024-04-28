import { Strategy, Profile } from "passport-google-oauth20";
import { PassportStrategy } from "@nestjs/passport";
import { AuthService } from "../auth.service";

export class GoogleStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly authService: AuthService
    ) {
        console.log('GoogleStrategy init');
        super({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: 'http://localhost:3000/auth/google-redirect',
            scope: ['email', 'profile'],
            session: false,
        });
    }

    async validate(accessToken: string, refreshToken: string, profile: Profile) {
        let email: string;

        if (profile.emails[0].verified) {
            email = profile.emails[0].value;
            // console.log('email', email);

            const jwt = await this.authService.validateGoogleUser(email);

            if (!jwt) {
                return null;
            }

            // console.log('jwt', jwt);

            return jwt;
        }
    }
}