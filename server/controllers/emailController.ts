import { Request, Response } from 'express';
import { EmailSender } from '../mailer/emailSender';
import { getEmailTemplate } from '../template/emailTemplate';
import { storage } from '../storage';
import { credentialsSchema, Recipient } from '@shared/schema';

// Store active email sending sessions
interface EmailSendingSession {
  batchId: string;
  credentials: any;
  startTime: Date;
  inProgress: boolean;
  totalEmails: number;
  successCount: number;
  failureCount: number;
}

const activeSessions = new Map<string, EmailSendingSession>();

// Process emails for a batch
async function processEmails(batchId: string, credentials: any, recipients: any[]) {
  try {
    // Initialize email sender with credentials and template
    const emailSender = new EmailSender(credentials, getEmailTemplate());
    
    let successCount = 0;
    let failureCount = 0;
    
    // Process emails one by one with delay
    for (let i = 0; i < recipients.length; i++) {
      try {
        const recipient = recipients[i];
        
        console.log(`Sending email to ${recipient.email}...`);
        
        // Send email
        const success = await emailSender.sendEmail({
          name: recipient.name,
          email: recipient.email,
          designation: recipient.designation,
          company: recipient.company,
          status: recipient.status
        });
        
        // Update recipient status
        const newStatus = success ? 'sent' : 'failed';
        await storage.updateRecipientStatus(recipient.id, newStatus);
        
        // Update batch count
        await storage.updateBatchSentCount(batchId, success);
        
        if (success) {
          successCount++;
          console.log(`Email to ${recipient.email} sent successfully`);
        } else {
          failureCount++;
          console.log(`Failed to send email to ${recipient.email}`);
        }
        
        // Update session
        const session = activeSessions.get(batchId);
        if (session) {
          session.successCount = successCount;
          session.failureCount = failureCount;
          activeSessions.set(batchId, session);
        }
        
        // Wait for 2 seconds before sending the next email (rate limiting)
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`Error sending email to ${recipients[i].email}:`, error);
        
        // Update batch with failure
        await storage.updateBatchSentCount(batchId, false);
        failureCount++;
        
        // Update session
        const session = activeSessions.get(batchId);
        if (session) {
          session.failureCount = failureCount;
          activeSessions.set(batchId, session);
        }
      }
    }
    
    // Mark session as completed
    const session = activeSessions.get(batchId);
    if (session) {
      session.inProgress = false;
      activeSessions.set(batchId, session);
    }
    
    console.log(`Email sending completed for batch ${batchId}. Success: ${successCount}, Failed: ${failureCount}`);
  } catch (error) {
    console.error(`Error in email sending process for batch ${batchId}:`, error);
    
    // Mark session as completed
    const session = activeSessions.get(batchId);
    if (session) {
      session.inProgress = false;
      activeSessions.set(batchId, session);
    }
  }
}

export const emailController = {
  // Initialize email sending process
  initiateSendEmails: async (req: Request, res: Response) => {
    try {
      const { credentials, batchId } = req.body;
      
      console.log(`Starting email sending process for batch: ${batchId}`);
      
      // Validate credentials
      const validatedCredentials = credentialsSchema.parse(credentials);
      
      // Get batch and recipients
      const batch = await storage.getBatch(batchId);
      if (!batch) {
        return res.status(404).json({ message: 'Batch not found' });
      }
      
      const recipients = await storage.getRecipientsByBatchId(batchId);
      if (recipients.length === 0) {
        return res.status(404).json({ message: 'No recipients found for this batch' });
      }
      
      // Create session
      const session: EmailSendingSession = {
        batchId,
        credentials: validatedCredentials,
        startTime: new Date(),
        inProgress: true,
        totalEmails: recipients.length,
        successCount: 0,
        failureCount: 0
      };
      
      activeSessions.set(batchId, session);
      
      // Start email sending process in background
      processEmails(batchId, validatedCredentials, recipients);
      
      return res.status(200).json({ 
        message: 'Email sending initialized successfully',
        batchId,
        totalEmails: recipients.length
      });
    } catch (error) {
      console.error('Error initializing email sending:', error);
      return res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Failed to initialize email sending' 
      });
    }
  },
  
  // SSE endpoint to track email sending progress
  emailSendingStatus: async (req: Request, res: Response) => {
    try {
      const { batchId } = req.query;
      
      if (!batchId) {
        return res.status(400).json({ message: 'Batch ID is required' });
      }
      
      const session = activeSessions.get(batchId as string);
      if (!session) {
        return res.status(404).json({ message: 'Email sending session not found' });
      }
      
      // Create Server-Sent Events connection
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      
      // Send initial batch info
      res.write(`data: ${JSON.stringify({
        type: 'init',
        totalEmails: session.totalEmails,
        sent: session.successCount,
        failed: session.failureCount
      })}\n\n`);
      
      // Add response to recipients of updates
      const sessionId = batchId as string;
      const interval = setInterval(async () => {
        const currentSession = activeSessions.get(sessionId);
        
        if (!currentSession) {
          clearInterval(interval);
          return;
        }
        
        // Check if completed
        if (!currentSession.inProgress) {
          // Send completion event
          res.write(`data: ${JSON.stringify({
            type: 'complete',
            sent: currentSession.successCount,
            failed: currentSession.failureCount,
            total: currentSession.totalEmails
          })}\n\n`);
          
          // Cleanup session after some time
          setTimeout(() => {
            activeSessions.delete(sessionId);
          }, 3600000); // Remove after an hour
          
          clearInterval(interval);
          res.end();
        }
      }, 1000);
      
      // Handle client disconnect
      req.on('close', () => {
        clearInterval(interval);
      });
    } catch (error) {
      console.error('Error in email status stream:', error);
      return res.status(500).json({ message: 'Failed to track email sending' });
    }
  },
  
  // Internal method to process emails
  processEmails: async (batchId: string, credentials: any, recipients: any[]) => {
    try {
      // Initialize email sender with credentials and template
      const emailSender = new EmailSender(credentials, getEmailTemplate());
      
      let successCount = 0;
      let failureCount = 0;
      
      // Process emails one by one with delay
      for (let i = 0; i < recipients.length; i++) {
        try {
          const recipient = recipients[i];
          
          console.log(`Sending email to ${recipient.email}...`);
          
          // Send email
          const success = await emailSender.sendEmail({
            name: recipient.name,
            email: recipient.email,
            designation: recipient.designation,
            company: recipient.company,
            status: recipient.status
          });
          
          // Update recipient status
          const newStatus = success ? 'sent' : 'failed';
          await storage.updateRecipientStatus(recipient.id, newStatus);
          
          // Update batch count
          await storage.updateBatchSentCount(batchId, success);
          
          if (success) {
            successCount++;
            console.log(`Email to ${recipient.email} sent successfully`);
          } else {
            failureCount++;
            console.log(`Failed to send email to ${recipient.email}`);
          }
          
          // Update session
          const session = activeSessions.get(batchId);
          if (session) {
            session.successCount = successCount;
            session.failureCount = failureCount;
            activeSessions.set(batchId, session);
          }
          
          // Wait for 2 seconds before sending the next email (rate limiting)
          await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error) {
          console.error(`Error sending email to ${recipients[i].email}:`, error);
          
          // Update batch with failure
          await storage.updateBatchSentCount(batchId, false);
          failureCount++;
          
          // Update session
          const session = activeSessions.get(batchId);
          if (session) {
            session.failureCount = failureCount;
            activeSessions.set(batchId, session);
          }
        }
      }
      
      // Mark session as completed
      const session = activeSessions.get(batchId);
      if (session) {
        session.inProgress = false;
        activeSessions.set(batchId, session);
      }
      
      console.log(`Email sending completed for batch ${batchId}. Success: ${successCount}, Failed: ${failureCount}`);
    } catch (error) {
      console.error(`Error in email sending process for batch ${batchId}:`, error);
      
      // Mark session as completed
      const session = activeSessions.get(batchId);
      if (session) {
        session.inProgress = false;
        activeSessions.set(batchId, session);
      }
    }
  },
  
  getBatchSummary: async (req: Request, res: Response) => {
    try {
      const { batchId } = req.params;
      
      if (!batchId) {
        return res.status(400).json({ message: 'Batch ID is required' });
      }
      
      const batch = await storage.getBatch(batchId);
      if (!batch) {
        return res.status(404).json({ message: 'Batch not found' });
      }
      
      const recipients = await storage.getRecipientsByBatchId(batchId);
      
      // Count statuses
      const sent = recipients.filter(r => r.status === 'sent').length;
      const failed = recipients.filter(r => r.status === 'failed').length;
      const pending = recipients.filter(r => r.status === 'pending').length;
      
      return res.status(200).json({
        batchId,
        total: recipients.length,
        sent,
        failed,
        pending,
        senderName: batch.senderName,
        senderEmail: batch.senderEmail,
        createdAt: batch.createdAt
      });
    } catch (error) {
      console.error('Error fetching batch summary:', error);
      return res.status(500).json({ message: 'Failed to fetch batch summary' });
    }
  }
};
