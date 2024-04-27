import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
    constructor() { }

    async validateUser(username: string, password: string): Promise<any> {
        //TODO return JWT if all cases pass
        console.log('validateUser', username, password);
        return 'jwt';
    }
}
