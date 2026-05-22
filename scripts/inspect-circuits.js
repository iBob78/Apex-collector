
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCircuitsTable() {
    console.log('--- Checking for circuits table ---');
    const { data, error } = await supabase
        .from('circuits')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Circuits table Error:', error.message);
    } else {
        console.log('Found circuits table! Sample:', data[0]);
    }
}

checkCircuitsTable();
