import {
	integer,
	pgTable,
	text,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";

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
	// Store object key (S3/MinIO) instead of raw binary
	data: text().notNull(),
	createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});
