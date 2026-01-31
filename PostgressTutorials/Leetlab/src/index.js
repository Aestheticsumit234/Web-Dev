import express, { urlencoded } from "express"
import authRoutes from './routes/auth.route.js'
import dotenv from "dotenv"
dotenv.config()

const PORT = process.env.PORT || 8000

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth',authRoutes)

app.listen(PORT,()=>{
    console.log("server is running on : ",PORT);    
})