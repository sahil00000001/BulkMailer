import nodemailer from 'nodemailer';
import { Credentials, Recipient } from '@shared/schema';

export class EmailSender {
  private transporter: nodemailer.Transporter;
  private credentials: Credentials;
  private template: string;

  constructor(credentials: Credentials, template: string) {
    this.credentials = credentials;
    this.template = template;
    
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: credentials.email,
        pass: credentials.password
      }
    });
  }

  private replacePlaceholders(template: string, recipient: Recipient): string {
    return template
      .replace(/\[Name\]/g, recipient.name)
      .replace(/\[Designation\]/g, recipient.designation)
      .replace(/\[Company Name\]/g, recipient.company);
  }

  async sendEmail(recipient: Recipient): Promise<boolean> {
    try {
      const personalizedContent = this.replacePlaceholders(this.template, recipient);
      
      const mailOptions = {
        from: `"${this.credentials.fullName}" <${this.credentials.email}>`,
        to: recipient.email,
        subject: 'A Quick Hello',
        html: personalizedContent
      };
      
      const info = await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error(`Failed to send email to ${recipient.email}:`, error);
      return false;
    }
  }
}
