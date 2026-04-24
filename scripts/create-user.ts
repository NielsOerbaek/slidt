import { createUser } from './cli-lib.ts';

const args = process.argv.slice(2);
const isAdmin = args.includes('--admin');
const positional = args.filter(a => !a.startsWith('--'));
const [email, name, password] = positional;

if (!email || !name || !password) {
  console.error('Usage: pnpm tsx scripts/create-user.ts <email> <name> <password> [--admin]');
  process.exit(1);
}
await createUser(email, name, password, isAdmin).catch((e) => {
  console.error('Error:', e.message);
  process.exit(1);
});
