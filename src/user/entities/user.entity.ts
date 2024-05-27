import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  verifyEmail: boolean;

  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true })
  telegramId?: string;

  @Column({ nullable: true })
  isOAuth?: boolean;
}
