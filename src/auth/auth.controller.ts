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
import { DtoSignup } from './auth.types';
import { User } from 'src/user/entities/user.entity';
import { LocalGuard } from './guards/local.guard';
import { Request, Response } from 'express';
import { GoogleAuthGuard } from './guards/google.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly userService: UserService) {}

  @Post('signup')
  async signup(@Body() body: DtoSignup, @Res() res: Response) {
    let user: User = {
      email: body.email,
      password: body.password,
    };

    // console.log('user to add in db: ', user);
    const hashedPassword = await this.userService.hashPassword(user.password);

    // console.log('hashedPassword', hashedPassword);
    user.password = hashedPassword;

    await this.userService.create(user);

    return res.sendStatus(200);
  }

  @UseGuards(LocalGuard)
  @Post('signin')
  async signin(@Req() req: Request & { user: any }, @Res() res: Response) {
    console.log('req.user', req.user);

    const jwt = req.user.jwt_token;

    console.log('attaching jwt token: ', jwt);

    res.json({ jwt });

    return res.sendStatus(200);
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
    console.log('google-redirect');

    const jwt = req.user.jwt_token;

    const value = res.cookie('jwt-token', jwt);

    const url = process.env.FRONTEND_BASE_URL + '/auth/api?jwt=' + jwt;

    console.log('redirecting to: ', url);

    return res.redirect(url);
  }
}
