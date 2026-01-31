import express from "express"

const app = express()

const PORT = process.env.PORT || 8000


app.use((req,res,next)=>{
    console.log("I am Global middlewares");
    next()
})

app.get("/",(req,res)=>{
    console.log("This is home route");    
})

app.post("/product",(req,res)=>{
    console.log("This is my produnct routes");    
})



app.listen(PORT,()=>{
    console.log(`Server is listning on PORT : ${PORT}`)
})