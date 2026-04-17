import { stringify } from 'querystring'
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

export async function getUserPreferences(user_id:string){
    const {data, error} = await supabase.from("UserPreference").select('preference_id').eq('user_id', user_id)
    if (error){
        throw new Error(error['message'])
    }else if (!data){
        throw new Error("No data")
    }else{
        console.log(data)
    }
    const pref_for_route = new Set(['fewTransfers', 'elevator','escalator','bus','train'])
    const pref_arr = []
    for (const pref of data){
        console.log(pref.preference_id)
        const {data,error} = await supabase.from('Preference').select('preference_name').eq('preference_id',pref.preference_id)
        if (data && data[0] && pref_for_route.has(data[0].preference_name)){
            pref_arr.push(data[0].preference_name)
        }
        
    }
    return pref_arr
    
}