import nodemailer from 'nodemailer';
import 'dotenv/config';

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASSWORD = process.env.SMTP_PASSWORD;
const CONFIRMATION_BASE_URL = process.env.CONFIRMATION_BASE_URL;

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASSWORD,
  },
});

export const emailService = {
  async sendConfirmationEmail(email: string, confirmationCode: string): Promise<void> {
    try {
      const confirmationUrl = `${CONFIRMATION_BASE_URL}/confirm-email?code=${confirmationCode}`;

      const mailOptions = {
        from: SMTP_USER,
        to: email,
        subject: 'Подтверждение email',
        html: `
        <h1>Спасибо за регистрацию</h1>
        <p>Для завершения регистрации перейдите по ссылке ниже:</p>
        <p><a href="${confirmationUrl}">завершить регистрацию</a></p>
      `,
      };

      await transporter.sendMail(mailOptions);
    } catch (error) {
      throw error;
    }
  },
};
