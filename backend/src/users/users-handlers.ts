import express from 'express'
import { validUserID } from './users-queries.ts'
const router = express.Router()

router.get('/', async (req, res) => {
    res.send("USER ENDPOINT")
})

export default router