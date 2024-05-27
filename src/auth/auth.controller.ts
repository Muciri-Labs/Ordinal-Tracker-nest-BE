import {
  Body,
  Controller,
  Post,
  Get,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { EmailService } from './services/email.service';
import { AuthService } from './services/auth.service';
import { TemplateService } from './services/template.service';
import { DtoSignup } from './auth.types';
import { User } from 'src/user/entities/user.entity';
import { LocalGuard } from './guards/local.guard';
import { Request, Response } from 'express';
import { GoogleAuthGuard } from './guards/google.guard';
import { EmailVerifiedGuard } from './guards/emailVerify.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly emailService: EmailService,
    private readonly templateService: TemplateService,
  ) {}

  @Post('signup')
  async signup(@Body() body: DtoSignup, @Res() res: Response) {
    let user: User = {
      email: body.email,
      password: body.password,
      verifyEmail: false,
    };

    // console.log('user to add in db: ', user);
    const hashedPassword = await this.userService.hashPassword(user.password);

    // console.log('hashedPassword', hashedPassword);
    user.password = hashedPassword;

    //check if user already exists
    const userExists = await this.userService.findOneByEmail(user.email);

    if (userExists) {
      return res.sendStatus(401);
    }

    await this.userService.create(user);

    await this.emailService.sendEmailVerification(user.email);

    return res.sendStatus(200);
  }

  @UseGuards(LocalGuard)
  @UseGuards(EmailVerifiedGuard)
  @Post('signin')
  async signin(@Req() req: Request & { user: any }, @Res() res: Response) {
    const obj = req.user;

    if (obj.error) {
      console.log('error in auth: ', obj.error);
      return res.status(401).json({ error: obj.error });
    } else {
      const jwt = obj.jwt_token;
      return res.status(200).json({ jwt });
    }
  }

  @Get('google-signin')
  @UseGuards(GoogleAuthGuard)
  async googleSignin() {
    console.log('google-signin');
    return 'google-signin';
  }

  @Get('google-redirect')
  @UseGuards(GoogleAuthGuard)
  async googleRedirect(
    @Req() req: Request & { user: any },
    @Res() res: Response,
  ) {
    const obj = req.user;
    let url: string;
    // console.log('redirecting to: ', url);

    if (obj.error) {
      // console.log('error in auth: ', obj.error);
      res.cookie('jwt-token', 'error');

      url =
        process.env.FRONTEND_BASE_URL + '/auth/api?jwt=' + 'error-' + obj.error;

      return res.redirect(url);
    }

    const jwt = obj.jwt_token;
    url = process.env.FRONTEND_BASE_URL + '/auth/api?jwt=' + jwt;
    const value = res.cookie('jwt-token', jwt);

    return res.redirect(url);
  }

  @Get('verify-email')
  async verifyEmail(@Req() req: Request, @Res() res: Response) {
    const token = req.query.token;

    try {
      const decoded = await this.authService.validateJwt(token as string);

      if (decoded.error) {
        return res.status(401).json({ error: decoded.error });
      }

      if (decoded.type === 'verify-token') {
        const user = await this.userService.findOneByEmail(decoded.email);

        await this.userService.update({
          id: user.id,
          email: user.email,
          password: user.password,
          verifyEmail: true,
        });

        const html = this.templateService.getEmailVerifiedTemplate();

        if (user) {
          user.verifyEmail = true;
          await this.userService.update(user);
          return res.send(html);
        }
      } else {
        return res.status(401).json({ error: 'Invalid token' });
      }
    } catch (error) {
      console.log('error in verify-email: ', error);
      return res.sendStatus(401);
    }
  }
}
