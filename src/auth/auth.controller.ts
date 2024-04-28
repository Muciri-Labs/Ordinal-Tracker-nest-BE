import { Body, Controller, Post, Get, UseGuards, Req, Res } from '@nestjs/common';
import { UserService } from 'src/db/user/user.service';
import { DtoSignup } from './auth.types';
import { User } from 'src/db/user/entities/user.entity';
import { LocalGuard } from './guards/local.guard';
import { Request, Response } from 'express';
import { GoogleAuthGuard } from './guards/google.guard';

@Controller('auth')
export class AuthController {
    constructor(private readonly userService: UserService) { }

    @Post('signup')
    async signup(@Body() body: DtoSignup) {
        const user: User = {
            email: body.email,
            password: body.password,
        };

        await this.userService.create(user);

        return 'signup';
    }

    @UseGuards(LocalGuard)
    @Post('signin')
    async signin(@Req() req: Request & { user: any }, @Res() res: Response) {
        // console.log('req.user', req.user);

        const jwt = req.user.jwt_token;

        res.cookie('jwt-token', jwt, { httpOnly: true, secure: true });

        return res.sendStatus(200);
    }

    @Get('google-signin')
    @UseGuards(GoogleAuthGuard)
    async googleSignin() {
        // console.log('google-signin');
        return 'google-signin';
    }

    @Get('google-redirect')
    @UseGuards(GoogleAuthGuard)
    async googleRedirect(@Req() req: Request & { user: any }, @Res() res: Response) {
        const jwt = req.user.jwt_token;

        // console.log('jwt in redirect', jwt);

        res.cookie('jwt-token', jwt, { httpOnly: true, secure: true });

        return res.sendStatus(200);
    }
}
