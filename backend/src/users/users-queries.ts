import { supabase } from '../config/supabase.ts'

export async function validUserID(user_id:string){
    const {data, error} = await supabase.from("User").select().eq('user_id', user_id).maybeSingle()
    if (error){
        throw new Error(error["message"])
    }else if(!data){
        throw new Error("USER DOES NOT EXIST")
    }
    return
}