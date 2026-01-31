const allData = async () =>{
const Response = await fetch('http://localhost:8080/api')
const Data = await Response.json()
console.log(Data);
}
allData()