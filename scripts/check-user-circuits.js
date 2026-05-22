
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

async function checkUserCircuits() {
    console.log('--- Checking user_cards for circuits ---');

    // Get all circuit IDs
    const { data: circuits } = await supabase.from('circuits').select('id');
    const circuitIds = circuits.map(c => c.id);

    // Check if any of these are in user_cards
    const { data: userCards, error } = await supabase
        .from('user_cards')
        .select('*')
        .in('card_id', circuitIds);

    if (error) {
        console.error('Error:', error.message);
    } else {
        console.log('User owns circuits:', userCards.length);
        if (userCards.length > 0) {
            console.log('Sample shared circuit ownership:', userCards[0]);
        }
    }
}

checkUserCircuits();
