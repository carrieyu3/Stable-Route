# Stable-Route

A web app that prioritizes accessibility in the NYC transit system and is designed to find an efficient route for travel. Generally, this would be for people are unable to use stairs for any reason or face difficulties with navigation, including but not limited to those with disabilities or reduced mobility and visual impairment.

## Finding Routes

Using OpenTripPlanner to create routes based on user preferences and MTA's GTFS to obtain accurate Subway and Bus schedules.

## How To Use

When requesting a route for only bus or only train, you will be immediately directed to the route.

Otherwise, when all transport modes are selected, there will be a preference display with options for Bus, Train, or Bus&Train. Please note that it takes 2-3 minutes for the total time for each transport mode to display.

## To Run

**Frontend:** npm run dev

**Backend:** npm run dev

**OTP:** java -Xmx2G -jar otp-shaded-2.8.1.jar --load .

## Technologies

**Frontend:** React + Vite + TypeScript + Tailwind CSS

**Backend:** ExpressJS + TypeScript, OpenTripPlanner

**Database:** PostgreSQL (GIS) + Supabase

## Deployment

**Frontend:** Vercel

**Backend:** Render

**OTP:** Google Cloud
