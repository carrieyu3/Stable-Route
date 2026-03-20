import {graphql_url, query} from './routes-variables.ts'
import GtfsRealtimeBindings from "gtfs-realtime-bindings";

export function getCoords(location: any){
  const lat = location["latitude"]
  const long = location["longitude"]
  return {lat,long}
}
function getQueryVariables(extra:any){
  const transportModes_Arr = extra["transportModes"]
  const numOfTrips = extra["numTripPatterns"]
  return {transportModes_Arr, numOfTrips}
}


export async function getRoute(origin:any, destination:any, extra:any){
  const {lat:origin_lat, long:origin_long} = getCoords(origin)
  const {lat: destination_lat, long: destination_long} = getCoords(destination)
  const {transportModes_Arr, numOfTrips} = getQueryVariables(extra)

  const response = await fetch(graphql_url, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: query,
      variables: {
        from:{coordinates: { latitude: origin_lat, longitude: origin_long}},
        to: {coordinates: {latitude: destination_lat,longitude: destination_long}},
        dateTime: new Date(),
        modes: 
          { accessMode: "foot",
            transportModes: transportModes_Arr,
            egressMode: "foot"
          },
        numTripPatterns: numOfTrips
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


export async function busRtUpdate(){
  try {
    const response = await fetch("https://gtfsrt.prod.obanyc.com/tripUpdates", {
      headers: {
        "x-api-key": "53bb7fc7-18c6-44ba-8b71-29bef591d4e6",
      },
    });
    if (!response.ok) {
      throw new Error(`${response.url}: ${response.status} ${response.statusText}`);
    }
    const buffer = await response.arrayBuffer();
    const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(
      new Uint8Array(buffer)
    );
    console.log(feed.entity[0]?.tripUpdate?.trip)
    const d = new Date(feed.entity[0]?.tripUpdate?.stopTimeUpdate[0]?.arrival?.time["low"] * 1000)
    const nd = d.toLocaleString("en-US", {
  timeZone: "America/New_York"
});
    console.log(feed.entity[0]?.tripUpdate?.stopTimeUpdate[0]?.stopId,nd)
    // feed.entity[0]
    // feed.entity.forEach((entity) => {
    //   if (entity.tripUpdate) {
    //     console.log(entity.tripUpdate);
    //   }
    // });
  }
  catch (error) {
    console.log(error);
    process.exit(1);
  }
}