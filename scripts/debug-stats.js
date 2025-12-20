
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

function loadEnv() {
    const possiblePaths = [
        path.join(__dirname, '..', '.env'),
        path.join(__dirname, '..', '.env.local'),
        'd:\\oo\\.env',
        'd:\\oo\\.env.local'
    ];

    for (const envPath of possiblePaths) {
        if (fs.existsSync(envPath)) {
            try {
                const envConfig = fs.readFileSync(envPath, 'utf8');
                envConfig.split('\n').forEach(line => {
                    const match = line.match(/^([^=]+)=(.*)$/);
                    if (match) {
                        const key = match[1].trim();
                        const value = match[2].trim().replace(/^["'](.+)["']$/, '$1');
                        if (!process.env[key]) process.env[key] = value;
                    }
                });
                return;
            } catch (e) {
                console.error("Error reading .env:", e);
            }
        }
    }
}
loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase env vars");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStats() {
    console.log("Checking Admin Stats...");

    // 1. Players
    const { count: playersCount, error: pErr } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    console.log(`Players: ${playersCount} (Error: ${pErr?.message})`);

    // 2. Tournaments
    const { count: tournamentsCount, error: tErr } = await supabase.from('tournaments').select('*', { count: 'exact', head: true });
    console.log(`Tournaments: ${tournamentsCount} (Error: ${tErr?.message})`);

    // 3. Pending Requests
    const { count: pendingCount, error: pendingErr } = await supabase.from('teams').select('*', { count: 'exact', head: true }).eq('status', 'pending');
    console.log(`Pending Requests: ${pendingCount} (Error: ${pendingErr?.message})`);

    // 4. Total Signups
    const { count: signupsCount, error: sErr } = await supabase.from('teams').select('*', { count: 'exact', head: true });
    console.log(`Total Signups: ${signupsCount} (Error: ${sErr?.message})`);

    // 5. Test Query check
    const { data: teamsData } = await supabase.from('teams').select('id, status, team_name').eq('status', 'pending');
    console.log("Pending Teams Data:", teamsData);
}

checkStats();
