import React from "react";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import './Login.css'

//user input that is submitted from login
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

function Login(): React.ReactElement {

    const navigate = useNavigate();

    const {
        register, //connection to React Hook
        handleSubmit, //check for valid inputs
        formState: { errors }, //display error messages
    } = useForm<LoginFormInputs>({mode: "onSubmit",}); //create form and track input data upon submission

    const onSubmit: SubmitHandler<LoginFormInputs> = (data) => { //submission variable that captures user input {email, password}
        const userDataString = localStorage.getItem(data.email); //browser storage

        //if email exists, convert from json to js
        if (userDataString) {
            const userData: UserData = JSON.parse(userDataString); //browser or local storage only stores json strings "baileygmail.com": '{"name":"Bailey","password":"beepbeep"}'
            
            //verfiy if input password matches db
            if (userData.password === data.password) {
                console.log(userData.username + "Login is successful");
                navigate("/home");
            } 
            else {
                console.log("Login not successful. Email or Password is wrong.");
                //future implementation: add banner to indicate incorrect credentials
            }
        }
        //no email exists, so login doesn't go through
        else {
            console.log("Login not successful. Email or Password is wrong.");
            //future implementation: add banner to indicate incorrect credentials
        }
    };

    return (
        <>
            <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                    <img alt="Stable Route logo" src="src/assets/earth.png" className="mx-auto h-10 w-auto"/>
                    <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-black">Welcome to Stable Route</h2>
                </div>

                <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6"> { /*check for valid inputs*/}

                        { /* Email input box */}
                        <div>
                            <label htmlFor="email" className="block text-sm/6 font-medium text-black">Email Address</label>
                            <div className="mt-2">
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="Enter your email"
                                    {...register("email", { required: true })} //include input email in React Hook
                                    autoComplete="email"
                                    className="block w-full rounded-md border-2 border-gray-300 bg-white px-3 py-1.5 text-base text-black placeholder:text-black-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                                />
                                {errors.email && <span className="text-red-500 text-sm">Please enter your email</span>}
                            </div>
                        </div>
                        
                        { /* Password input box */}
                        <div>
                            <div className="flex items-center justify-between">
                                <label htmlFor="password" className="block text-sm/6 font-medium text-black">Password</label>
                                <div className="text-sm">
                                    { /* <a href="#" className="font-semibold text-black-300 hover:text-red-300">Forgot password?</a> */ }
                                </div>
                            </div>
                            <div className="mt-2">
                                <input
                                    id="password"
                                    type="password"
                                    placeholder="Enter your password"
                                    {...register("password", { required: true })}
                                    autoComplete="current-password"
                                    className="block w-full rounded-md border-2 border-gray-300 bg-white px-3 py-1.5 text-base text-black placeholder:text-black-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                                />
                                {errors.password && <span className="text-red-500 text-sm">Please enter your password</span>}
                            </div>
                        </div>

                        { /* Sign In button */}
                        <div className="flex justify-center">
                            {/*width, shape, hor/vert padding, textsize, textfont, hover, non-mouse inputs*/}
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
                                focus-visible:outline-indigo-500">
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

export default Login;