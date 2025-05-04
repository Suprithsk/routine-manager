import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());
const PORT=5000;


app.listen(PORT, ()=>{
    console.log('app running on:', PORT)
})
