import express from 'express';
import users from './users/users-handlers.ts'
import routes from './routes/routes-handlers.ts'
import cors from 'cors'
import csv from 'csv-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express()
const port = 3000

export const subway_hashmap : { [key: string] : any } = {}

function csvToHashmap() {
  fs.createReadStream(path.join(__dirname, 'data', 'MTA_Subway_Stations_20260414.csv'))
    .pipe(csv())
    .on('data', (data) => {
      subway_hashmap[data['GTFS Stop ID']] = data
    })
    // .on('end', () => {
    //   console.log(subway_hashmap)
    // })
}

//allow frontend requests to go through backend
app.use(cors({origin: 'http://localhost:5173'}))

app.use(express.json())

app.get('/', async (req, res) => {
  res.send("PLACEHOLDER")
})

app.listen(port, () => {
  csvToHashmap()
  console.log(`Example app listening on port ${port}`)
})

app.use('/users',users)

app.use('/routes',routes)