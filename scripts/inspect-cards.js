
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

async function inspectColumns() {
    console.log('--- Inspecting ALL columns in cards table ---');
    const { data: sample, error } = await supabase
        .from('cards')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error fetching sample:', error.message);
        return;
    }

    if (sample && sample.length > 0) {
        console.log('All columns:', Object.keys(sample[0]));
        console.log('Sample row data:', sample[0]);
    } else {
        console.log('Cards table is empty.');
    }
}

inspectColumns();
