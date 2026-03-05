import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import './Login.css'

//user input submitted from login
type LoginFormInputs = {
    email: string;
    password: string;
}

//user input stored in db from signup
type UserData = {
    email: string;
    username: string;
    password: string;
}

export default function Login() {

    const navigate = useNavigate(); //routing
    const [loginError, setLoginError] = useState("");

    //create form and track input data upon submission
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormInputs>({mode: "onSubmit",});

    //capture input
    const onSubmit: SubmitHandler<LoginFormInputs> = (data) => {
        const userEmail = localStorage.getItem(data.email);
        
        if (userEmail) {
            const userData: UserData = JSON.parse(userEmail);
            
            if (userData.password === data.password) {
                setLoginError("");
                navigate("/home");
            } 
            else {
                setLoginError("Email or password is incorrect.");
            }
        } 
        else {
            setLoginError("Email or password is incorrect.");
        }
    }   

    return (
        <>
            <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                    <img alt="Stable Route logo" src="src/assets/earth.png" className="mx-auto h-25 w-auto"/>
                    <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-">Welcome to Stable Route</h2>
                </div>

                <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                        { /* Email input box */}
                        <div>
                            <label htmlFor="email" className="block text-sm/6 font-medium text-black">Email Address</label>
                            <div className="mt-2">
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="Enter your email"
                                    {...register("email", { required: true })}
                                    autoComplete="email"
                                    className="block w-full rounded-md border-2 border-gray-400 bg-white px-3 py-1.5 text-base text-black placeholder:text-black-500 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-500 sm:text-sm/6"
                                />
                                { /* Lacks input - email error */}
                                {errors.email && <span className="text-red-500 text-sm">Please enter your email.</span>}
                            </div>
                        </div>
                        
                        { /* Password input box */}
                        <div>
                            <div className="flex items-center justify-between">
                                <label htmlFor="password" className="block text-sm/6 font-medium text-black">Password</label>
                                <div className="text-sm">
                                </div>
                            </div>
                            <div className="mt-2">
                                <input
                                    id="password"
                                    type="password"
                                    placeholder="Enter your password"
                                    {...register("password", { required: true })}
                                    onChange={() => setLoginError("")} //clear error message when user types again
                                    autoComplete="current-password"
                                    className="block w-full rounded-md border-2 border-gray-400 bg-white px-3 py-1.5 text-base text-black placeholder:text-black-500 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-500 sm:text-sm/6"
                                />
                                {errors.password ? (<span className="text-red-500 text-sm">Please enter your password.</span>) : null}
                                {!errors.password && loginError ? (<span className="text-red-500 text-sm">{loginError}</span>) : null}
                            </div>
                        </div>

                        { /* Sign In button */}
                        <div className="flex justify-center">
                            <button type="submit"
                                className="
                                w-35 
                                rounded-md 
                                bg-blue-500
                                px-3 py-1.5
                                text-sm/6 
                                font-semibold 
                                text-white hover:bg-blue-400 
                                focus-visible:outline-2 
                                focus-visible:outline-offset-2 
                                focus-visible:outline-blue-500">
                                Sign In
                            </button>
                        </div>
                    </form>
                    
                    { /* Link to Sign Up page */}
                    <p className="mt-5 text-center">
                        <a href="/Signup" className="font-semibold text-blue-500 hover:text-blue-300">Create an Account</a>
                    </p>

                </div>
            </div>  
        </>
    );
}