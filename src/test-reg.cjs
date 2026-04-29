const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Extract supabase URL and ANON KEY from .env
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');

let supabaseUrl = '';
let supabaseKey = '';

envContent.split('\n').forEach(line => {
  if (line.startsWith('VITE_SUPABASE_URL=')) supabaseUrl = line.split('=')[1].trim();
  if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) supabaseKey = line.split('=')[1].trim();
});

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRegistration() {
  console.log("Attempting to sign up...");
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: `test_${Date.now()}@example.com`,
    password: 'password123',
    options: {
      data: {
        full_name: 'Test User'
      }
    }
  });

  if (authError) {
    console.error("SignUp Error:", authError);
    return;
  }

  console.log("SignUp successful. Session:", authData.session ? "exists" : "null");
  
  if (authData.user) {
    console.log("Attempting to insert profile...");
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        full_name: 'Test User',
        age: 28,
        dob: '1995-01-01',
        email: authData.user.email,
        state: 'maharashtra',
        district: 'Pune',
        village: 'Pune',
        pincode: '411001',
        life_stage: 'puberty'
      });

    if (profileError) {
      console.error("Profile Insert Error:", profileError);
    } else {
      console.log("Profile inserted successfully!");
    }
  }
}

testRegistration();
