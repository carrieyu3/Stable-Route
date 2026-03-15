import express from 'express'
const router = express.Router()

import { getRoute } from './routes-service.ts'
import { uploadRoute } from './routes-queries.ts'
import { validUserID } from '../users/users-queries.ts'


router.post('/make', async (req,res) => {
    const {user_id, origin, destination, extra} = req.body
    if (!user_id || !origin || !destination || !extra){
        throw new Error("Required field(s) missing")
    }
    
    await validUserID(user_id)
    const route = await getRoute(origin,destination,extra)

    res.send(route)
})

export default router
