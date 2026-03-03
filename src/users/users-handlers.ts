import express from 'express'
import { fetchUsers } from './users-queries.ts'
const router = express.Router()

router.get('/', async (req, res) => {
    const data = await fetchUsers()
    console.log(data)
    res.send("USER ENDPOINT")
})

export default router