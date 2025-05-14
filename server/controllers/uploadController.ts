import { Request, Response } from 'express';
import { ExcelParser } from '../utils/excelParser';
import { storage } from '../storage';
import { InsertEmail, InsertBatch } from '@shared/schema';
import { v4 as uuidv4 } from 'uuid';

export const uploadController = {
  // Download sample Excel file
  downloadSample: (req: Request, res: Response) => {
    try {
      const sampleBuffer = ExcelParser.generateSampleExcel();
      
      res.setHeader('Content-Disposition', 'attachment; filename=sample.xlsx');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      
      return res.send(sampleBuffer);
    } catch (error) {
      console.error('Error generating sample file:', error);
      return res.status(500).json({ message: 'Failed to generate sample file' });
    }
  },
  
  // Upload and parse Excel file
  uploadExcel: async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
      
      // Parse Excel file
      const recipients = ExcelParser.parseExcelFile(req.file.buffer);
      
      if (recipients.length === 0) {
        return res.status(400).json({ message: 'No valid recipients found in the file' });
      }
      
      // Create a batch ID
      const batchId = uuidv4();
      
      // Store credentials in session for later use
      const { fullName, email } = req.body;
      
      // Create batch record
      const batchData: InsertBatch = {
        batchId,
        senderName: fullName,
        senderEmail: email,
        totalEmails: recipients.length,
        sentEmails: 0,
        failedEmails: 0,
        createdAt: new Date().toISOString()
      };
      
      await storage.createBatch(batchData);
      
      // Save recipients to storage
      const recipientData: InsertEmail[] = recipients.map(recipient => ({
        name: recipient.name,
        email: recipient.email,
        designation: recipient.designation,
        company: recipient.company,
        status: 'pending',
        batchId
      }));
      
      await storage.saveRecipients(recipientData);
      
      return res.status(200).json({
        message: 'File uploaded successfully',
        batchId,
        recipients
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      return res.status(500).json({ message: 'Failed to process the Excel file' });
    }
  },
  
  // Get recipients by batch ID
  getRecipients: async (req: Request, res: Response) => {
    try {
      const { batchId } = req.params;
      
      if (!batchId) {
        return res.status(400).json({ message: 'Batch ID is required' });
      }
      
      const recipients = await storage.getRecipientsByBatchId(batchId);
      const batch = await storage.getBatch(batchId);
      
      if (!batch) {
        return res.status(404).json({ message: 'Batch not found' });
      }
      
      return res.status(200).json({
        recipients,
        batch
      });
    } catch (error) {
      console.error('Error fetching recipients:', error);
      return res.status(500).json({ message: 'Failed to fetch recipients' });
    }
  }
};
