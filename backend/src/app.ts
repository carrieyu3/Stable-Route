import express from 'express';
import users from './users/users-handlers.ts'
import routes from './routes/routes-handlers.ts'
const app = express()
const port = 3000

app.use(express.json())

app.get('/', async (req, res) => {
  res.send("PLACEHOLDER")
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})


app.use('/users',users)

app.use('/routes',routes)