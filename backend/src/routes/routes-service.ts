import {graphql_url, query} from './routes-variables.ts'
import GtfsRealtimeBindings from "gtfs-realtime-bindings";
import { type route , type bus, type busAlert, type busPlannedWork} from '../interface.ts';
import dotenv from 'dotenv'
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const env_path = join(__dirname,'../../.env')
dotenv.config({path: env_path})


export function getDirectionId(direction : String){
  if (direction == "outbound"){
        return 0
  }
  return 1
}

export async function getRoute(route_req : route){
  const response = await fetch(graphql_url, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: query,
      variables: {
        from:{coordinates: { latitude: route_req.origin.latitude, longitude: route_req.origin.longitude}},
        to: {coordinates: {latitude: route_req.destination.latitude,longitude: route_req.destination.longitude}},
        dateTime: new Date(),
        modes: 
          { accessMode: "foot",
            transportModes: route_req.transportModes,
            egressMode: "foot"
          },
        numTripPatterns: route_req.numTripPatterns
      }
    })
  })
  const response_body = await response.json()
  const tripPatterns = response_body["data"]["trip"]["tripPatterns"]
  if (!tripPatterns.length){
    throw new Error('No Patterns Constructed')
  }
  
  return tripPatterns
  
}

//Trim OTP response
export function getTrimmedRoute(tripPatterns: any[]) {

  //stats for each leg inside of pattern
  return tripPatterns.map((pattern: any) => { //loop over all patterns
    const legs = pattern.legs.map((leg: any) => { //loop over all legs inside one pattern
      return {
        mode: leg.mode,
        distance: leg.distance,
        duration: leg.duration,
        fromPlace: leg.fromPlace?.name ?? null,
        toPlace: leg.toPlace?.name ?? null
      }
    })

    //total stats for the entire pattern
    return {
      duration: pattern.duration,
      distance: pattern.distance,
      legs
    }
  })
}

export async function busArrival(bus_stop : bus){
  try {
    const response = await fetch("https://gtfsrt.prod.obanyc.com/tripUpdates", {
      headers: {
        "x-api-key": `${process.env.MTA_BUS_KEY}`,
      },
    });
    if (!response.ok) {
      throw new Error(`${response.url}: ${response.status} ${response.statusText}`);
    }
    const buffer = await response.arrayBuffer();
    const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(
      new Uint8Array(buffer)
    );

    const time: string[] = []

    feed.entity.forEach((entity) => {
      if (entity.tripUpdate?.trip.routeId == bus_stop.publicCode 
        && entity.tripUpdate.trip.directionId == bus_stop.directionId && entity.tripUpdate.stopTimeUpdate) {
        
          entity.tripUpdate.stopTimeUpdate.forEach(stop => {
          if (stop.stopId == bus_stop.stopId && stop.arrival?.time){
            const arrival_time = stop.arrival.time.valueOf()
            const date = new Date(Number(arrival_time) * 1000)
            const nyc_time = date.toLocaleString("en-US", {timeZone: "America/New_York"})
            time.push(nyc_time)

          }
        });
      }
    });
    const time_json = JSON.stringify(time)
    return time_json
    
  }
  catch (error) {
    console.log(error);
    process.exit(1);
  }
}


export async function busAlert(bus_stop : bus){
  try {
    const response = await fetch("https://gtfsrt.prod.obanyc.com/alerts", {
      headers: {
        "x-api-key": `${process.env.MTA_BUS_KEY}`,
      },
    });
    if (!response.ok) {
      throw new Error(`${response.url}: ${response.status} ${response.statusText}`);
    }
    const buffer = await response.arrayBuffer();
    const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(
      new Uint8Array(buffer)
    );

    const bus_stop_planned_work : busPlannedWork = {} as busPlannedWork
    const bus_stop_alert : busAlert = {} as busAlert

    feed.entity.forEach((entity) => {
      if (entity.alert?.informedEntity){
        entity.alert?.informedEntity.forEach(trip => {

          if (!trip.trip && trip.routeId == bus_stop.publicCode){
            bus_stop_alert.alert_description = entity.alert?.descriptionText?.translation?.at(0)?.text ?? ''

          }else if (trip.trip && trip.trip.routeId == bus_stop.publicCode && trip.trip.directionId == bus_stop.directionId){
            const date_number = entity.alert?.activePeriod?.at(0)?.end?.valueOf()
            const date = new Date(Number(date_number) * 1000)
            const nyc_time = date.toLocaleString("en-US", {timeZone: "America/New_York"})
            bus_stop_planned_work.PW_end_date = nyc_time
            if (entity.alert?.headerText?.translation){
              bus_stop_planned_work.PW_header = entity.alert?.headerText?.translation.at(0)?.text ?? ''
            }
            if (entity.alert?.descriptionText?.translation){
              bus_stop_planned_work.PW_description = entity.alert.descriptionText.translation.at(0)?.text ?? ''
            }
          }
        });
      }
      
    });
    const merged = {...bus_stop_alert, ...bus_stop_planned_work}
    const merged_json = JSON.stringify(merged)
    return merged_json
    
  }
  catch (error) {
    console.log(error);
    process.exit(1);
  }
}