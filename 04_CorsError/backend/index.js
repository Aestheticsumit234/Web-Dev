import express from  "express"
const app = express()

const PORT = process.env.PORT || 8080


app.use(express.static('public'))

app.use((req, res, next)=>{
    res.set('Access-Control-Allow-Origin', "*")
    next()  
})

app.get('/api', (req,res)=>{
    res.send('Hello I am from backend')
})

app.get('/api/apple', (req,res)=>{
    res.send('Hello I am from Apple')
})
 
app.post('/api/post',(req, res)=>{
    res.json({message : "Running"})
})

app.listen(PORT,()=>{
    console.log("Server is listining on PORT : ",PORT)
})