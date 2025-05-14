import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const emails = pgTable("emails", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  designation: text("designation").notNull(),
  company: text("company").notNull(),
  status: text("status").notNull().default("pending"),
  batchId: text("batch_id").notNull(),
});

export const batches = pgTable("batches", {
  id: serial("id").primaryKey(),
  batchId: text("batch_id").notNull().unique(),
  senderName: text("sender_name").notNull(),
  senderEmail: text("sender_email").notNull(),
  totalEmails: integer("total_emails").notNull(),
  sentEmails: integer("sent_emails").notNull().default(0),
  failedEmails: integer("failed_emails").notNull().default(0),
  createdAt: text("created_at").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertEmailSchema = createInsertSchema(emails).pick({
  name: true,
  email: true,
  designation: true,
  company: true,
  status: true,
  batchId: true,
});

export const insertBatchSchema = createInsertSchema(batches).pick({
  batchId: true,
  senderName: true,
  senderEmail: true,
  totalEmails: true,
  sentEmails: true,
  failedEmails: true,
  createdAt: true,
});

export const credentialsSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address").refine(
    (email) => email.endsWith("@gmail.com"),
    "Only Gmail addresses are supported"
  ),
  password: z.string().min(1, "Password is required"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertEmail = z.infer<typeof insertEmailSchema>;
export type Email = typeof emails.$inferSelect;

export type InsertBatch = z.infer<typeof insertBatchSchema>;
export type Batch = typeof batches.$inferSelect;

export type Credentials = z.infer<typeof credentialsSchema>;

export type Recipient = {
  name: string;
  email: string;
  designation: string;
  company: string;
  status: string;
};
