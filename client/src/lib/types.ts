export type Recipient = {
  name: string;
  email: string;
  designation: string;
  company: string;
  status: 'pending' | 'sent' | 'failed';
};

export type Credentials = {
  fullName: string;
  email: string;
  password: string;
};

export type EmailBatch = {
  batchId: string;
  senderName: string;
  senderEmail: string;
  totalEmails: number;
  sentEmails: number;
  failedEmails: number;
  createdAt: string;
};
