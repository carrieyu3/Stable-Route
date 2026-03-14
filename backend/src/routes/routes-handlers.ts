import express from 'express'
const router = express.Router()

import { getRoute } from './routes-service.ts'
import { postRoute } from './routes-queries.ts'


router.post('/make', async (req,res) => {
    const {user_id, origin, destination, extra} = req.body
    if (!user_id || !origin || !destination || !extra){
        throw "Required field(s) missing"
    }
    await getRoute(origin,destination,extra)

    // await postRoute(user_id,route_json)


    res.send('Got a POST request')
})

export default router
