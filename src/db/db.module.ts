import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';

console.log(process.env.DB_URL);

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: "postgres",
            url: process.env.DB_URL,
            entities: [__dirname + '/../**/*.entity{.ts,.js}'],
            synchronize: true
        }
        ),
        UserModule,
    ],
})
export class DbModule { }