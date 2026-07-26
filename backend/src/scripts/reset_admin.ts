import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function resetPassword() {
  const { data: users, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error('Error listing users:', listError);
    return;
  }

  const adminUser = users.users.find(u => u.email === 'admin@speclane.com');
  if (!adminUser) {
    console.log('Admin user not found. You can just sign in with admin@speclane.com and any new password to create it.');
    return;
  }

  const { data, error } = await supabase.auth.admin.updateUserById(
    adminUser.id,
    { password: 'AdminPassword123!' }
  );

  if (error) {
    console.error('Error updating password:', error);
  } else {
    console.log('Successfully reset admin password to: AdminPassword123!');
  }
}

resetPassword();
