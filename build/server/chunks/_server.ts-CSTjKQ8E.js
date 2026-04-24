import { d as db, u as users } from './db-CWmjlPNh.js';
import { v as verifyPassword, c as createSession } from './auth-4Mm7I3lm.js';
import { json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import './chunk-Do6Vi0cX.js';
import 'drizzle-orm/postgres-js';
import 'postgres';
import 'drizzle-orm/pg-core';
import '@node-rs/argon2';

//#region src/routes/api/auth/login/+server.ts
async function POST(event) {
	const body = await event.request.json().catch(() => null);
	if (!body || typeof body.email !== "string" || typeof body.password !== "string") return new Response(JSON.stringify({ message: "email and password required" }), {
		status: 400,
		headers: { "Content-Type": "application/json" }
	});
	const [user] = await db.select().from(users).where(eq(users.email, body.email.toLowerCase().trim())).limit(1);
	if (!user || !await verifyPassword(user.passwordHash, body.password)) return new Response(JSON.stringify({ message: "Invalid credentials" }), {
		status: 401,
		headers: { "Content-Type": "application/json" }
	});
	const token = await createSession(user.id);
	await db.update(users).set({ lastSeenAt: /* @__PURE__ */ new Date() }).where(eq(users.id, user.id));
	event.cookies.set("session", token, {
		path: "/",
		httpOnly: true,
		sameSite: "lax",
		secure: process.env.NODE_ENV === "production",
		maxAge: 720 * 60 * 60
	});
	return json({ user: {
		id: user.id,
		email: user.email,
		name: user.name
	} });
}

export { POST };
//# sourceMappingURL=_server.ts-CSTjKQ8E.js.map
