
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDuplicates() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        // If no user, try to get a sample of user_cards
        console.log('No active session, fetching all user_cards sample...');
    }

    const { data, error } = await supabase
        .from('user_cards')
        .select('user_id, card_id, count');

    if (error) {
        console.error('Error fetching user_cards:', error.message);
        return;
    }

    const map = new Map();
    const duplicates = [];

    data.forEach(item => {
        const key = `${item.user_id}-${item.card_id}`;
        if (map.has(key)) {
            duplicates.push({ key, count: item.count });
        }
        map.set(key, (map.get(key) || 0) + 1);
    });

    console.log(`Total rows: ${data.length}`);
    console.log(`Unique user/card pairs: ${map.size}`);
    console.log(`Duplicate rows found: ${duplicates.length}`);

    if (duplicates.length > 0) {
        console.log('Sample duplicates:', duplicates.slice(0, 5));
    }

    const sample = data.slice(0, 5);
    console.log('Sample rows:', sample);
}

checkDuplicates();
