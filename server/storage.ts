import { 
  emails, 
  batches, 
  type User, 
  type InsertUser, 
  type Email, 
  type InsertEmail, 
  type Batch,
  type InsertBatch 
} from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Email related methods
  createBatch(batch: InsertBatch): Promise<Batch>;
  getBatch(batchId: string): Promise<Batch | undefined>;
  updateBatchSentCount(batchId: string, success: boolean): Promise<void>;
  
  // Recipients related methods
  saveRecipients(recipients: InsertEmail[]): Promise<Email[]>;
  getRecipientsByBatchId(batchId: string): Promise<Email[]>;
  updateRecipientStatus(id: number, status: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private emailsMap: Map<number, Email>;
  private batchesMap: Map<string, Batch>;
  currentUserId: number;
  currentEmailId: number;
  currentBatchId: number;

  constructor() {
    this.users = new Map();
    this.emailsMap = new Map();
    this.batchesMap = new Map();
    this.currentUserId = 1;
    this.currentEmailId = 1;
    this.currentBatchId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createBatch(insertBatch: InsertBatch): Promise<Batch> {
    const id = this.currentBatchId++;
    const batch: Batch = { ...insertBatch, id };
    this.batchesMap.set(insertBatch.batchId, batch);
    return batch;
  }

  async getBatch(batchId: string): Promise<Batch | undefined> {
    return this.batchesMap.get(batchId);
  }

  async updateBatchSentCount(batchId: string, success: boolean): Promise<void> {
    const batch = this.batchesMap.get(batchId);
    if (batch) {
      if (success) {
        batch.sentEmails += 1;
      } else {
        batch.failedEmails += 1;
      }
      this.batchesMap.set(batchId, batch);
    }
  }

  async saveRecipients(insertEmails: InsertEmail[]): Promise<Email[]> {
    const savedEmails: Email[] = [];
    
    for (const insertEmail of insertEmails) {
      const id = this.currentEmailId++;
      const email: Email = { ...insertEmail, id };
      this.emailsMap.set(id, email);
      savedEmails.push(email);
    }
    
    return savedEmails;
  }

  async getRecipientsByBatchId(batchId: string): Promise<Email[]> {
    return Array.from(this.emailsMap.values()).filter(
      (email) => email.batchId === batchId
    );
  }

  async updateRecipientStatus(id: number, status: string): Promise<void> {
    const email = this.emailsMap.get(id);
    if (email) {
      email.status = status;
      this.emailsMap.set(id, email);
    }
  }
}

export const storage = new MemStorage();
