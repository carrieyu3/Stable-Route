import express from 'express'
const router = express.Router()

import { getRoute, getTrimmedRoute, busArrival, busAlert, getDirectionId, trainArrival, trainAlert, validateAddress, getElevatorOutage, getElevatorID} from './routes-service.ts'
import { uploadRoute } from './routes-queries.ts'
import { getUserPreferences, validUserID } from '../users/users-queries.ts'
import { type transit, type route } from '../interface.ts'
import { subway_hashmap } from '../app.ts'

router.post('/create', async (req,res) => {
    try {
        if (Object.keys(req.body).length === 0){
            throw new Error("Body Empty")
        }    
        if (!req.body.hasOwnProperty("user_id") || !req.body.hasOwnProperty("origin") || !req.body.hasOwnProperty("destination") || !req.body.hasOwnProperty("transportModes") || !req.body.hasOwnProperty("numTripPatterns")){
            throw new Error("Required field(s) missing")
        }
        
        const {user_id} = req.body
        const originCoordinates = await validateAddress(req.body.origin)
        const destinationCoordinates = await validateAddress(req.body.destination)

        const route_req = {
            ...req.body,
            origin: originCoordinates,
            destination: destinationCoordinates
        } as route

        await validUserID(user_id)

        //untrimmed
        const route = await getRoute(route_req)
        await uploadRoute(user_id,route_req,route[0]["duration"])

        //trimmed
        const trimmedRoute = getTrimmedRoute(route)
        console.log(JSON.stringify(trimmedRoute, null, 2)) //temp readability
        res.send(trimmedRoute)
    } 
    catch (e: any) {
        res.status(400).json({ error: e.message })
    }
})

/*
{
    "publicCode":"B68",
    "stopId": "____",
    "directionId": "outbound"
}
*/
router.post('/bus-info', async(req,res) => {
    if (Object.keys(req.body).length === 0){
        throw new Error("Body Empty")
    }
    if (!req.body.hasOwnProperty("publicCode") || !req.body.hasOwnProperty("stopId")  || !req.body.hasOwnProperty("directionId")){
        throw new Error("Required field(s) missing")
    }
    const direction = getDirectionId(req.body.directionId)

    const bus_stop : transit = {
        publicCode: req.body.publicCode,
        stopId: req.body.stopId,
        directionId: direction
    }

    const time = await busArrival(bus_stop)
    const alert = await busAlert(bus_stop)
    const merged = {...time,...alert}
    const merged_json = JSON.stringify(merged)
    res.send(merged_json)
})

/*
{
    "publicCode" : "6",
    "stopId": "subway:___"
}
*/
router.post('/train-info', async(req,res) => {
    if (Object.keys(req.body).length === 0){
        throw new Error("Body Empty")
    }
    if (!req.body.hasOwnProperty("publicCode") || !req.body.hasOwnProperty("stopId")){
        throw new Error("Required field(s) missing")
    }
    const stop_id = req.body.stopId.split(":")

    const train_stop : transit = {
        publicCode: req.body.publicCode,
        stopId : stop_id[1]
    }
    const json_arrivals = await trainArrival(train_stop)
    const json_alerts = await trainAlert(train_stop.publicCode)
    const merged = {...json_arrivals,...json_alerts}
    const merged_json = JSON.stringify(merged)
    res.send(merged_json)
})

/*
id = GTFS ID
*/
router.get('/ee-outage/:id', async(req,res) =>{
    if (!req.params.id){
        throw new Error("ID missing")
    }
    const map_of_elevators = await getElevatorID(req.params.id)
    const oos_elevator_json = await getElevatorOutage(map_of_elevators)

    res.send(oos_elevator_json)
})


router.get('/test', async(req,res) =>{
    if (Object.keys(req.body).length === 0){
        throw new Error("Body Empty")
    }else if (!req.body.hasOwnProperty("user_id")){
        throw new Error("Field is missing")
    }
    const preference_array = await getUserPreferences(req.body.user_id)
    console.log(preference_array)

    res.send({})
})

router.post('/train-arrival', async (req, res) => {
    const { publicCode, stopId } = req.body
    const stop_id = stopId.split(":")
    const train_stop: transit = {
        publicCode,
        stopId: stop_id[1]
    }
    const arrivals = await trainArrival(train_stop)
    res.json(arrivals.arrival)
})

router.post('/bus-arrival', async (req, res) => {
    const { publicCode, stopId } = req.body
    const bus_stop: transit = {
        publicCode,
        stopId,
        directionId: 0
    }
    const arrivals = await busArrival(bus_stop)
    res.json(arrivals.arrival)
})

export default router