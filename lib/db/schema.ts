import { pgTable, text, serial, timestamp, jsonb, varchar } from 'drizzle-orm/pg-core'

// Albums table
export const albums = pgTable('albums', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  coverImage: text('cover_image').notNull(),
  location: varchar('location', { length: 255 }).notNull(),
  year: varchar('year', { length: 4 }).notNull(),
  aspectRatio: varchar('aspect_ratio', { length: 50 }).notNull().default('3/2'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Images table
export const images = pgTable('images', {
  id: serial('id').primaryKey(),
  albumId: serial('album_id').references(() => albums.id, { onDelete: 'cascade' }).notNull(),
  src: text('src').notNull(),
  alt: text('alt').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  location: varchar('location', { length: 255 }).notNull(),
  aspectRatio: varchar('aspect_ratio', { length: 50 }).notNull().default('3/2'),
  order: serial('order').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Site content table for multi-language support
export const siteContent = pgTable('site_content', {
  id: serial('id').primaryKey(),
  language: varchar('language', { length: 10 }).notNull().default('en'),
  content: jsonb('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Admin users table
export const adminUsers = pgTable('admin_users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 100 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: varchar('role', { length: 50 }).notNull().default('admin'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Theme settings table
export const themeSettings = pgTable('theme_settings', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  primary: varchar('primary', { length: 50 }).notNull(),
  primaryHover: varchar('primary_hover', { length: 50 }).notNull(),
  primaryText: varchar('primary_text', { length: 50 }).notNull(),
  isActive: varchar('is_active', { length: 10 }).notNull().default('false'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export type Album = typeof albums.$inferSelect
export type NewAlbum = typeof albums.$inferInsert
export type Image = typeof images.$inferSelect
export type NewImage = typeof images.$inferInsert
export type SiteContent = typeof siteContent.$inferSelect
export type NewSiteContent = typeof siteContent.$inferInsert
export type AdminUser = typeof adminUsers.$inferSelect
export type NewAdminUser = typeof adminUsers.$inferInsert
export type ThemeSettings = typeof themeSettings.$inferSelect
export type NewThemeSettings = typeof themeSettings.$inferInsert
