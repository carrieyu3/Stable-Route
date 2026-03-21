import { supabase } from '../config/supabase.ts'
import { type route } from '../interface.ts'

export async function uploadRoute(user_id:string, route_req: route, duration : Number){
    
    const{ error } = await supabase.from("Route").insert({
        user_id:user_id,
        route_requested_at: new Date(),
        route_duration:duration,
        route_origin_point: `POINT(${route_req.origin.longitude} ${route_req.origin.latitude})`,
        route_destination_point:`POINT(${route_req.destination.longitude} ${route_req.destination.latitude})`
    })
    if (error){
        throw new Error(error["message"])
    }
}