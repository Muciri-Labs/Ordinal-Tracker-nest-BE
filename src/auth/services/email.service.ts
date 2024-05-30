import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';
import { TemplateService } from './template.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class EmailService {
  private resend: Resend;

  constructor(
    private readonly templateService: TemplateService,
    private readonly jwtService: JwtService,
  ) {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  async sendEmailVerification(email: string) {
    const token = this.jwtService.sign({
      type: 'verify-token',
      email,
    });

    const html = this.templateService.getOnboardingTemplate(token);

    const { data, error } = await this.resend.emails.send({
      from: 'Storm Glass ⚡ <onboarding@stormglass.xyz>',
      to: [email],
      subject: 'Confirm your email address',
      html: html,
    });

    if (error) {
      return console.error({ error });
    }

    console.log({ data });
  }

  async sendResetPasswordEmail(email: string) {
    const token = this.jwtService.sign({
      type: 'reset-password',
      email,
    });

    const html = this.templateService.getResetPasswordTemplate(token);

    const { data, error } = await this.resend.emails.send({
      from: 'Storm Glass ⚡ <onboarding@stormglass.xyz>',
      to: [email],
      subject: 'Reset your password',
      html: html,
    });
  }
}
