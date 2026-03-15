
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import './Home.css'

// import maplibregl from 'maplibre-gl' 

//library import needed for map
import Map from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';



export default function MainPG(){
    
    // input for starting destination 
    type destinationInput = {
        startPoint: string;
        endPoint: string;
    }

    //create form and track input data upon submission
        const {
            handleSubmit,
        } = useForm<destinationInput>({mode: "onSubmit",});

        // check if input is valid
        //see if address is valid 

        const onSubmit: SubmitHandler<destinationInput> = () => {}

    return(
      <>

        <div className="flex min-h-full flex-col justify-center">

        { /* insert map here */}
          <Map
            initialViewState={{
              longitude: -74.0060,
              latitude: 40.7128,
              zoom: 12
            }}
            style={{width: '100vw', height: '100vh'}}
            mapStyle="src/assets/high contrast map.json"
          />

        { /* input for starting destinaton */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm absolute left-6 top-6">  

              {/* starting point input */}
              <input
                id = "startPoint"
                placeholder = "start point"
                className="block w-full rounded-md border-2 border-gray-400 bg-white px-3 py-1.5 text-base text-black placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-500 sm:text-sm/6"
              />

              {/* ending point input */}
              <input
                id = "endPoint"
                placeholder = "end point"
                className="block w-full rounded-md border-2 border-gray-400 bg-white px-3 py-1.5 text-base text-black placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-500 sm:text-sm/6"
              />
               
              <button type="submit">settings</button>
              
            </div>

          </form>

        </div>

      </>
    )

}
