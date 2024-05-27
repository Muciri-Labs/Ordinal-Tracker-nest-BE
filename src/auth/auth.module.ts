import { Module, Provider } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { AuthService } from './services/auth.service';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { GoogleStrategy } from './strategies/google.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { EmailService } from './services/email.service';
import { TemplateService } from './services/template.service';

const GoogleStrategyProvider: Provider = {
  provide: 'PassportStrategy',
  useFactory: (authService: AuthService) => new GoogleStrategy(authService),
  inject: [AuthService],
};

@Module({
  imports: [
    UserModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '30d' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    EmailService,
    TemplateService,
    LocalStrategy,
    GoogleStrategyProvider,
    JwtStrategy,
  ],
})
export class AuthModule {}
