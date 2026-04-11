import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import './Home.css'

//library import needed for map
import {Map , GeolocateControl } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

//icons 
// import { GearFill , GeoAltFill } from 'react-bootstrap-icons';
import { useEffect, useRef , useState } from "react";

//supabase
import { supabase } from "../lib/supabase";
import Preference from "./Preference";

// input for starting destination 
type destinationInput = {
  origin: string;
  destination: string;
}

export default function MainPG(){

  const [addressError, setAddressError] = useState("");
  const [username, setUsername] = useState("");
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

  //database errors - override supabase default message
    const displayAddressError = (error: any) => {
        if (error.message.includes("Invalid address")) {
            setAddressError("Invalid address");
        }
    };
    
    //create form and track input data upon submission
    const {
      register,
      handleSubmit,
      clearErrors,
      formState: { errors } ,
    } = useForm<destinationInput>({mode: "onSubmit",});

  //Capture user input and begin Signup validation
  const onSubmit: SubmitHandler<destinationInput> = async (data) => {
      if (data.origin == data.destination || data.origin == "" || data.destination == ""){
          setAddressError("Invalid address")
          return
      }
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
                  numTripPatterns: 5 //display # trip patterns
              })
          })

          const result = await rawResponse.json()

          if (result.error){
              setAddressError(result.error)
          } 
          else {
              console.log(result)
          }
      } 
      catch (e: any) {
          setAddressError(e.message)
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
  const geoControlRef= useRef<maplibregl.GeolocateControl>(null)  

  useEffect(()=>{
    geoControlRef.current?.trigger()
  },[geoControlRef.current])

    return(
      <>

        <div className="flex min-h-full flex-col justify-center absolute">

        { /* insert map here */}
        {preferences.highContrast ? 
        // true 
          <Map
              initialViewState={{
                longitude: -74.0060,
                latitude: 40.7128,
                zoom: 12

              }}
              style={{width: '100vw', height: '100vh'}}
              mapStyle="src/assets/high-contrast-map.json"
            />
        : 
          // false
          <Map
                initialViewState={{
                  longitude: -74.0060,
                  latitude: 40.7128,
                  zoom: 12

                }}
                style={{width: '100vw', height: '100vh'}}
                mapStyle="src/assets/default-map.json"
              />
        }
          

          {/* below gives us the user location , we want to feed it into start point */}
          {/* <GeolocateControl showUserLocation={true} trackUserLocation={true}/> */}

            
        { /* input for destinaton */}
          <form onSubmit={handleSubmit(onSubmit)}>
            
            <div className="mx-auto w-full max-w-sm absolute left-6 top-4 flex flex-col">  

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

            <div className="max-w-sm absolute right-6 top-4">
              <a href="/preference" className="w-100 h-100 p-2 bg-slate-800 text-white text-sm font-medium rounded-md hover:bg-slate-700 transition-colors">settings</a>
              {/* using <GearFill/> doesnt work for some reason */}
            </div>
            
          </form>

        </div>

      </>
    )

}
