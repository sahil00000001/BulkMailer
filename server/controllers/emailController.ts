import { Request, Response } from 'express';
import { EmailSender } from '../mailer/emailSender';
import { getEmailTemplate } from '../template/emailTemplate';
import { storage } from '../storage';
import { credentialsSchema, Recipient } from '@shared/schema';

export const emailController = {
  sendEmails: async (req: Request, res: Response) => {
    // Start by validating the request
    try {
      const { credentials, batchId } = req.body;
      
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
      
      // Initialize email sender with credentials and template
      const emailSender = new EmailSender(
        validatedCredentials, 
        getEmailTemplate()
      );
      
      // Create Server-Sent Events connection
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      
      // Send initial batch info
      res.write(`data: ${JSON.stringify({
        type: 'init',
        totalEmails: recipients.length
      })}\n\n`);
      
      // Process emails with rate limiting
      (async () => {
        let successCount = 0;
        let failureCount = 0;
        
        // Process emails one by one with delay
        for (let i = 0; i < recipients.length; i++) {
          try {
            const recipient = recipients[i];
            
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
            } else {
              failureCount++;
            }
            
            // Send update via SSE
            res.write(`data: ${JSON.stringify({
              type: 'update',
              recipientId: recipient.id,
              email: recipient.email,
              status: newStatus,
              sent: successCount,
              failed: failureCount
            })}\n\n`);
            
            // Wait for 2 seconds before sending the next email (rate limiting)
            await new Promise(resolve => setTimeout(resolve, 2000));
          } catch (error) {
            console.error('Error processing email:', error);
            
            // Update batch with failure
            await storage.updateBatchSentCount(batchId, false);
            failureCount++;
            
            // Send error update
            res.write(`data: ${JSON.stringify({
              type: 'error',
              message: 'Failed to send email',
              sent: successCount,
              failed: failureCount
            })}\n\n`);
          }
        }
        
        // Send completion event
        res.write(`data: ${JSON.stringify({
          type: 'complete',
          sent: successCount,
          failed: failureCount,
          total: recipients.length
        })}\n\n`);
        
        // End the SSE connection
        res.end();
      })();
    } catch (error) {
      console.error('Error in email sending:', error);
      return res.status(500).json({ message: 'Failed to send emails' });
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
