const { createClient } = require('@supabase/supabase-js');
const env = require('dotenv').config().parsed;

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data: subs } = await supabase.from('billing_subscriptions').select('*');
  console.log('Subscriptions:', subs);
  
  const { data: events } = await supabase.from('billing_webhook_events').select('*').order('created_at', { ascending: false }).limit(5);
  console.log('Recent Webhooks:', events);
}
check();
