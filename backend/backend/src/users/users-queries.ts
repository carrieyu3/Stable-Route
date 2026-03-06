import { supabase } from '../config/supabase.ts'


export async function fetchUsers() {
   const { data, error } = await supabase.from('User').select('*')
    if (error){
        throw error
    }
    return data
}