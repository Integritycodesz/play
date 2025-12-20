if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase env vars");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLogin() {
    console.log("Attempting login for abhishekyadavapus@gmail.com...");
    const { data, error } = await supabase.auth.signInWithPassword({
        email: 'abhishekyadavapus@gmail.com',
        password: 'admin123'
    });

    if (error) {
        console.error("Login Error:", error.message);
        return;
    }

    console.log("Login Successful. User ID:", data.user.id);

    console.log("Fetching Profile...");
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

    if (profileError) {
        console.error("Profile Fetch Error:", profileError.message);
        // Attempt to create profile if missing (Emergency Fix)
        if (profileError.code === 'PGRST116') { // JSON object requested, multiple (or no) rows returned
            console.log("Profile missing. Attempting to create admin profile...");
            const { error: insertError } = await supabase.from('profiles').insert({
                id: data.user.id,
                ign: 'Admin',
                email: 'abhishekyadavapus@gmail.com',
                role: 'admin'
            });
            if (insertError) console.error("Profile Creation Error:", insertError);
            else console.log("Admin Profile Created Successfully!");
        }
    } else {
        console.log("Profile Found:", profile);
        if (profile.role !== 'admin') {
            console.warn("WARNING: User is NOT admin. Current role:", profile.role);
            // Fix role
            console.log("Upgrading user to admin...");
            const { error: updateError } = await supabase.from('profiles').update({ role: 'admin' }).eq('id', data.user.id);
            if (updateError) console.error("Role Update Error:", updateError);
            else console.log("User upgraded to admin.");
        } else {
            console.log("User is correctly verified as ADMIN.");
        }
    }
}

testLogin();
