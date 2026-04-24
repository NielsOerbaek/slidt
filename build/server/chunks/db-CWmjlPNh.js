import { a as __exportAll } from './chunk-Do6Vi0cX.js';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { pgTable, jsonb, timestamp, boolean, text, uuid, unique, integer, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

//#region src/lib/server/db/schema.ts
var schema_exports = /* @__PURE__ */ __exportAll({
	agentMessages: () => agentMessages,
	apiKeys: () => apiKeys,
	assets: () => assets,
	deckCollaborators: () => deckCollaborators,
	decks: () => decks,
	issues: () => issues,
	sessions: () => sessions,
	shareLinks: () => shareLinks,
	slideTypes: () => slideTypes,
	slides: () => slides,
	themes: () => themes,
	users: () => users
});
var users = pgTable("users", {
	id: uuid("id").primaryKey().defaultRandom(),
	email: text("email").notNull().unique(),
	passwordHash: text("password_hash").notNull(),
	name: text("name").notNull(),
	isAdmin: boolean("is_admin").notNull().default(false),
	lastSeenAt: timestamp("last_seen_at", { withTimezone: true }),
	preferences: jsonb("preferences").notNull().default({}).$type()
});
var themes = pgTable("themes", {
	id: uuid("id").primaryKey().defaultRandom(),
	name: text("name").notNull(),
	tokens: jsonb("tokens").notNull().$type(),
	scope: text("scope").notNull().default("global").$type(),
	deckId: uuid("deck_id"),
	isPreset: boolean("is_preset").notNull().default(false),
	systemPrompt: text("system_prompt")
});
var decks = pgTable("decks", {
	id: uuid("id").primaryKey().defaultRandom(),
	title: text("title").notNull(),
	lang: text("lang").notNull().default("da"),
	ownerId: uuid("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
	themeId: uuid("theme_id").references(() => themes.id, { onDelete: "set null" }),
	updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
	slideOrder: uuid("slide_order").array().notNull().default(sql`ARRAY[]::uuid[]`)
});
var slideTypes = pgTable("slide_types", {
	id: uuid("id").primaryKey().defaultRandom(),
	name: text("name").notNull(),
	label: text("label").notNull(),
	fields: jsonb("fields").notNull().$type(),
	htmlTemplate: text("html_template").notNull(),
	css: text("css").notNull(),
	scope: text("scope").notNull().default("global").$type(),
	deckId: uuid("deck_id").references(() => decks.id, { onDelete: "cascade" })
}, (t) => [unique("slide_types_name_scope_deck").on(t.name, t.scope, t.deckId)]);
var slides = pgTable("slides", {
	id: uuid("id").primaryKey().defaultRandom(),
	deckId: uuid("deck_id").notNull().references(() => decks.id, { onDelete: "cascade" }),
	typeId: uuid("type_id").notNull().references(() => slideTypes.id),
	data: jsonb("data").notNull().$type(),
	orderIndex: integer("order_index").notNull()
}, (t) => [index("slides_deck_order_idx").on(t.deckId, t.orderIndex)]);
var assets = pgTable("assets", {
	id: uuid("id").primaryKey().defaultRandom(),
	deckId: uuid("deck_id").notNull().references(() => decks.id, { onDelete: "cascade" }),
	kind: text("kind").notNull(),
	storagePath: text("storage_path").notNull(),
	filename: text("filename").notNull(),
	uploadedById: uuid("uploaded_by_id").notNull().references(() => users.id)
});
var agentMessages = pgTable("agent_messages", {
	id: uuid("id").primaryKey().defaultRandom(),
	deckId: uuid("deck_id").notNull().references(() => decks.id, { onDelete: "cascade" }),
	role: text("role").notNull().$type(),
	content: text("content").notNull(),
	toolCalls: jsonb("tool_calls").$type(),
	rawContent: jsonb("raw_content").$type(),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});
var shareLinks = pgTable("share_links", {
	id: uuid("id").primaryKey().defaultRandom(),
	deckId: uuid("deck_id").notNull().references(() => decks.id, { onDelete: "cascade" }),
	token: text("token").notNull().unique(),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	expiresAt: timestamp("expires_at", { withTimezone: true })
});
var apiKeys = pgTable("api_keys", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
	name: text("name").notNull(),
	keyHash: text("key_hash").notNull().unique(),
	lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});
var sessions = pgTable("sessions", {
	id: uuid("id").primaryKey(),
	userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
	expiresAt: timestamp("expires_at", { withTimezone: true }).notNull()
});
var issues = pgTable("issues", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
	deckId: uuid("deck_id").references(() => decks.id, { onDelete: "set null" }),
	title: text("title").notNull(),
	body: text("body").notNull().default(""),
	severity: text("severity").notNull().default("medium").$type(),
	status: text("status").notNull().default("open").$type(),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});
var deckCollaborators = pgTable("deck_collaborators", {
	id: uuid("id").primaryKey().defaultRandom(),
	deckId: uuid("deck_id").notNull().references(() => decks.id, { onDelete: "cascade" }),
	userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
	role: text("role").notNull().default("editor").$type(),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
}, (t) => [unique("deck_collaborators_deck_user_unique").on(t.deckId, t.userId)]);
var db = drizzle(postgres(process.env.DATABASE_URL), { schema: schema_exports });

export { decks as a, slideTypes as b, slides as c, db as d, deckCollaborators as e, agentMessages as f, shareLinks as g, assets as h, issues as i, apiKeys as j, sessions as s, themes as t, users as u };
//# sourceMappingURL=db-CWmjlPNh.js.map
