import React, { useEffect, useState } from 'react'
import { supabase } from "../lib/supabase";
import './Preference.css'

export default function Preference() {

  return (
    <>
        <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <img alt="Stable Route logo" src="src/assets/earth.png" className="mx-auto h-25 w-auto"/>
                <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-">Welcome, [username]</h2>
            </div>
        </div>
    </>
  );
}