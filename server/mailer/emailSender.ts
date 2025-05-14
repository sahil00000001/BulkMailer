import nodemailer from 'nodemailer';
import { Credentials, Recipient } from '@shared/schema';

export class EmailSender {
  private transporter: nodemailer.Transporter;
  private credentials: Credentials;
  private template: string;
  private isTransporterVerified: boolean = false;

  constructor(credentials: Credentials, template: string) {
    this.credentials = credentials;
    this.template = template;
    
    console.log(`Creating email transporter for ${credentials.email}`);
    
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // use SSL
      auth: {
        user: credentials.email,
        pass: credentials.password // This should be an app password
      },
      debug: true, // Enable additional debug logs
      logger: true // Log to console
    });
  }
  
  // Verify transporter connection
  private async verifyTransporter(): Promise<boolean> {
    if (this.isTransporterVerified) {
      return true;
    }
    
    try {
      console.log('Verifying SMTP connection...');
      await this.transporter.verify();
      console.log('SMTP connection verified successfully');
      this.isTransporterVerified = true;
      return true;
    } catch (error: any) {
      console.error('SMTP verification failed:', error);
      
      // Provide more helpful error messages based on error type
      if (error.code === 'EAUTH') {
        console.error("\n==========================================================");
        console.error("GMAIL AUTHENTICATION ERROR");
        console.error("==========================================================");
        console.error("Your Gmail credentials were rejected. This is likely because:");
        console.error("1. You are using your regular Gmail password instead of an App Password");
        console.error("2. Your App Password is incorrect or has been revoked");
        console.error("\nTo fix this:");
        console.error("- Go to https://myaccount.google.com/apppasswords");
        console.error("- Make sure 2-Step Verification is enabled");
        console.error("- Generate a new App Password specifically for this application");
        console.error("- Enter the 16-character App Password without spaces");
        console.error("==========================================================\n");
      } else if (error.code === 'ESOCKET') {
        console.error("Failed to connect to Gmail's SMTP server. Please check your internet connection.");
      }
      
      return false;
    }
  }

  private replacePlaceholders(template: string, recipient: Recipient): string {
    return template
      .replace(/\[Name\]/g, recipient.name)
      .replace(/\[Designation\]/g, recipient.designation)
      .replace(/\[Company Name\]/g, recipient.company)
      .replace(/\[SENDER_NAME\]/g, this.credentials.fullName);
  }

  async sendEmail(recipient: Recipient): Promise<boolean> {
    try {
      // Verify transporter before sending
      const isVerified = await this.verifyTransporter();
      if (!isVerified) {
        console.error('Failed to verify SMTP connection before sending');
        return false;
      }
      
      const personalizedContent = this.replacePlaceholders(this.template, recipient);
      
      const mailOptions = {
        from: `"${this.credentials.fullName}" <${this.credentials.email}>`,
        to: recipient.email,
        subject: 'A Quick Hello',
        html: personalizedContent
      };
      
      console.log(`Sending email to ${recipient.email}...`);
      
      const info = await this.transporter.sendMail(mailOptions);
      console.log(`Email sent to ${recipient.email}: ${JSON.stringify(info)}`);
      return true;
    } catch (error: any) {
      console.error(`Failed to send email to ${recipient.email}:`, error);
      
      // Handle specific authentication errors
      if (error.code === 'EAUTH') {
        console.error('AUTHENTICATION ERROR: Please make sure you are using an App Password and not your regular Gmail password!');
        console.error('Get an App Password at: https://myaccount.google.com/apppasswords');
      }
      
      return false;
    }
  }
}
