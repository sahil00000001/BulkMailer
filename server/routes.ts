import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { uploadController } from "./controllers/uploadController";
import { emailController } from "./controllers/emailController";

// Setup multer for memory storage (for Excel parsing)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      cb(null, true);
    } else {
      cb(new Error('Only .xlsx files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Sample Excel download
  app.get('/api/excel/sample', uploadController.downloadSample);

  // Excel upload
  app.post('/api/excel/upload', upload.single('file'), uploadController.uploadExcel);

  // Get recipients for a batch
  app.get('/api/recipients/:batchId', uploadController.getRecipients);

  // Start email sending process
  app.post('/api/send', emailController.initiateSendEmails);

  // Get email sending status (SSE)
  app.get('/api/send/status', emailController.emailSendingStatus);

  // Get batch summary
  app.get('/api/summary/:batchId', emailController.getBatchSummary);

  const httpServer = createServer(app);

  return httpServer;
}
