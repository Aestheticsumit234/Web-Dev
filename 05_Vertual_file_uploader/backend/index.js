import express from "express"
import cors from "cors"
import fileRouter from "./routes/file.routes.js"

const app = express()
const PORT = process.env.PORT || 8000

app.use(express.json())
app.use(cors())


app.use('/api/file', fileRouter)

app.listen(PORT,()=>{
    console.log("Server is Running on PORT :",PORT);
})