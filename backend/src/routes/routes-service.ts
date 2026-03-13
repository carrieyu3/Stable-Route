import {graphql_url, query} from './routes-variables.ts'


    


export async function getRoute(origin, destination, extra){
  const data = await fetch(graphql_url, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: query,
      variables: {
        from:{coordinates: { latitude: 40.59016932131942, longitude: -73.97384273780594}},
        to: {coordinates: {latitude: 40.76772735386152,longitude: -73.96445880303273}},
        dateTime: new Date(),
        modes: 
          { accessMode: "foot",
            transportModes: [{transportMode: "bus"},{transportMode: "metro"}],
            egressMode: "foot"
          },
        numTripPatterns: 1
      }
    })
  })
  console.log(data)
  const data_body = await data.json()
  console.log(data_body)
  const trip_legs = data_body["data"]["trip"]["tripPatterns"][0]["legs"]

  console.log(trip_legs)

}


