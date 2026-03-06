import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const env_path = join(__dirname,'../../.env')

dotenv.config({path: env_path})
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY

if (!SUPABASE_URL){
    throw 'Supbase Url is undefined'
}
if (!SUPABASE_PUBLISHABLE_KEY){
    throw 'Supabase Pusblishable Key is undefined'
}

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)

export { supabase };

