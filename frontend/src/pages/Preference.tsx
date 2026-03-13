import { useState } from "react";
import { supabase } from "../lib/supabase";
import './Preference.css'

export default function Preference() {

  const [preferences, setPreferences] = 
  useState({ 
    escalator: false, 
    elevator: false, 
    colorblind: false, 
    fewTransfers: false, 
    onlyBus: false, 
    onlyTrain: false 
  });

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
          <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight">Welcome, username </h2>

          <div className="mt-8 flex flex-col gap-6">

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
                  <p className="text-slate-500">Escalator descrip</p>
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
                  <p className="text-slate-500">Elevator descrip</p>
                </div>
              </label>
            </div>

            { /* Colorblind */ }
            <div className="inline-flex items-start">
              <label htmlFor="colorblind" className="flex items-start cursor-pointer relative">
                <input
                  id="colorblind"
                  type="checkbox" 
                  name="colorblind"
                  checked={preferences.colorblind} 
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
                  <p className="font-medium">Colorblind</p>
                  <p className="text-slate-500">Colorblind descrip</p>
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
                  <p className="text-slate-500">Few transfers descrip</p>
                </div>
              </label>
            </div>

            { /* Only Bus */ }
            <div className="inline-flex items-start">
              <label htmlFor="onlyBus" className="flex items-start cursor-pointer relative">
                <input
                  id="onlyBus"
                  type="onlyBus" 
                  name="onlyBus"
                  checked={preferences.onlyBus} 
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
                  <p className="font-medium">Only Bus</p>
                  <p className="text-slate-500">Only bus descrip</p>
                </div>
              </label>
            </div>

            { /* Only Train */ }
            <div className="inline-flex items-start">
              <label htmlFor="onlyTrain" className="flex items-start cursor-pointer relative">
                <input
                  id="fonlyTrain"
                  type="onlyTrain" 
                  name="onlyTrain"
                  checked={preferences.onlyTrain} 
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
                  <p className="font-medium">Only Train</p>
                  <p className="text-slate-500">Only train descrip</p>
                </div>
              </label>
            </div>

            <button className="mt-6 w-full bg-slate-800 text-white text-sm font-medium py-2 rounded-md hover:bg-slate-700 transition-colors"> Save </button>

          </div>
        </div>
      </div>
    </>
  );
}