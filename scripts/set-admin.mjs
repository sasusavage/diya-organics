
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local from project root
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Error: Missing Supabase URL or Service Key in .env.local');
    console.error('Make sure SUPABASE_SERVICE_ROLE_KEY is set!');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const email = 'admin@STOREpharmacy.com';
const password = 'Password123!'; // Temporary password

async function main() {
    console.log(`\n🚀 Setting up Admin User: ${email}`);

    let userId;

    // 1. Try to fetch user first
    console.log('Checking if user exists...');
    const { data: listData, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
        console.error('❌ Error listing users:', listError.message);
        return;
    }

    const existingUser = listData.users.find(u => u.email === email);

    if (existingUser) {
        console.log(`✅ User already exists. ID: ${existingUser.id}`);
        userId = existingUser.id;

        // Optionally update password if needed, but for now we skip to avoid resetting if they use it.
        // console.log('Updating password...');
        // await supabase.auth.admin.updateUserById(userId, { password });
    } else {
        console.log('User not found. Creating new user...');
        const { data: createData, error: createError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true
        });

        if (createError) {
            console.error('❌ Error creating user:', createError.message);
            return;
        }
        userId = createData.user.id;
        console.log(`✅ User created successfully. ID: ${userId}`);
    }

    // 2. Update Profile Role
    console.log(`Updating role for user ${userId}...`);

    // Upsert profile to ensure it exists and has admin role
    const { error: upsertError } = await supabase
        .from('profiles')
        .upsert({
            id: userId,
            email: email,
            role: 'admin',
            full_name: 'STORE Admin',
            updated_at: new Date().toISOString()
        })
        .select();

    if (upsertError) {
        console.error('❌ Error updating profile role:', upsertError.message);
    } else {
        console.log('✅ SUCCESS! User is now an Admin.');
        console.log('\n---------------------------------------------------');
        console.log(`Login Email:    ${email}`);
        console.log(`Login Password: ${password}`);
        console.log('---------------------------------------------------\n');
    }
}

main();
