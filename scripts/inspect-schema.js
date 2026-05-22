
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually parse .env.local because dotenv might be missing
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

async function inspectSchema() {
    console.log('Checking user_cards table...');
    const { data, error } = await supabase
        .from('user_cards')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error:', error.message);
        if (error.message.includes('not found')) {
            console.log('Trying users_cards...');
            const { data: data2, error: error2 } = await supabase.from('users_cards').select('*').limit(1);
            if (error2) console.error('Error users_cards:', error2.message);
            else console.log('Found users_cards! Columns:', Object.keys(data2[0]));
        }
    } else if (data && data.length > 0) {
        console.log('Found user_cards! Columns:', Object.keys(data[0]));
        console.log('Sample row:', data[0]);
    } else {
        console.log('user_cards is empty.');
    }
}

inspectSchema();
