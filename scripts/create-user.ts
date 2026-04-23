import { createUser } from './cli-lib.ts';

const [email, name, password] = process.argv.slice(2);
if (!email || !name || !password) {
  console.error('Usage: pnpm tsx scripts/create-user.ts <email> <name> <password>');
  process.exit(1);
}
await createUser(email, name, password).catch((e) => {
  console.error('Error:', e.message);
  process.exit(1);
});
