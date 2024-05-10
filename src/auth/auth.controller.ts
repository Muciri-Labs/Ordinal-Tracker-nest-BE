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

    //check if user already exists
    const userExists = await this.userService.findOneByEmail(user.email);

    if (userExists) {
      return res.sendStatus(401);
    }

    await this.userService.create(user);

    return res.sendStatus(200);
  }

  @UseGuards(LocalGuard)
  @Post('signin')
  async signin(@Req() req: Request & { user: any }, @Res() res: Response) {
    const obj = req.user;
    let url: string;
    // console.log('redirecting to: ', url);

    if (obj.error) {
      console.log('error in auth: ', obj.error);
      return res.status(401).json({ error: obj.error });
    } else {
      const jwt = obj.jwt_token;
      res.json({ jwt });

      return res.sendStatus(200);
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
}
