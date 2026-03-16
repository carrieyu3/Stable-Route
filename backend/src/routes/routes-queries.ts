import { supabase } from '../config/supabase.ts'
import { getCoords } from './routes-service.ts'


export async function uploadRoute(user_id:string, origin:JSON,destination:JSON, duration:number){
    const {lat:origin_lat, long:origin_long} = getCoords(origin)
    const {lat: destination_lat, long: destination_long} = getCoords(destination)
    
    const{ error } = await supabase.from("Route").insert({
        user_id:user_id,
        route_requested_at: new Date(),
        route_duration:duration,
        route_origin_point: `POINT(${origin_long} ${origin_lat})`,
        route_destination_point:`POINT(${destination_long} ${destination_lat})`
    })
    if (error){
        throw new Error(error["message"])
    }
}