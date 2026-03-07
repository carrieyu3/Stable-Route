import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "../lib/supabase";
import './Signup.css'

//user input submitted from signup
type SignupFormInputs = {
    email: string;
    username: string;
    password: string;
    passwordConfirmation: string;
}

export default function Signup() {

    const navigate = useNavigate(); //routing
    const [emailError, setEmailError] = useState("");
    const [usernameError, setUsernameError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [passwordConfirmationError, setPasswordConfirmationError] = useState("");

    //create form and track input data upon submission
    const {
        register,
        handleSubmit,
        formState: { errors },
        clearErrors,
    } = useForm<SignupFormInputs>({mode: "onSubmit",});
    
    //auth errors - override supabase default messages
    const displayAuthErrors = (error: any) => {
        if (error.message.includes("User already registered")) {
            setEmailError("Email already exists.");
        } 
        else if (error.message.includes("Password should be at least 6 characters")) {
            setPasswordError(error.message); //print under password, not email
        } 
    };

    //database errors - override supabase default message
    const displayDatabaseErrors = (error: any) => {
        if (error.message.includes("duplicate")) {
            setUsernameError("Username already exists.");
        }
    };

    //Capture user input and begin Signup validation
    const onSubmit: SubmitHandler<SignupFormInputs> = async (data) => {

        if (data.password !== data.passwordConfirmation) {
            setPasswordConfirmationError("Passwords do not match.");
            return; //prevent rest of signup process
        }

        //query through User db for existing username
        const { data: existingUser } = await supabase
            .from('User')
            .select('user_username')
            .ilike('user_username', data.username) //disregard case-sensitive chars
            .single();

        //if a dupe is found, do not store data in Auth with a different email
        if (existingUser) {
            setUsernameError("Username already exists.");
            return;
        }

        //otherwise, create account and store data in Auth after signup
        const { data: authData, error: signupError } = await supabase.auth.signUp({
            email: data.email,
            password: data.password,
        });

        if (signupError) {
            displayAuthErrors(signupError);
        }
        //after auth, store data in User table
        else if (authData.user) {
            const { error: databaseError } = await supabase
                .from('User')
                .insert([{ 
                    user_id: authData.user.id, 
                    user_username: data.username.toLowerCase(),
                    user_email: data.email.toLowerCase() 
                }]);

            if (databaseError) {
                displayDatabaseErrors(databaseError);
            }
            else {
                navigate("/"); //route to home page
            }     
        }
    };

    return (
        <>
            <div className="flex min-h-full flex-col justify-center px-6 py-2 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                    <img alt="Stable Route logo" src="src/assets/earth.png" className="mx-auto h-17 w-auto"/>
                    <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-black">Sign up and Join today!</h2>
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
                                    onChange={() => {
                                        setEmailError(""); 
                                        clearErrors("email"); }}
                                    autoComplete="email"
                                    className="block w-full rounded-md border-2 border-gray-400 bg-white px-3 py-1.5 text-base text-black placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-500 sm:text-sm/6"
                                />
                                {errors.email ? (<span className="text-red-500 text-sm">Please enter your email.</span>) : null}
                                {!errors.email && emailError? (<span className="text-red-500 text-sm">{emailError}</span>) : null}
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
                                    {...register("username", { required: true })}
                                    onChange={() => {
                                        setUsernameError(""); 
                                        clearErrors("username"); }}
                                    autoComplete="username"
                                    className="block w-full rounded-md border-2 border-gray-400 bg-white px-3 py-1.5 text-base text-black placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-500 sm:text-sm/6"
                                />
                                {errors.username ? (<span className="text-red-500 text-sm">Please enter your username.</span>) : null}
                                {!errors.username && usernameError? (<span className="text-red-500 text-sm">{usernameError}</span>) : null}
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
                                    {...register("password", { required: true })}
                                    onChange={() => {
                                        setPasswordError(""); 
                                        clearErrors("password"); }}
                                    autoComplete="current-password"
                                    className="block w-full rounded-md border-2 border-gray-400 bg-white px-3 py-1.5 text-base text-black placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-500 sm:text-sm/6"
                                />
                                {errors.password ? (<span className="text-red-500 text-sm">Please enter your password.</span>) : null}
                                {!errors.password && passwordError? (<span className="text-red-500 text-sm">{passwordError}</span>) : null}
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
                                    {...register("passwordConfirmation", { required: true })}
                                    onChange={() => {
                                        setPasswordConfirmationError(""); 
                                        clearErrors("passwordConfirmation"); }}
                                    autoComplete="current-password"
                                    className="block w-full rounded-md border-2 border-gray-400 bg-white px-3 py-1.5 text-base text-black placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-500 sm:text-sm/6"
                                />
                                {errors.passwordConfirmation ? (<span className="text-red-500 text-sm">Please enter your password again.</span>) : null}
                                {!errors.passwordConfirmation && passwordConfirmationError ? (<span className="text-red-500 text-sm">{passwordConfirmationError}</span>) : null}
                            </div>
                        </div>

                        { /* Create Account button */}
                        <div className="flex justify-center">
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
                                focus-visible:outline-bluego-500">
                                Create Account
                            </button>
                        </div>
                    </form>
                    
                    { /* Link to Sign In page */}
                    <p className="mt-5 text-center">
                        Already have an account? <a href="/" className="font-semibold text-blue-500 hover:text-blue-300">Sign In</a>
                    </p>

                </div>
            </div>  
        </>
    );
}