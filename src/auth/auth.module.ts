import { Module, Provider } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { UserModule } from '../db/user/user.module';
import { AuthService } from './auth.service';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { GoogleStrategy } from './strategies/google.strategy';

const GoogleStrategyProvider: Provider = {
    provide: 'PassportStrategy',
    useFactory: (authService: AuthService) => new GoogleStrategy(authService),
    inject: [AuthService],
};

@Module({
    imports: [UserModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET,
            signOptions: { expiresIn: '30d' },
        })
    ],
    controllers: [AuthController],
    providers: [AuthService, LocalStrategy, GoogleStrategyProvider]
})
export class AuthModule { }