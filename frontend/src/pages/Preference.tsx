import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import './Preference.css'

export default function Preference() {

  const [username, setUsername] = useState("");
  const [preferenceNotif, setPreferenceNotif] = useState(false);
  const [preferences, setPreferences] = 
    useState({ 
      highContrast: false,
      fewTransfers: false,
      escalator: false, 
      elevator: false, 
      bus: false, 
      train: false 
    });

  //Retrieve username and previously saved preferences of logged User
  useEffect(() => {
    const getUserData = async () => {

      const { data: { user } } = await supabase.auth.getUser();

      if (user) {

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
  }, []) //run only on first render to prevent repetitive username retrieval

  //Check for selected preferences
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const preferenceName = e.target.name;
    const preferenceChecked = e.target.checked;

    setPreferences(values => ({ ...values, [preferenceName]: preferenceChecked }));
  }

  //Save selected preferences to database
  const handleSave = async () => {

    const { data: { user } } = await supabase.auth.getUser();

    if (user === null){
      return;
    }

    await supabase
      .from('UserPreference')
      .delete() //reset all previous preferences
      .eq('user_id', user.id);

    const { data: preferenceData } = await supabase
      .from('Preference')
      .select('preference_id, preference_name');

    if (preferenceData === null){
      return;
    }

    for (let i = 0; i < preferenceData.length; i++){
      if (preferences[preferenceData[i].preference_name as keyof typeof preferences] === true){ //checkbox
        await supabase
          .from('UserPreference')
          .insert({
            user_id: user.id,
            preference_id: preferenceData[i].preference_id
          });
      }
    }

    setPreferenceNotif(true);

    setTimeout(() => { setPreferenceNotif(false) }, 3000);

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
              <label className="cursor-pointer ml-2 text-slate-600 text-sm" htmlFor="highContrast">
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
                  type="checkbox" 
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
              <label className="cursor-pointer ml-2 text-slate-600 text-sm" htmlFor="fewTransfers">
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
              <label className="cursor-pointer ml-2 text-slate-600 text-sm" htmlFor="escalator">
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
                  type="checkbox" 
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
              <label className="cursor-pointer ml-2 text-slate-600 text-sm" htmlFor="bus">
                <div>
                  <p className="font-medium">Bus</p>
                </div>
              </label>
            </div>

            { /* Train */ }
            <div className="inline-flex items-start">
              <label htmlFor="train" className="flex items-start cursor-pointer relative">
                <input
                  id="train"
                  type="checkbox" 
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
              <label className="cursor-pointer ml-2 text-slate-600 text-sm" htmlFor="train">
                <div>
                  <p className="font-medium">Train</p>
                </div>
              </label>
            </div>

            <div className="text-center">
                <button id = "save-button" onClick={handleSave}
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
                <p id = "save-button-text" className={preferenceNotif ? "visible" : "invisible"}>Preferences were saved!</p>
            </div>

            <p className="fixed bottom-10 right-20">
                <a href="/home" className="font-semibold text-blue-500 hover:text-blue-300">Back to Home</a>
            </p>

          </div>
        </div>
      </div>
    </>
  );
}