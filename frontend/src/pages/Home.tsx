
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import './Home.css'

//library import needed for map
import {Map , GeolocateControl } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

//icons 
import { GearFill } from 'react-bootstrap-icons';
import { useEffect, useRef , useState } from "react";


// input for starting destination 
type destinationInput = {
  origin: string;
  destination: string;
}


export default function MainPG(){

  const [addressError, setAddressError] = useState("");

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
    if (data.origin == data.destination){
      displayAddressError("Invalid address.");
    }
    else if(data.origin == "" || data.destination == ""){
      displayAddressError("Invalid address");
    }
    else{
      const rawResponse = await fetch('https://localhost:3000', {
        method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
        body: JSON.stringify({origin: 1, destination: 2})
    });
    }
    return;
  }

      // check if input is valid
      //see if address is valid 

      //get user curr location
      const geoControlRef= useRef<maplibregl.GeolocateControl>(null)  

      useEffect(()=>{
        geoControlRef.current?.trigger()
      },[geoControlRef.current])

    return(
      <>

        <div className="flex min-h-full flex-col justify-center absolute">

        { /* insert map here */}
          <Map
            initialViewState={{
              longitude: -74.0060,
              latitude: 40.7128,
              zoom: 12

            }}
            style={{width: '100vw', height: '100vh'}}
            mapStyle="src/assets/high-contrast-map.json"
          />

            {/* below gives us the user location , we want to feed it into start point */}
            {/* <GeolocateControl showUserLocation={true} trackUserLocation={true}/> */}

            
        { /* input for destinaton */}
          <form onSubmit={handleSubmit(onSubmit)}>
            
            <div className="mx-auto w-full max-w-sm absolute left-6 top-6 flex flex-col">  

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
                placeholder = "end point"
                className="block w-full rounded-md border-2 border-gray-400 bg-white px-3 py-1.5 text-base text-black placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-500 sm:text-sm/6"

                {...register("destination", { required: true })}

                onChange={() => {setAddressError("") ; clearErrors("destination"); }}
              />

            </div>

            <div className="max-w-sm absolute right-6 top-6">
              <a href="/preference" className="w-100 h-100 p-2 bg-slate-800 text-white text-sm font-medium rounded-md hover:bg-slate-700 transition-colors">settings</a>
              {/* using <GearFill/> doesnt work for some reason */}
            </div>
            
          </form>

        </div>

      </>
    )

}
