import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { UserModule } from '../db/user/user.module';
import { AuthService } from './auth.service';
import { LocalStrategy } from './strategies/local.strategy';

@Module({
    imports: [UserModule],
    controllers: [AuthController],
    providers: [AuthService, LocalStrategy]
})
export class AuthModule { }
