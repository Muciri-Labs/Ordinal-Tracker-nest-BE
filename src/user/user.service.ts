import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { TGoogleUser } from './user.types';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(user: User): Promise<User> {
    const result = await this.userRepository.save(user);
    console.log('user created');
    return result;
  }

  async googleCreate(user: TGoogleUser): Promise<User> {
    return await this.userRepository.save(user);
  }

  async findOneById(id: number): Promise<User> {
    return await this.userRepository.findOne({
      where: { id },
    });
  }

  async findOneByEmail(email: string): Promise<User> {
    // console.log('findOneByEmail', email);
    const user = await this.userRepository.findOne({
      where: { email },
    });

    // console.log('user from db', user);

    return user;
  }

  async findOneByTelegramId(telegramId: string): Promise<User> {
    return await this.userRepository.findOne({
      where: { telegramId },
    });
  }

  async update(user: User): Promise<User> {
    return await this.userRepository.save(user);
  }

  async delete(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }

  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    // console.log(salt);

    const hashedPassword = await bcrypt.hash(password, salt);

    return hashedPassword;
  }

  async isEmailVerified(email: string): Promise<boolean> {
    const user = await this.findOneByEmail(email);

    if (!user) {
      return false;
    }

    return user.verifyEmail;
  }
}
