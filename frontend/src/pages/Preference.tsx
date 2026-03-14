import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import './Preference.css'

export default function Preference() {

  const [username, setUsername] = useState("");
  const [preferences, setPreferences] = 
    useState({ 
      highContrast: false,
      fewTransfers: false,
      escalator: false, 
      elevator: false, 
      bus: false, 
      train: false 
    });

  useEffect(() => {
    const getUsername = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data } = await supabase
        .from('user_auth_test')
        .select('user_username')
        .eq('user_id', user.id)
        .single();

        if (data) {
          setUsername(data.user_username);
        }
      }
    }

    getUsername();
  }, []) //run only on first render to prevent repetitive username retrieval


  //Update preference if selected by user
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const preferenceName = e.target.name;
    const preferenceChecked = e.target.checked;

    setPreferences(values => ({ ...values, [preferenceName]: preferenceChecked }));
  }

  return (
    <>
      <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <img alt="Stable Route logo" src="src/assets/earth.png" className="mx-auto h-25 w-auto" />
          <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight">Hi, {username}.</h2>

         
          <div className="mt-8 flex flex-col gap-6">
            <p className="font-bold">Preferences</p>

            { /* High Contrast View*/ }
            <div className="inline-flex items-start">
              <label htmlFor="highContrast" className="flex items-start cursor-pointer relative">
                <input
                  id="highContrast"
                  type="checkbox" 
                  name="highContrast"
                  checked={preferences.highContrast} 
                  onChange={handleChange}
                  className="peer h-5 w-5 cursor-pointer transition-all appearance-none rounded shadow hover:shadow-md border border-slate-500 checked:bg-slate-800 checked:border-slate-800" 
                />
                <span className="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" stroke="currentColor" strokeWidth="1">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
              </label>
              <label className="cursor-pointer ml-2 text-slate-600 text-sm" htmlFor="elevator">
                <div>
                  <p className="font-medium">High Contrast View</p>
                </div>
              </label>
            </div>

            { /* Few Transfers */ }
            <div className="inline-flex items-start">
              <label htmlFor="fewTransfers" className="flex items-start cursor-pointer relative">
                <input
                  id="fewTransfers"
                  type="fewTransfers" 
                  name="fewTransfers"
                  checked={preferences.fewTransfers} 
                  onChange={handleChange}
                  className="peer h-5 w-5 cursor-pointer transition-all appearance-none rounded shadow hover:shadow-md border border-slate-500 checked:bg-slate-800 checked:border-slate-800" 
                />
                <span className="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" stroke="currentColor" strokeWidth="1">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
              </label>
              <label className="cursor-pointer ml-2 text-slate-600 text-sm" htmlFor="elevator">
                <div>
                  <p className="font-medium">Few Transfers</p>
                </div>
              </label>
            </div>

            { /* Escalator */ }
            <div className="inline-flex items-start">
              <label htmlFor="escalator" className="flex items-start cursor-pointer relative">
                <input
                  id="escalator"
                  type="checkbox" 
                  name="escalator"
                  checked={preferences.escalator} 
                  onChange={handleChange}
                  className="peer h-5 w-5 cursor-pointer transition-all appearance-none rounded shadow hover:shadow-md border border-slate-500 checked:bg-slate-800 checked:border-slate-800" 
                />
                <span className="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" stroke="currentColor" strokeWidth="1">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
              </label>
              <label className="cursor-pointer ml-2 text-slate-600 text-sm" htmlFor="elevator">
                <div>
                  <p className="font-medium">Escalator</p>
                </div>
              </label>
            </div>

            { /* Elevator */ }
            <div className="inline-flex items-start">
              <label htmlFor="elevator" className="flex items-start cursor-pointer relative">
                <input
                  id="elevator"
                  type="checkbox" 
                  name="elevator"
                  checked={preferences.elevator} 
                  onChange={handleChange}
                  className="peer h-5 w-5 cursor-pointer transition-all appearance-none rounded shadow hover:shadow-md border border-slate-500 checked:bg-slate-800 checked:border-slate-800" 
                />
                <span className="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" stroke="currentColor" strokeWidth="1">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
              </label>
              <label className="cursor-pointer ml-2 text-slate-600 text-sm" htmlFor="elevator">
                <div>
                  <p className="font-medium">Elevator</p>
                </div>
              </label>
            </div>

            { /* Bus */ }
            <div className="inline-flex items-start">
              <label htmlFor="bus" className="flex items-start cursor-pointer relative">
                <input
                  id="bus"
                  type="bus" 
                  name="bus"
                  checked={preferences.bus} 
                  onChange={handleChange}
                  className="peer h-5 w-5 cursor-pointer transition-all appearance-none rounded shadow hover:shadow-md border border-slate-500 checked:bg-slate-800 checked:border-slate-800" 
                />
                <span className="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" stroke="currentColor" strokeWidth="1">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
              </label>
              <label className="cursor-pointer ml-2 text-slate-600 text-sm" htmlFor="elevator">
                <div>
                  <p className="font-medium">Bus</p>
                </div>
              </label>
            </div>

            { /* Train */ }
            <div className="inline-flex items-start">
              <label htmlFor="train" className="flex items-start cursor-pointer relative">
                <input
                  id="ftrain"
                  type="train" 
                  name="train"
                  checked={preferences.train} 
                  onChange={handleChange}
                  className="peer h-5 w-5 cursor-pointer transition-all appearance-none rounded shadow hover:shadow-md border border-slate-500 checked:bg-slate-800 checked:border-slate-800" 
                />
                <span className="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" stroke="currentColor" strokeWidth="1">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
              </label>
              <label className="cursor-pointer ml-2 text-slate-600 text-sm" htmlFor="elevator">
                <div>
                  <p className="font-medium">Train</p>
                </div>
              </label>
            </div>

            <div className="flex justify-center">
                <button type="submit"
                    className="
                    w-55
                    rounded-md 
                    bg-blue-500
                    px-3 py-1.5
                    text-sm/6 
                    font-semibold 
                    text-white hover:bg-blue-400 
                    focus-visible:outline-2 
                    focus-visible:outline-offset-2 
                    focus-visible:outline-blue-500">
                    Save
                </button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}