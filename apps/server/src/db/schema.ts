import { integer, pgTable, varchar, timestamp, text } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  age: integer().notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
});

export const pdfFilesTable = pgTable("pdf_files", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  filename: varchar({ length: 512 }).notNull(),
  mimeType: varchar({ length: 128 }).notNull(),
  // Store as base64 text for compatibility
  data: text().notNull(),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});
