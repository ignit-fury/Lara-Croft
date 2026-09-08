import 'dotenv/config';
import bcrypt from 'bcrypt';
import { supabase, findOne, updateOne } from './db/supabase-db';

async function setAdminPassword() {
  const email = process.argv[2];
  const password = process.argv[3];

  if (!email || !password) {
    console.log('Usage: tsx src/set-admin-password.ts <email> <password>');
    process.exit(1);
  }

  const user = await findOne('users', { email });
  if (!user) {
    console.error(`User not found: ${email}`);
    process.exit(1);
  }

  if (user.role !== 'admin' && user.role !== 'manager') {
    console.error(`User ${email} is not admin/manager (role: ${user.role})`);
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, 10);
  await updateOne('users', user.id, { password_hash: hash });
  console.log(`Password set for ${email}`);
  process.exit(0);
}

setAdminPassword().catch((err) => {
  console.error(err);
  process.exit(1);
});
