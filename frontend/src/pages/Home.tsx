import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { Link } from "react-router-dom";
import './Home.css'

//library import needed for map
import {Map, Source, Layer } from 'react-map-gl/maplibre';

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
    
  //create form and track input data upon submission
  const {
    register,
    handleSubmit,
    clearErrors,
  } = useForm<destinationInput>({mode: "onSubmit",});

  //submission for address 
  const onSubmit: SubmitHandler<destinationInput> = async (data) => {

      setRoute([]); //clear prev route

      if (data.origin == data.destination || data.origin == "" || data.destination == "") {
        setAddressError("Invalid address")
        return
      }

      if (data.origin == data.destination || data.origin == "" || data.destination == ""){
          setAddressError("Invalid address")
          return
      }

      //store searched values to display in sidebar
      setSearchedOrigin(data.origin)
      setSearchedDestination(data.destination)

      try {
          //send route request to backend
          const rawResponse = await fetch(`${import.meta.env.VITE_API_URL}/routes/create`, {
              method: 'POST',
              headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                  user_id: userId,
                  origin: data.origin,
                  destination: data.destination,
                  transportModes: [{ transportMode: "metro" }], //placeholder
                  numTripPatterns: 1 //display # trip patterns
              })
          })

          const result = await rawResponse.json()

          if (result.error){
              setAddressError(result.error)
          } 
          else {
              setRoute(result)
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
  const geoControlRef= useRef<maplibregl.GeolocateControl>(null)  ;

  const geojsonData : FeatureCollection<LineString> = {
  type: 'FeatureCollection',
  features: [
    {
      type:"Feature",
        properties: {},
  geometry: {
    type: 'LineString',
    // below are test coords, we need to feed data into here
    coordinates: [
  [-73.97559, 40.59103],
  [-73.97575, 40.59113],
  [-73.97577, 40.59114],
  [-73.97584, 40.59118],
  [-73.97589, 40.59122],
  [-73.97591, 40.59123],
  [-73.97645, 40.59155],
  [-73.97646, 40.59156],
  [-73.97659, 40.59163],
  [-73.97676, 40.59173],
  [-73.97676, 40.59174],
  [-73.97697, 40.59187],
  [-73.97698, 40.59187],
  [-73.97709, 40.59194],
  [-73.97718, 40.592],
  [-73.97722, 40.59202],
  [-73.97766, 40.59229],
  [-73.97768, 40.59231],
  [-73.97776, 40.59235],
  [-73.97784, 40.5924],
  [-73.97787, 40.59242],
  [-73.97795, 40.59247],
  [-73.97814, 40.59258],
  [-73.97828, 40.59267],
  [-73.97823, 40.59272]
        ]
      }
    }
  ]

} as const;

const lineLayer = {
  id: 'line-layer',
  type: 'line',
  paint: {
    'line-color': '#007cbf',
    'line-width': 8
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
        // true 
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

            </Map>
        : 
          // false
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
                id = "origin"
                placeholder = "start point"
                className="block w-full rounded-md border-2 border-gray-400 bg-white px-3 py-1.5 text-base text-black placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-500 sm:text-sm/6"

                {...register("origin", { required: true })}

                onChange={() => {setAddressError("") ; clearErrors("origin"); }}
                
              />

              {/* ending point input */}
              <input
                id = "destination"
                placeholder = "&#xF3E7; end point"
                className="block w-full rounded-md border-2 border-gray-400 bg-white px-3 py-1.5 text-base text-black placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-500 sm:text-sm/6"

                {...register("destination", { required: true })}

                onChange={() => {setAddressError("") ; clearErrors("destination"); }}
              />

            <button type="submit" className="mt-2 w-full bg-blue-500 text-white py-1.5 rounded-md text-sm font-medium hover:bg-blue-600 transition-colors">Search</button>
            {addressError && <p className="text-red-500 text-sm">{addressError}</p>}

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
              <button onClick={() => setRoute([])}
                style={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  fontSize: 20,
                  cursor: 'pointer',
                  lineHeight: 1,
                }}
              > x
              </button>

              {/* Origin */}
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: 11, color: '#888', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Starting Location</p>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <p style={{ fontSize: 15, fontWeight: 600, color: '#111', margin: 0 }}>{searchedOrigin}</p>
                </div>
              </div>

              {/* Destination */}
              <div>
                <p style={{ fontSize: 11, color: '#888', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Destination</p>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <p style={{ fontSize: 15, fontWeight: 600, color: '#111', margin: 0 }}>{searchedDestination}</p>
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