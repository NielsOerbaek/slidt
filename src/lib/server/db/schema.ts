import {
  pgTable, uuid, text, timestamp, jsonb,
  integer, boolean, index, unique,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import type { Field } from '../../../renderer/types.ts';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  lastSeenAt: timestamp('last_seen_at', { withTimezone: true }),
});

export const themes = pgTable('themes', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  tokens: jsonb('tokens').notNull().$type<Record<string, string>>(),
  scope: text('scope').notNull().default('global').$type<'global' | 'deck'>(),
  deckId: uuid('deck_id'),
  isPreset: boolean('is_preset').notNull().default(false),
});

export const decks = pgTable('decks', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  lang: text('lang').notNull().default('da'),
  ownerId: uuid('owner_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  themeId: uuid('theme_id').references(() => themes.id, { onDelete: 'set null' }),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  slideOrder: uuid('slide_order').array().notNull().default(sql`ARRAY[]::uuid[]`),
});

export const slideTypes = pgTable('slide_types', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  label: text('label').notNull(),
  fields: jsonb('fields').notNull().$type<Field[]>(),
  htmlTemplate: text('html_template').notNull(),
  css: text('css').notNull(),
  scope: text('scope').notNull().default('global').$type<'global' | 'deck'>(),
  deckId: uuid('deck_id').references(() => decks.id, { onDelete: 'cascade' }),
}, (t) => [
  unique('slide_types_name_scope_deck').on(t.name, t.scope, t.deckId),
]);

export const slides = pgTable('slides', {
  id: uuid('id').primaryKey().defaultRandom(),
  deckId: uuid('deck_id').notNull().references(() => decks.id, { onDelete: 'cascade' }),
  typeId: uuid('type_id').notNull().references(() => slideTypes.id),
  data: jsonb('data').notNull().$type<Record<string, unknown>>(),
  orderIndex: integer('order_index').notNull(),
}, (t) => [
  index('slides_deck_order_idx').on(t.deckId, t.orderIndex),
]);

export const assets = pgTable('assets', {
  id: uuid('id').primaryKey().defaultRandom(),
  deckId: uuid('deck_id').notNull().references(() => decks.id, { onDelete: 'cascade' }),
  kind: text('kind').notNull(),
  storagePath: text('storage_path').notNull(),
  filename: text('filename').notNull(),
  uploadedById: uuid('uploaded_by_id').notNull().references(() => users.id),
});

export const agentMessages = pgTable('agent_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  deckId: uuid('deck_id').notNull().references(() => decks.id, { onDelete: 'cascade' }),
  role: text('role').notNull().$type<'user' | 'assistant'>(),
  content: text('content').notNull(),
  toolCalls: jsonb('tool_calls').$type<unknown[]>(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const shareLinks = pgTable('share_links', {
  id: uuid('id').primaryKey().defaultRandom(),
  deckId: uuid('deck_id').notNull().references(() => decks.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
});

export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
});
