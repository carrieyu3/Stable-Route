import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { Link } from "react-router-dom";
import polyline from '@mapbox/polyline';
import './Home.css'

//library import needed for map
import {Map, Source, Layer} from 'react-map-gl/maplibre';

//icons 
//import { GearFill , GeoAltFill } from 'react-bootstrap-icons';
import { useEffect, useRef , useState } from "react";

//supabase
import { supabase } from "../lib/supabase";

import {Box, DisplayRoute, type routeInfo} from "../components/directions.tsx"
import type {FeatureCollection, LineString } from 'geojson'

// input for starting destination 
type destinationInput = {
  origin: string;
  destination: string;
}

function ValidBadge() {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: '#e8f5e9', color: '#2e7d32', fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 10, marginLeft: 8 }}>
      NYC
    </span>
  )
}

export default function MainPG(){

  const [showBox] = useState(false);
  const [addressError, setAddressError] = useState("");
  const [,setUsername] = useState("");
  const [userId, setUserId] = useState("");
  const [preferences, setPreferences] = 
    useState({ 
      highContrast: false,
      fewTransfers: false,
      escalator: false, 
      elevator: false, 
      bus: false, 
      train: false 
    });

  const [searchedOrigin, setSearchedOrigin] = useState("");
  const [searchedDestination, setSearchedDestination] = useState("");
  const [routeData, setRoute] = useState<routeInfo[]>([]);
  const showPanel = routeData.length > 0;
  const [drawnRoute, setDrawnRoute] = useState<routeInfo[]>([]);
  const [originError, setOriginError] = useState(false)
  const [destinationError, setDestinationError] = useState(false)
    
  //create form and track input data upon submission
  const {
    register,
    handleSubmit,
    clearErrors,
    reset, //clear prev input fields
  } = useForm<destinationInput>({mode: "onSubmit",});

  //submission for address 
  const onSubmit: SubmitHandler<destinationInput> = async (data) => {

      setRoute([]); //clear prev route

      if (data.origin == data.destination || data.origin == "" || data.destination == "") {
        setAddressError("Invalid address")
        return
      }

      //store searched values to display in sidebar
      setSearchedOrigin(data.origin)
      setSearchedDestination(data.destination)

      try {
          //send route request to backend
          const rawResponse = await fetch('http://localhost:3000/routes/create', {
              method: 'POST',
              headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                  user_id: userId,
                  origin: data.origin,
                  destination: data.destination,
                  transportModes: [{ transportMode: "bus" }], //placeholder
                  numTripPatterns: 1 //display # trip patterns
              })
          })

          const result = await rawResponse.json()
          if (result.error){
              setAddressError(result.error)
              setOriginError(result.error.includes("Origin"))
              setDestinationError(result.error.includes("Destination"))
          } 
          else {
              //console.log(result[0].legs[0].draw) //***going to add markers for origin and dest
              setRoute(result)
              setDrawnRoute(result)
          }
      } 
      catch (e: unknown) {
        if (e instanceof Error){
          setAddressError(e.message)
        }
      }
  }

  //get user pref
  //Retrieve username and previously saved preferences of logged User
  useEffect(() => {
    const getUserData = async () => {

      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        setUserId(user.id)

        //Get username
        const { data } = await supabase
          .from('User')
          .select('user_username')
          .eq('user_id', user.id)
          .single();

        if (data) {
          setUsername(data.user_username);
        }

        //Get previous preferences
        const { data: savedPreferences } = await supabase
          .from('UserPreference')
          .select('Preference(preference_name)') //join to UserPref
          .eq('user_id', user.id);

        if (savedPreferences) {
          const previousPreferences = { ...preferences };

          for (let i = 0; i < savedPreferences.length; i++) {
            const preferenceName = (savedPreferences[i].Preference as any).preference_name;
            previousPreferences[preferenceName as keyof typeof previousPreferences] = true; //restore prev
          }

          setPreferences(previousPreferences);

        }
      }
    }
    getUserData();
  }, []); //run only on first render to prevent repetitive username retrieval

  //get user curr location
  const geoControlRef = useRef<maplibregl.GeolocateControl>(null);
  const geojsonData: FeatureCollection<LineString> = {
    type: 'FeatureCollection',
    features: drawnRoute.flatMap(route =>
      route.legs.map(leg => ({
        type: 'Feature' as const,
        properties: {
          mode: leg.mode
        },
        geometry: {
          type: 'LineString' as const,
          coordinates: polyline.decode(leg.draw).map(([lat, lng]: [number, number]) => [lng, lat])
        }
      }))
    )
  };

  //locate origin and dest marker points
  const endpointData: FeatureCollection = {
    type: "FeatureCollection",
    features: geojsonData.features.length
      ? [
          {
            type: "Feature",
            properties: { type: "origin" },
            geometry: {
              type: "Point",
              coordinates:
                geojsonData.features[0].geometry.coordinates[0] //first coord
            }
          },
          {
            type: "Feature",
            properties: { type: "destination" },
            geometry: {
              type: "Point",
              coordinates:
                geojsonData.features[geojsonData.features.length - 1].geometry.coordinates.slice(-1)[0] //last coord
            }
          }
        ]
      : []
  };


const lineLayer = {
  id: 'line-layer',
  type: 'line',
  paint: {
    'line-color': [
      'match',
      ['get', 'mode'],
      'foot', '#1c7ed6',
      'bus', '#1c7ed6',
      'metro', '#1c7ed6',
      /* default */ '#1c7ed6'
    ],
    'line-width': 7,

    // dotted / dashed styles
    'line-dasharray': [
      'match',
      ['get', 'mode'],
      'foot', ['literal', [0.5, 1]],   // dotted
      'bus', ['literal', [2, 1.5]],        // dashed
      'metro', ['literal', [1, 0]],       // solid
      ['literal', [1, 0]]
    ]
  }
} as const;

  useEffect(()=>{
    geoControlRef.current?.trigger()
  },[geoControlRef.current])

    return(
      <>

        <div className="flex min-h-full flex-col justify-center absolute overflow-hidden w-screen h-screen">

        { /* map displays depending if user wants high contrast or not */}
        {preferences.highContrast ? 
        
          //true for high contrast
          <Map
              initialViewState={{
                longitude: -74.0060,
                latitude: 40.7128,
                zoom: 12
              }}
              style={{width: '100vw', height: '100vh'}}
              mapStyle="/high-contrast-map.json"
          >

          <Source id="my-data" type="geojson" data={geojsonData}>
            <Layer {...lineLayer} />
          </Source>

          {/* display colors of endpoints */}
          <Source id="endpoints" type="geojson" data={endpointData}>
            <Layer
              id="endpoint-layer"
              type="circle"
              paint={{
                "circle-radius": 8,
                "circle-color": [
                  "match",
                  ["get", "type"],
                  "origin",
                  "#228B22", //green starting point
                  "destination",
                  "#d50000", //red starting point
                  "#000"
                ],
                "circle-stroke-width": 2.5, //border weight
                "circle-stroke-color": "#000"
              }}
            />
          </Source>

            </Map>
        : 
          //false for high contrast
          <Map
              initialViewState={{
              longitude: -74.0060,
              latitude: 40.7128,
              zoom: 12,
              }}
              style={{width: '100vw', height: '100vh'}}
              mapStyle="/default-map.json"
          >

          <Source id="my-data" type="geojson" data={geojsonData}>
            <Layer {...lineLayer} />
          </Source>

          <Source id="endpoints" type="geojson" data={endpointData}>
            <Layer
              id="endpoint-layer"
              type="circle"
              paint={{
                "circle-radius": 8,
                "circle-color": [
                  "match",
                  ["get", "type"],
                  "origin",
                  "#228B22",
                  "destination",
                  "#d50000",
                  "#000"
                ],
                "circle-stroke-width": 2.5,
                "circle-stroke-color": "#000"
              }}
            />
          </Source>

          </Map>
        } 
        
        {/* add the lines layer to draw route  */}

        {/* {origin && destination != '' ? Directions : null} */}

        {/* below gives us the user location , we want to feed it into start point */}
        {/* <GeolocateControl showUserLocation={true} trackUserLocation={true}/> */}

            
        { /* input for destinaton */}
          <form onSubmit={handleSubmit(onSubmit)}>
            
            <div className="w-full max-w-sm absolute left-6 top-4 flex flex-col">  

              {/* starting point input */}
              <input
                id="origin"
                placeholder="start point"
                className="block w-full rounded-md border-2 border-gray-400 bg-white px-3 py-1.5 text-base text-black placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-500 sm:text-sm/6"
                {...register("origin", { required: true })}
                onChange={() => { setAddressError(""); setOriginError(false); clearErrors("origin"); }}
              />
              {originError && <span style={{ display: 'inline-flex', alignItems: 'center', background: '#fdecea', color: '#c62828', fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: '0 0 6px 6px', marginBottom: 4}}>Origin is invalid or not in NYC !</span>}

              {/* ending point input */}
              <input
                id="destination"
                placeholder="&#xF3E7; end point"
                className="block w-full rounded-md border-2 border-gray-400 bg-white px-3 py-1.5 text-base text-black placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-500 sm:text-sm/6"
                {...register("destination", { required: true })}
                onChange={() => { setAddressError(""); setDestinationError(false); clearErrors("destination"); }}
              />
              {destinationError && <span style={{ display: 'inline-flex', alignItems: 'center', background: '#fdecea', color: '#c62828', fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: '0 0 6px 6px', marginBottom: 4}}>Destination is invalid or not in NYC !</span>}

            <button type="submit" className="mt-2 w-full bg-blue-500 text-white py-1.5 rounded-md text-sm font-medium hover:bg-blue-600 transition-colors">Search</button>
            {addressError && !originError && !destinationError && <p className="text-red-500 text-sm">{addressError}</p>}

            </div>

            <Box isVisible={showBox} />

            <div className="max-w-sm absolute right-6 top-4">
              <Link to="/preference" className="w-100 h-100 p-2 bg-slate-800 text-white text-sm font-medium rounded-md hover:bg-slate-700 transition-colors">settings</Link>
              {/* using <GearFill/> doesnt work for some reason */}
            </div>
          </form>

          {/* White sidebar */}
          {showPanel && (
            <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '360px',
                height: '100vh',
                background: '#ffffff',
                zIndex: 10,
                padding: '24px 20px',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
            }}>
                            
              {/* Exit white sidebar */}
              <button onClick={() => { setRoute([]); setDrawnRoute([]); setSearchedOrigin(""); setSearchedDestination(""); reset(); }}
                style={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  fontSize: 15,
                  cursor: 'pointer',
                  lineHeight: 1,
                  color: 'red'
                }}
              > Exit Route
              </button>

              {/* Origin */}
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: 11, color: '#888', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Starting Location</p>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <p style={{ fontSize: 15, fontWeight: 600, color: '#111', margin: 0 }}>{searchedOrigin}</p>
                  {searchedOrigin && <ValidBadge />}
                </div>
              </div>

              {/* Destination */}
              <div>
                <p style={{ fontSize: 11, color: '#888', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Destination</p>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <p style={{ fontSize: 15, fontWeight: 600, color: '#111', margin: 0 }}>{searchedDestination}</p>
                  {searchedDestination && <ValidBadge />}
                </div>
              </div>

              {/* Transition to Route */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 20, marginBottom: 16 }}>
                <div style={{ flex: 1, height: '1px', background: '#eee' }} />
                <span style={{ fontSize: 14, color: '#aaa' }}>Route</span>
                <div style={{ flex: 1, height: '1px', background: '#eee' }} />
              </div>

            <div style={{overflowY: "auto", flex: 1, minHeight: 0}}>
                  <DisplayRoute routeData={routeData} origin={searchedOrigin} destination={searchedDestination}></DisplayRoute>
            </div>

            <p style={{ textAlign: 'center', fontSize: 11, color: '#aaa', marginTop: 8 }}>
              scroll down for more
            </p>
            
            </div>
          )}

        </div>

      </>
    )

}