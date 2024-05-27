import { Injectable } from '@nestjs/common';

@Injectable()
export class TemplateService {
  getOnboardingTemplate(token: string) {
    const url = `${process.env.BACKEND_BASE_URL}/auth/verify-email?token=${token}`;

    return `
    <strong>Click on the following link to confirm your account</strong>
    <a href="${url}">click here!!</a>
    `;
  }

  getEmailVerifiedTemplate() {
    return `
    <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #000000;
      color: #ffffff;
    }
    h1 {
      text-align: center;
      padding: 50px 0;
    }
    </style>
    <h1>Email has been verified!</h1>
    `;
  }
}
