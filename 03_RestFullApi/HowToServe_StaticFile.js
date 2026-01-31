import express from "express"

const app = express()

const PORT = process.env.PORT || 8000

app.use(express.static('public'))

app.get("/",(req,res)=>{
    res.end("Hello world")
})


app.listen(PORT,()=>{
    console.log(`Server is listning on PORT : ${PORT}`)
})