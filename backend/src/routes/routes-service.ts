import {graphql_url, query} from './routes-variables.ts'
import GtfsRealtimeBindings from "gtfs-realtime-bindings";
import { type route , type bus} from '../interface.ts';
import dotenv from 'dotenv'
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const env_path = join(__dirname,'../../.env')
dotenv.config({path: env_path})

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
  console.log(response_body)
  if (!tripPatterns.length){
    throw new Error('No Patterns Constructed')
  }
  
  return tripPatterns
  
}


export async function busRtUpdate(bus_stop : bus){
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
            console.log(stop)
            const date = new Date(stop.arrival?.time["low"] * 1000)
            const nyc_time = date.toLocaleString("en-US", {timeZone: "America/New_York"})
            time.push(nyc_time)

          }
        });
      }
    });
    console.log(JSON.stringify(time))
    return time
    
  }
  catch (error) {
    console.log(error);
    process.exit(1);
  }
}