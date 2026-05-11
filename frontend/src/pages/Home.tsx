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
import type { LineLayerSpecification } from 'maplibre-gl';

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
  const [showSidebar, setShowSidebar] = useState(false)
  const showPanel = routeData.length > 0 || showSidebar
  const [drawnRoute, setDrawnRoute] = useState<routeInfo[]>([]);
  const [originError, setOriginError] = useState(false)
  const [destinationError, setDestinationError] = useState(false)
  const [selectedMode, setSelectedMode] = useState<'bus' | 'train' | 'both' | null>(null)
  const [busRoutePreview, setBusRoutePreview] = useState<routeInfo | null>(null)
  const [trainRoutePreview, setTrainRoutePreview] = useState<routeInfo | null>(null)
  const [busAndTrainRoutePreview, setBusAndTrainRoutePreview] = useState<routeInfo | null>(null)
  const TrainAndBusMode = preferences.bus && preferences.train
    
  //create form and track input data upon submission
  const {
    register,
    handleSubmit,
    clearErrors,
    reset, //clear prev input fields
  } = useForm<destinationInput>({mode: "onSubmit",});

  //fetch route based on selected mode
  const fetchRoute = async (origin: string, destination: string, mode: 'bus' | 'train' | 'both') => {
      const transportModes = mode === 'both' 
        ? [{ transportMode: 'bus' }, { transportMode: 'train' }]
        : [{ transportMode: mode }]

      const rawResponse = await fetch(`${import.meta.env.VITE_API_URL}/routes/create`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: userId,
          origin,
          destination,
          transportModes,
          numTripPatterns: 1
        })
      })

      const result = await rawResponse.json()
      if (result.error) {
        setAddressError(result.error)
        setOriginError(result.error.includes("Origin"))
        setDestinationError(result.error.includes("Destination"))
      } 
      else {
        setRoute(result)
        setDrawnRoute(result)
      }
  }
  

  //submission for route
  const onSubmit: SubmitHandler<destinationInput> = async (data) => {
      setRoute([]); //clear prev route
      setDrawnRoute([]);
      setSelectedMode(null);
      setShowSidebar(false);

      if (data.origin == data.destination || data.origin == "" || data.destination == "") {
        setAddressError("Invalid address")
        return
      }

      setSearchedOrigin(data.origin)
      setSearchedDestination(data.destination)
      setShowSidebar(true)

      //both Train and Bus are selected - allow user to pick train or bus
      if (TrainAndBusMode) {
        setBusRoutePreview(null)
        setTrainRoutePreview(null)

        const [busResult, trainResult, BusAndTrainResult] = await Promise.all([
          fetch('http://localhost:3000/routes/create', {
            method: 'POST',
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, origin: data.origin, destination: data.destination, transportModes: [{ transportMode: 'bus' }], numTripPatterns: 1 })
          }).then(r => r.json()),
          fetch('http://localhost:3000/routes/create', {
            method: 'POST',
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, origin: data.origin, destination: data.destination, transportModes: [{ transportMode: 'train' }], numTripPatterns: 1 })
          }).then(r => r.json()),
          fetch('http://localhost:3000/routes/create', {
            method: 'POST',
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, origin: data.origin, destination: data.destination, transportModes: [{ transportMode: 'bus' }, { transportMode: 'train' }], numTripPatterns: 1 })
          }).then(r => r.json()),
        ])

        //total trip time depending on mode of transport
        if (!busResult.error) {
          setBusRoutePreview(busResult[0])
        }
        if (!trainResult.error) {
          setTrainRoutePreview(trainResult[0])
        }
        if (!BusAndTrainResult.error){
          setBusAndTrainRoutePreview(BusAndTrainResult[0])
        }
        return
      }

      //if only Train or bus, just display route data
      if (preferences.bus) {
        await fetchRoute(data.origin, data.destination, 'bus')
      } 
      else {
        await fetchRoute(data.origin, data.destination, 'train')
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

const lineLayer: Omit<LineLayerSpecification, 'source'> = {
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
};

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
                placeholder="Enter your current location"
                className="block w-full rounded-md border-2 border-gray-400 bg-white px-3 py-1.5 text-base text-black placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-500 sm:text-sm/6"
                {...register("origin", { required: true })}
                onChange={() => { setAddressError(""); setOriginError(false); clearErrors("origin"); }}
              />
              {originError && <span style={{ display: 'inline-flex', alignItems: 'center', background: '#fdecea', color: '#c62828', fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: '0 0 6px 6px', marginBottom: 4}}>Origin is invalid or not in NYC !</span>}

              {/* ending point input */}
              <input
                id="destination"
                placeholder="Enter a destination"
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
              <button onClick={() => { setRoute([]); setDrawnRoute([]); setSearchedOrigin(""); setSearchedDestination(""); setSelectedMode(null); setShowSidebar(false); reset(); }}
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

              {/* If both Bus and Train were selected in Preference, user will select either one */}
              {TrainAndBusMode && !selectedMode ? (
                <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 12 }}>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 20, marginBottom: 25}}>
                    <div style={{ flex: 1, height: '1px', background: '#eee' }} />
                  </div>

                  <p style={{ fontSize: 13, color: '#555', textAlign: 'center' }}>Please select a mode of transportation below:</p>

                  <button 
                    onClick={() => { setSelectedMode('bus'); fetchRoute(searchedOrigin, searchedDestination, 'bus') }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#1c7ed6', e.currentTarget.style.color = '#fff')}
                    onMouseLeave={e => (e.currentTarget.style.background = '#fff', e.currentTarget.style.color = '#1c7ed6')}
                    style={{ padding: '14px', borderRadius: 10, border: '2px solid #1c7ed6', background: '#fff', fontSize: 15, fontWeight: 600, color: '#1c7ed6', cursor: 'pointer' }}>
                    BUS
                    {busRoutePreview && (
                      <span style={{ display: 'block', fontSize: 12, fontWeight: 400, marginTop: 3 }}>
                        {Math.floor(busRoutePreview.duration/60)} min total
                      </span>
                    )}
                  </button>

                  <button 
                    onClick={() => { setSelectedMode('train'); fetchRoute(searchedOrigin, searchedDestination, 'train') }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#1c7ed6', e.currentTarget.style.color = '#fff')}
                    onMouseLeave={e => (e.currentTarget.style.background = '#fff', e.currentTarget.style.color = '#1c7ed6')}
                    style={{ padding: '14px', borderRadius: 10, border: '2px solid #1c7ed6', background: '#fff', fontSize: 15, fontWeight: 600, color: '#1c7ed6', cursor: 'pointer' }}>
                    TRAIN
                    {trainRoutePreview && (
                      <span style={{ display: 'block', fontSize: 12, fontWeight: 400, marginTop: 3 }}>
                        {Math.floor(trainRoutePreview.duration/60)} min total
                      </span>
                    )}
                  </button>

                  <button 
                    onClick={() => { setSelectedMode('both'); fetchRoute(searchedOrigin, searchedDestination, 'both') }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#1c7ed6', e.currentTarget.style.color = '#fff')}
                    onMouseLeave={e => (e.currentTarget.style.background = '#fff', e.currentTarget.style.color = '#1c7ed6')}
                    style={{ padding: '14px', borderRadius: 10, border: '2px solid #1c7ed6', background: '#fff', fontSize: 15, fontWeight: 600, color: '#1c7ed6', cursor: 'pointer' }}>
                    BUS & TRAIN
                    {busAndTrainRoutePreview && (
                      <span style={{ display: 'block', fontSize: 12, fontWeight: 400, marginTop: 3 }}>
                        {Math.floor(busAndTrainRoutePreview.duration/60)} min total
                      </span>
                    )}
                  </button>

                </div>
              ) : (
                <>

                  {/* Transition to route display for selected transport mode */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 20}}>
                    <div style={{ flex: 1, height: '1px', background: '#eee' }} />
                    <span style={{ fontSize: 14, color: '#aaa' }}>Route</span>
                    <div style={{ flex: 1, height: '1px', background: '#eee' }} />
                  </div>

                  {TrainAndBusMode && selectedMode && (
                    <button 
                      onClick={() => { setSelectedMode(null); setRoute([]); setDrawnRoute([]); }} 
                      style={{ marginTop: 5, alignSelf: 'flex-end', fontSize: 12, color: 'red', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                      BACK
                    </button>
                  )}

                  <div style={{ overflowY: 'auto', flex: 1, minHeight: 0 }}>
                    <DisplayRoute routeData={routeData} origin={searchedOrigin} destination={searchedDestination} elevatorPreference={preferences.elevator}/>
                  </div>

                  <p style={{ textAlign: 'center', fontSize: 11, color: '#aaa', marginTop: 8 }}>
                    scroll down for more
                  </p>
                </>
              )}
              </div>
          )}

        </div>
      </>
    )
}