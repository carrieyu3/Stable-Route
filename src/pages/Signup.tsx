import React from 'react'
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import './Signup.css'

//user input that is submitted from signup
interface SignupFormInputs {
    email: string;
    username: string;
    password: string;
    passwordConfirmation: string;
}

//user input stored in db from signup
interface UserData {
    email: string;
    username: string;
    password: string;
}

function Signup(): React.ReactElement {
    const {
        register, //connection to React Hook
        handleSubmit, //check for valid inputs
        formState: { errors }, //display error messages
    } = useForm<SignupFormInputs>({mode: "onSubmit",}); //create form and track input data upon submission

    const onSubmit: SubmitHandler<SignupFormInputs> = (data) => { //submission variable that captures user input {email, username, password, passwordConfirmation}
        const existingUser = localStorage.getItem(data.email); //browser storage
        
        //check if email in already in db
        if (existingUser) {
            console.log("Email already exists. Please enter another email.");
            //future implementation: add banner to indicate email alr exists
        } 
        //email doesn't exist, so create new account
        else {
            const newUser: UserData = {
                email: data.email,
                username: data.username,
                password: data.password
            };

            localStorage.setItem(data.email, JSON.stringify(newUser)); //new users are stored as json string in local storage
            console.log("Account was created");
        }
    };

    return (
        <>
            <div className="flex min-h-full flex-col justify-center px-6 py-2 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                    <img alt="Stable Route logo" src="src/assets/earth.png" className="mx-auto h-10 w-auto"/>
                    <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-black">Sign up and Join today!</h2>
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
                                    className="block w-full rounded-md border-2 border-gray-300 bg-white px-3 py-1.5 text-base text-black placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                                />
                                {errors.email && <span className="text-red-500 text-sm">Please enter your email</span>}
                            </div>
                        </div>

                        { /* Username input box */}
                        <div>
                            <label htmlFor="username" className="block text-sm/6 font-medium text-black">Username</label>
                            <div className="mt-2">
                                <input
                                    id="username"
                                    type="text"
                                    placeholder="Enter your username"
                                    {...register("username", { required: true })} //include input username in React Hook
                                    autoComplete="username"
                                    className="block w-full rounded-md border-2 border-gray-300 bg-white px-3 py-1.5 text-base text-black placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                                />
                                {errors.username && <span className="text-red-500 text-sm">Please enter your username</span>}
                            </div>
                        </div>

                        { /* Password input box */}
                        <div>
                            <label htmlFor="password" className="block text-sm/6 font-medium text-black">Password</label>
                            <div className="mt-2">
                                <input
                                    id="password"
                                    type="password"
                                    placeholder="Enter your password"
                                    {...register("password", { required: true })} //include input password in React Hook
                                    autoComplete="current-password"
                                    className="block w-full rounded-md border-2 border-gray-300 bg-white px-3 py-1.5 text-base text-black placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                                />
                                {errors.password && <span className="text-red-500 text-sm">Please enter your password</span>}
                            </div>
                        </div>

                        { /* Confirm Password input box */}
                        <div>
                            <label htmlFor="passwordConfirmation" className="block text-sm/6 font-medium text-black">Confirm Password</label>
                            <div className="mt-2">
                                <input
                                    id="passwordConfirmation"
                                    type="password"
                                    placeholder="Enter your password again"
                                    {...register("passwordConfirmation", { required: true })} //include input passwordConfirmation in React Hook
                                    autoComplete="current-password"
                                    className="block w-full rounded-md border-2 border-gray-300 bg-white px-3 py-1.5 text-base text-black placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                                />
                                {errors.passwordConfirmation && <span className="text-red-500 text-sm">Please enter your password again</span>}
                            </div>
                        </div>

                        { /* Create Account button */}
                        <div className="flex justify-center">
                            {/*width, shape, hor/vert padding, textsize, textfont, hover, non-mouse inputs*/}
                            <button type="submit"
                                className="
                                w-40 
                                rounded-md 
                                bg-blue-500
                                px-3 py-1.5
                                text-sm/6 
                                font-semibold 
                                text-white hover:bg-blue-400 
                                focus-visible:outline-2 
                                focus-visible:outline-offset-2 
                                focus-visible:outline-indigo-500">
                                Create Account
                            </button>
                        </div>
                    </form>
                    
                    { /* Link to Sign In page */}
                    <p className="mt-5 text-center">
                        <a href="/" className="font-semibold text-blue-500 hover:text-blue-300">Sign In</a>
                    </p>

                </div>
            </div>  
        </>
    );
}

export default Signup