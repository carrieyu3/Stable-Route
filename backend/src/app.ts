import express from 'express';
import users from './users/users-handlers.ts'
import routes from './routes/routes-handlers.ts'
import cors from 'cors'

const app = express()
const port = 3000

//allow frontend requests to go through backend
app.use(cors({origin: 'http://localhost:5173'}))

app.use(express.json())

app.get('/', async (req, res) => {
  res.send("PLACEHOLDER")
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

app.use('/users',users)

app.use('/routes',routes)