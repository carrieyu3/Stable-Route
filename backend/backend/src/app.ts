import express from 'express';
import users from './users/users-handlers.ts'
const app = express()
const port = 3000

app.get('/', async (req, res) => {
  res.send("PLACEHOLDER")
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})


app.use('/users',users)