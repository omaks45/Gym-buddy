/* eslint-disable prettier/prettier */
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class NotificationService {
  private transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE, // e.g., 'gmail'
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  async sendVerificationEmail(email: string, fullName: string, token: string) {
    const mailOptions = {
      from: `"Gym Buddy" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Email Verification Code',
      html: `
        <p>Hello ${fullName},</p>
        <p>Your email verification code is:</p>
        <h2>${token}</h2>
        <p>This code will expire in 30 minutes.</p>
        <p>Thanks,<br/>Gym Buddy Team</p>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Verification email failed:', error);
      throw new InternalServerErrorException('Failed to send verification email');
    }
  }

  async sendPasswordResetEmail(email: string, resetPasswordToken: string) {
    const mailOptions = {
      from: `"Gym Buddy" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Reset Your Password',
      html: `
        <p>Hello,</p>
        <p>Your password reset token is:</p>
        <h2>${resetPasswordToken}</h2>
        <p>This token will expire in 30 minutes.</p>
        <p>If you did not request this, please ignore this message.</p>
        <p>Thanks,<br/>Gym Buddy Team</p>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Password reset email failed:', error);
      throw new InternalServerErrorException('Failed to send password reset email');
    }
  }

  async sendWelcomeEmail(email: string, fullName: string) {
    const mailOptions = {
      from: `"Gym Buddy" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to Gym Buddy!',
      html: `
        <p>Hi ${fullName},</p>
        <p>Welcome to <strong>Gym Buddy</strong>! We’re excited to have you onboard.</p>
        <p>Get started by logging into your account and exploring workout partners near you.</p>
        <p>Thanks,<br/>Gym Buddy Team</p>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Welcome email failed:', error);
      throw new InternalServerErrorException('Failed to send welcome email');
    }
  }
}
