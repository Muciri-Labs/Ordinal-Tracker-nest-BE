import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { EmailService } from '../services/email.service';

@Injectable()
export class EmailVerifiedGuard implements CanActivate {
  constructor(
    private readonly userService: UserService,
    private readonly emailService: EmailService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.body;

    const isEmailVerified = await this.userService.isEmailVerified(user.email);

    if (!isEmailVerified) {
      this.emailService.sendEmailVerification(user.email);

      throw new UnauthorizedException({
        error: 'Email not verified yet!',
      });
    }

    return true;
  }
}
