import { resetPassword } from './cli-lib.ts';
import * as readline from 'readline';

const [email] = process.argv.slice(2);
if (!email) {
  console.error('Usage: pnpm tsx scripts/reset-password.ts <email>');
  process.exit(1);
}

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
rl.question('New password: ', async (password) => {
  rl.close();
  await resetPassword(email, password).catch((e) => {
    console.error('Error:', e.message);
    process.exit(1);
  });
});
