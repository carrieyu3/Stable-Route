import express from 'express'
const router = express.Router()

import { getRoute, getTrimmedRoute, busArrival, busAlert, getDirectionId, trainArrival, trainAlert, validateAddress, subwayElevatorEscalatorCurrentOutages, elevatorEscalatorEquipment} from './routes-service.ts'
import { uploadRoute } from './routes-queries.ts'
import { validUserID } from '../users/users-queries.ts'
import { type transit, type route } from '../interface.ts'

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
router.post('/bus-arrival', async(req,res) => {
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
    res.send(time)
})

router.post('/bus-alert', async(req,res) => {
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
    const alerts = await busAlert(bus_stop)
    res.send(alerts)
})


/*
{
    "publicCode" : "6",
    "id": "subway:___"
}
*/
router.post('/train-arrival', async(req,res) => {
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
    res.send(json_arrivals)
})


router.post('/train-alert', async(req,res) =>{
    if (Object.keys(req.body).length === 0){
        throw new Error("Body Empty")
    }else if (!req.body.hasOwnProperty("publicCode")){
        throw new Error("Field is missing")
    }

    const alert_json = await trainAlert(req.body.publicCode)
    res.send(alert_json)
})

router.get('/train-stop-info', async(req,res) => {
    
})

router.get('/ee-outage', async(req,res) =>{
    // if (Object.keys(req.body).length === 0){
    //     throw new Error("Body Empty")
    // }

    const json = await subwayElevatorEscalatorCurrentOutages()
    /*
    Figure out how to get elevator/escalator id to train station
    */

    res.send(json)
})

router.get('/ee-equipment', async(req,res) => {
    const json = await elevatorEscalatorEquipment()
    res.send(json)
})



export default router