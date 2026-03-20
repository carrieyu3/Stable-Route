import express from 'express'
const router = express.Router()

import { getRoute, busRtUpdate } from './routes-service.ts'
import { uploadRoute } from './routes-queries.ts'
import { validUserID } from '../users/users-queries.ts'


router.post('/create', async (req,res) => {
    const {user_id, origin, destination, extra} = req.body
    if (!user_id || !origin || !destination || !extra){
        throw new Error("Required field(s) missing")
    }
    
    await validUserID(user_id)
    const route = await getRoute(origin,destination,extra)
    await uploadRoute(user_id,origin,destination,route[0]["duration"])

    res.send(route)
})

router.get('/test', async(req,res)=>{
    await busRtUpdate()
    console.log("HERE")
    res.send('TEST')
})


export default router
