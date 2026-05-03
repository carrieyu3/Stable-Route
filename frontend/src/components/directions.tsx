import React, { useEffect, useState } from "react";
import { ArrowLeft , ArrowRight } from 'react-bootstrap-icons';

interface routeLeg {
        mode: string,
        distance: number,
        duration: number,
        fromPlaceName: string,
        fromPlaceInfo: {
          fromPlaceStopID: string,
          direction: string,
          publicCode: string,
          hexColor: string,
        },
        toPlace: string,
        draw: string
}

export interface routeInfo {   
  duration: number,
    distance: number,
    legs : routeLeg[]
}

const getTime = (seconds : number) => {
  const formatTime = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/New_York",
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
  });
  const currentTime = new Date()
  const addSeconds = new Date(currentTime.getTime() + (seconds * 1000))
  const nycTime = formatTime.format(addSeconds);
  return nycTime
}

const SecondsToMinutes = (duration : number) => {
  return Math.floor(duration / 60)
} 

const Direction = (dire : string) => {
  return (dire == 'outbound' ? 'Uptown' : 'Downtown')
} 
const StartDisplay = ({fromPlace}:{fromPlace : string}) => {
  return (
    <>
      <p><b>Starting location</b>: {fromPlace}</p>
      <br/>
    </>
  )
}

const EndDisplay = ({destination}:{destination : string}) => {
  return (
    <>
    <br/>
      <p><b>Ending location</b>: {destination}</p>
    </>
  )
}


const WalkRoute = ({leg, origin, destination, startSeconds, endSeconds} : {leg : routeLeg, origin : string, destination : string, startSeconds:number, endSeconds:number}) => {
  const startTime = getTime(startSeconds)
  const endTime = getTime(endSeconds)
  const fromPlace = (leg.fromPlaceName == "Origin") ? origin : leg.fromPlaceName
  const toPlace = (leg.toPlace == "Destination") ? destination : leg.toPlace
  return (
    <>
      <div style={{color: "#000", width: "90%" , borderLeft: "6px dotted #000" , padding: "9px"}}>
        <p style={{fontSize: "1.2em" , fontWeight: "bold"}}>Walk from {fromPlace} to {toPlace}</p>
        <p>{startTime} to {endTime}</p>
        <p>{SecondsToMinutes(leg.duration)} minutes</p>
      </div>
    </>
  )
}

const TrainRoute = ({leg, origin, destination, startSeconds, endSeconds} : {leg : routeLeg, origin : string, destination : string,startSeconds:number, endSeconds:number}) => {
  const [trainArrival, setTrainArrival] = useState('')
  const startTime = getTime(startSeconds)
  const endTime = getTime(endSeconds)
  const fromPlace = (leg.fromPlaceName == "Origin") ? origin : leg.fromPlaceName
  const toPlace = (leg.toPlace == "Destination") ? destination : leg.toPlace
  useEffect(() => {
    const getTrainTime = async() => {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/routes/train-arrival`, {
        method: 'POST',
        headers : {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          publicCode : leg.fromPlaceInfo.publicCode,
          stopId : leg.fromPlaceInfo.fromPlaceStopID
        })
      })
      const response_json = await response.json()
      let string = ''
      for (const min of response_json){
        string += min.toString() + ', '
      }
      setTrainArrival(string)
      console.log(response_json)
    }
    if (leg.fromPlaceInfo.publicCode && leg.fromPlaceInfo.fromPlaceStopID) {
      getTrainTime()
    }
    // Runs every minute , can remove this if you want
    const intervalId = setInterval(() => {
      if (leg.fromPlaceInfo.publicCode && leg.fromPlaceInfo.fromPlaceStopID) {
        getTrainTime();
      }
    }, 60000);
    return () => clearInterval(intervalId);
  }, [leg.fromPlaceInfo.publicCode, leg.fromPlaceInfo.fromPlaceStopID])
  


  return (
    <>
      <div style={{color: "#000", width: "90%" , borderLeft: "6px solid #000" , padding: "9px"}}>
        <p style={{fontSize: "1.2em" , fontWeight: "bold"}}>Take the {leg.fromPlaceInfo.publicCode} train from {fromPlace} to {toPlace}</p>
        <p>Train | {Direction(leg.fromPlaceInfo.direction)}</p>
        <p>{startTime} to {endTime}</p>
        <p>{SecondsToMinutes(leg.duration)} minutes</p>
        <p>Next train arrives in: {trainArrival} minutes</p>
      </div>
    </>
  )
}

const BusRoute = ({leg, origin, destination, startSeconds, endSeconds} : {leg : routeLeg, origin : string, destination : string, startSeconds:number, endSeconds:number}) => {
  const [BusArrival,setBusArrival] = useState('')
  const startTime = getTime(startSeconds)
  const endTime = getTime(endSeconds)
  const fromPlace = (leg.fromPlaceName == "Origin") ? origin : leg.fromPlaceName
  const toPlace = (leg.toPlace == "Destination") ? destination : leg.toPlace
  useEffect(() => {
    const getTrainTime = async() => {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/routes/bus-arrival`, {
        method: 'POST',
        headers : {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          publicCode : leg.fromPlaceInfo.publicCode,
          stopId : leg.fromPlaceInfo.fromPlaceStopID
        })
      })
      const response_json = await response.json()
      let string = ''
      for (const min of response_json){
        string += min.toString() + ', '
      }
      setBusArrival(string)
      console.log(response_json)
    }
    if (leg.fromPlaceInfo.publicCode && leg.fromPlaceInfo.fromPlaceStopID) {
      getTrainTime()
    }
    // Runs every minute , can remove this if you want
    const intervalId = setInterval(() => {
      if (leg.fromPlaceInfo.publicCode && leg.fromPlaceInfo.fromPlaceStopID) {
        getTrainTime();
      }
    }, 60000);
    return () => clearInterval(intervalId);
  }, [leg.fromPlaceInfo.publicCode, leg.fromPlaceInfo.fromPlaceStopID])
  return (
    <>
      <div style={{color: "#000", width: "90%" , borderLeft: "6px dashed #000" , padding: "9px"}}>
        <p style={{fontSize: "1.2em" , fontWeight: "bold"}}>Take the {leg.fromPlaceInfo.publicCode} bus from {fromPlace} to {toPlace}</p>
        <p>Bus | {Direction(leg.fromPlaceInfo.direction)}</p>
        <p>{startTime} to {endTime}</p>
        <p>{SecondsToMinutes(leg.duration)} minutes</p>
        <p>Next bus arrives in: {BusArrival} minutes</p>
      </div>
    </>
  )
}

export const DisplayRoute = (props: {routeData : routeInfo[], origin : string, destination : string}) => {
  const {routeData , origin, destination} = props

  return (
    <div>
      {/* Map each route */}
      {routeData?.map((route : routeInfo, index : number) => {
        let currentDuration = 0
        return (
          <div key={index}>
            <StartDisplay fromPlace={origin}></StartDisplay>
            {/* Map each leg of the route */}
            {route.legs.map((leg : routeLeg,idx : number) => {
              const startSeconds = currentDuration
              currentDuration += leg.duration
              const endSeconds = currentDuration
              return(
              <div key={idx}>
                {leg.mode == 'foot' ? <WalkRoute leg={leg} origin={origin} destination={destination} startSeconds={startSeconds} endSeconds={endSeconds}></WalkRoute> : null}
                {leg.mode == 'metro' ? <TrainRoute leg={leg} origin={origin} destination={destination} startSeconds={startSeconds} endSeconds={endSeconds}></TrainRoute> : null}
                {leg.mode == 'bus' ? <BusRoute leg={leg} origin={origin} destination={destination} startSeconds={startSeconds} endSeconds={endSeconds}></BusRoute> : null}
              </div>
              )
            })}
            <EndDisplay destination={destination}></EndDisplay>
          </div>
        )
      })}
      <br/>
    </div>
  )
}


type BoxVIsible = {
  isVisible: boolean;
};

export const Box: React.FC<BoxVIsible> = ({ isVisible }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!isVisible) return null;

  return (
    <div
      style={{ position: "absolute", top: "150px", transform: isCollapsed ? "translateX(-420px)" : "translateX(0)", transition: "transform 0.3s ease", width: "450px", height: "70%", backgroundColor: "white", border: "1px solid #ccc", marginTop: "0px", overflow: "hidden", zIndex: 1000 }}
    >
      {/* Content (hidden when collapsed) */}
      {!isCollapsed && (
        <div style={{ padding: "10px", flex: 1 }}>

          <div style={{overflowY: "scroll" , width: "95%"}}>

            {/* once i have the below working, we wont need the above */}
            {/* {DisplayRoute()} */}

          </div>
          
        </div>
      )}

      {/* Close / Open Button */}
      <button
        onClick={() => setIsCollapsed((prev) => !prev)}
        style={{
          position: "absolute",
          right: "5px",  top: "50%",
          transform: "translateY(-50%)",
          backgroundColor: "white",
          zIndex: 2,
          height: "100%",
        }}
      >
        {isCollapsed ? <ArrowRight/> : <ArrowLeft/>}
      </button>
    </div>
  );
};