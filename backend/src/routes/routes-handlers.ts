import express from 'express'
const router = express.Router()

import { getRoute, busRtUpdate } from './routes-service.ts'
import { uploadRoute } from './routes-queries.ts'
import { validUserID } from '../users/users-queries.ts'
import { type route } from '../interface.ts'

router.post('/create', async (req,res) => {
    if (!req.body){
        throw new Error("Body Empty")
    }
    const {user_id} = req.body
    const route_req = req.body as route
    console.log(route_req)
    if (!user_id || !route_req.origin || !route_req.destination || !route_req.transportModes || !route_req.numTripPatterns){
        throw new Error("Required field(s) missing")
    }
    
    await validUserID(user_id)
    const route = await getRoute(route_req)
    await uploadRoute(user_id,route_req,route[0]["duration"])

    res.send(route)
})

router.post('/bus', async(req,res) => {
    await busRtUpdate()
    res.send('BUS')
})


export default router
