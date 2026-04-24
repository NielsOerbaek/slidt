import { db, users } from '../src/lib/server/db/index.ts';
import { hashPassword } from '../src/lib/server/auth.ts';
import { eq } from 'drizzle-orm';

export async function createUser(
  email: string,
  name: string,
  password: string,
  isAdmin = false,
): Promise<void> {
  if (!email || !name || !password) throw new Error('email, name, and password are required');
  const passwordHash = await hashPassword(password);
  await db.insert(users).values({ email: email.toLowerCase().trim(), passwordHash, name, isAdmin });
  console.log(`Created user: ${email}${isAdmin ? ' (admin)' : ''}`);
}

export async function resetPassword(email: string, newPassword: string): Promise<void> {
  if (!email || !newPassword) throw new Error('email and newPassword are required');
  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email.toLowerCase().trim()))
    .limit(1);
  if (!user) throw new Error(`User not found: ${email}`);
  const passwordHash = await hashPassword(newPassword);
  await db.update(users).set({ passwordHash }).where(eq(users.id, user.id));
  console.log(`Password reset for: ${email}`);
}
