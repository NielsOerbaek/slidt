import type { UserPreferences } from '$lib/server/db/schema.ts';

declare global {
  namespace App {
    interface Locals {
      user: { id: string; email: string; name: string; isAdmin: boolean; preferences: UserPreferences } | null;
    }
  }
}

export {};
