import express from 'express'
const router = express.Router()

import { getRoute, busRtUpdate } from './routes-service.ts'
import { uploadRoute } from './routes-queries.ts'
import { validUserID } from '../users/users-queries.ts'
import { type bus, type route } from '../interface.ts'

router.post('/create', async (req,res) => {
    if (Object.keys(req.body).length === 0){
        throw new Error("Body Empty")
    }    
    if (!req.body.hasOwnProperty("user_id") || !req.body.hasOwnProperty("origin") || !req.body.hasOwnProperty("destination") || !req.body.hasOwnProperty("transportModes") || !req.body.hasOwnProperty("numTripPatterns")){
        throw new Error("Required field(s) missing")
    }
    const {user_id} = req.body
    const route_req = req.body as route

    await validUserID(user_id)
    const route = await getRoute(route_req)
    await uploadRoute(user_id,route_req,route[0]["duration"])

    res.send(route)
})

/*
{
	"publicCode":"B1",
	"stopId": "300023",
	"directionId": "outbound"
}
*/
router.post('/bus', async(req,res) => {
    if (Object.keys(req.body).length === 0){
        throw new Error("Body Empty")
    }
    if (!req.body.hasOwnProperty("publicCode") || !req.body.hasOwnProperty("stopId")  || !req.body.hasOwnProperty("directionId")){
        throw new Error("Required field(s) missing")
    }
    let direction
    if (req.body.directionId == "outbound"){
        direction = 0
    }else{
        direction = 1
    }
    const bus_stop : bus = {
        publicCode: req.body.publicCode,
        stopId: req.body.stopId,
        directionId: direction
    }

    const time = await busRtUpdate(bus_stop)
    res.send(time)
})


export default router
