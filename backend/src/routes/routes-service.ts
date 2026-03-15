import {graphql_url, query} from './routes-variables.ts'

function getCoords(location: any){
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
  
  const trip_legs = response_body["data"]["trip"]["tripPatterns"]
  return trip_legs
  
}


