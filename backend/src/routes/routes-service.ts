import {graphql_url, query} from './routes-variables.ts'
import GtfsRealtimeBindings from "gtfs-realtime-bindings";
import { type route , type transit, type busAlert, type busPlannedWork} from '../interface.ts';
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

//Ensure addresses are within NYC
export async function validateAddress(address: string){

  //geocoding to convert address into coordinates for OTP
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1&countrycodes=us&addressdetails=1`,
    { headers: { 'User-Agent': 'StableRoute/1.0' } }
  )

  const data = await res.json()

  if (!data.length){
    throw new Error("Address not found")
  }

  const addressDetails = data[0].address //best match

  const nycBoroughs = new Set([
    "Manhattan",
    "New York",
    "Brooklyn",
    "Queens",
    "Bronx",
    "The Bronx",
    "Staten Island",
  ])

  const nycCounties = new Set([
    "New York County",
    "Kings County",
    "Queens County",
    "Bronx County",
    "Richmond County",
  ]);

  const borough  = addressDetails.city
  const county = addressDetails.county

  //check if entered address is a borough or county
  const isNYC = nycBoroughs.has(borough) || nycCounties.has(county)

  if (!isNYC){
    throw new Error("Address is not within New York City")
  }

  //convert string to decimal
  const latitude  = parseFloat(data[0].lat)
  const longitude = parseFloat(data[0].lon)

  return { latitude, longitude }
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

//Trim route response
export function getTrimmedRoute(tripPatterns: any[]) {

  //stats for each leg inside of pattern
  return tripPatterns.map((pattern: any) => { //loop over all patterns
    const legs = pattern.legs.map((leg: any) => { //loop over all legs inside one pattern
      return {
        mode: leg.mode,
        distance: leg.distance,
        duration: leg.duration,
        fromPlaceName: leg.fromPlace.name,
        fromPlaceInfo: (leg.fromPlace.quay) ? {
          fromPlaceStopID: (leg.fromPlace.quay) ? leg.fromPlace.quay.id : null,
          direction: (leg.serviceJourney) ? leg.serviceJourney.directionType : null ,
          publicCode: (leg.line) ? leg.line.publicCode : null,
          hexColor: (leg.line) ? leg.line.presentation.colour : null,
        } : null,
        toPlace: leg.toPlace.name,
        draw: leg.pointsOnLink.points
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

export async function busArrival(bus_stop : transit){
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

  const arrival_in_minutes: number[] = []

  feed.entity.forEach((entity) => {
    if (entity.tripUpdate?.trip.routeId == bus_stop.publicCode 
      && entity.tripUpdate.trip.directionId == bus_stop.directionId && entity.tripUpdate.stopTimeUpdate) {
        
        entity.tripUpdate.stopTimeUpdate.forEach(stop => {
        if (stop.stopId == bus_stop.stopId && stop.arrival?.time){
          const arrival_time = Number(stop.arrival.time.valueOf()) * 1000
          const current_time = new Date()
          const minutes = Math.floor(Math.abs(arrival_time-current_time.getTime())/(1000 * 60))
          arrival_in_minutes.push(minutes)

        }
      });
    }
  });
  const time_json = JSON.stringify(arrival_in_minutes)
  return time_json
}

export async function busAlert(bus_stop : transit){
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
    const informedEntity = entity.alert?.informedEntity 
    if (informedEntity){
      informedEntity.forEach(trip => {

        if (!trip.trip && trip.routeId == bus_stop.publicCode){
          const description = entity.alert?.descriptionText?.translation?.at(0)?.text ?? ''
          bus_stop_alert.alert_description = description

        }else if (trip.trip && trip.trip.routeId == bus_stop.publicCode && trip.trip.directionId == bus_stop.directionId){
          const date_number = entity.alert?.activePeriod?.at(0)?.end?.valueOf()
          const date = new Date(Number(date_number) * 1000)
          const nyc_time = date.toLocaleString("en-US", {timeZone: "America/New_York"})
          bus_stop_planned_work.pw_end_date = nyc_time
          if (entity.alert?.headerText?.translation){
            bus_stop_planned_work.pw_header = entity.alert?.headerText?.translation.at(0)?.text ?? ''
          }
          if (entity.alert?.descriptionText?.translation){
            bus_stop_planned_work.pw_description = entity.alert.descriptionText.translation.at(0)?.text ?? ''
          }
        }
      });
    }
      
  });
  const merged = {...bus_stop_alert, ...bus_stop_planned_work}
  const merged_json = JSON.stringify(merged)
  return merged_json
}

const orange_trains = new Set(["B","D","F","M","FS"])
const blue_trains = new Set(["A","C","E","H"])
const brown_trains = new Set(["J","Z"])
const yellow_trains = new Set(["N","Q","R","W"])
const number_trains = new Set(["1","2","3","4","5","6","6X","7","7X","S","GS"])

const train_urls = {
  orange: "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-bdfm",
  blue: "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-ace",
  G: "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-g",
  brown: "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-jz",
  yellow: "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-nqrw",
  L: "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-l",
  number: "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs",
  SI: "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-si"
}

function getTrainUrl(public_code : string){
  if (orange_trains.has(public_code)){ return train_urls.orange }
  if (blue_trains.has(public_code)) {return train_urls.blue }
  if (public_code == "G"){ return train_urls.G }
  if (brown_trains.has(public_code)){ return train_urls.brown }
  if (yellow_trains.has(public_code)){ return train_urls.yellow} 
  if (public_code == "L"){ return train_urls.L }
  if (number_trains.has(public_code)){ return train_urls.number } 
  if (public_code == "SI"){ return train_urls.SI } // SIR trains
  throw new Error("Invalid Public code")
}

export async function trainArrival(train_stop : transit){
  const mta_url = getTrainUrl(train_stop.publicCode)
  const response = await fetch(mta_url)
  if (!response.ok){
    throw new Error(`${response.url}: ${response.status} ${response.statusText}`);
  }
  const buffer = await response.arrayBuffer();
  const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(
    new Uint8Array(buffer)
  );

  const arrival_in_minutes: number[] = []

  feed.entity.forEach((entity) => {
    if (entity.tripUpdate?.trip.routeId == train_stop.publicCode){
      entity.tripUpdate.stopTimeUpdate?.forEach((stop) => {
        if (stop.stopId == train_stop.stopId){
          const arrival_time = Number(stop.arrival?.time?.valueOf())*1000
          const current_time = new Date()
          const minutes = Math.floor(Math.abs(arrival_time-current_time.getTime())/(1000 * 60))
          arrival_in_minutes.push(minutes)
        }
      })
    }
  })
  
  const time_json = JSON.stringify(arrival_in_minutes)
  return time_json
}

export async function trainAlert(public_code : String){
  const response = await fetch("https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/camsys%2Fsubway-alerts")
  if (!response.ok){
    throw new Error(`${response.url}: ${response.status} ${response.statusText}`);
  }
  const buffer = await response.arrayBuffer();
  const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(
    new Uint8Array(buffer)
  );

  interface alert_interface {
    header: String
    description: String
  }
  const alert : alert_interface[] = []
  feed.entity.forEach((entity) => {
    entity.alert?.informedEntity?.forEach((route) => {
      if (route.routeId && route.routeId == public_code){
        const start_num = Number(entity.alert?.activePeriod?.at(0)?.start?.valueOf()) * 1000
        const end_num = Number(entity.alert?.activePeriod?.at(0)?.end?.valueOf()) * 1000
        
        const current_time = new Date() 
        if ((start_num < current_time.valueOf() && end_num > current_time.valueOf()) || (start_num < current_time.valueOf() && end_num == 0)){
          const this_train_alert : alert_interface = {
            header: entity.alert?.headerText?.translation?.at(0)?.text ?? "",
            description: entity.alert?.descriptionText?.translation?.at(0)?.text ?? ""
          }
          alert.push(this_train_alert)
        }

      }
    })
  })
  const alert_json = JSON.stringify(alert)
  return alert_json
}

export async function getElevatorOutage(map_of_elevators : Map<string,string>){
  // const mta_url = getTrainUrl(train_stop.publicCode)
  const response = await fetch("https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fnyct_ene.json")
  if (!response.ok){
    throw new Error(`${response.url}: ${response.status} ${response.statusText}`);
  }
  const json_res = await response.json()
  type info = {which : string, alt_route: string}
  const arr_of_oos_elevator : info[] = []
  for (const entity of json_res){
    if (map_of_elevators.has(entity['equipment'])){
      const elevator : info = {which : entity['serving'], alt_route: map_of_elevators.get(entity['equipment']) ?? ''}
      arr_of_oos_elevator.push(elevator)
    }
  }
  const oos_elevator_json = JSON.stringify(arr_of_oos_elevator)

  return oos_elevator_json
  
  
}

export async function getElevatorID(gtfs_stop_id : string){
  const response = await fetch("https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fnyct_ene_equipments.json")
  if (!response.ok){
    throw new Error(`${response.url}: ${response.status} ${response.statusText}`);
  }
  const json_res = await response.json()
  const map_of_elevator_id = new Map<string,string>()
  for (const entity of json_res) {
    const stop_id_arr = entity['elevatorsgtfsstopid'].split('/')
    if (stop_id_arr.includes(gtfs_stop_id)){
      map_of_elevator_id.set(entity['equipmentno'],entity['alternativeroute'])
    }
  }
  return map_of_elevator_id
}