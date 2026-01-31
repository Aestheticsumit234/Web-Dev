import express from "express"
import { createWriteStream, writeFile, writeFileSync } from "fs"
import path from "path"
import AllData from "../fileDb.json" with { type : "json"}

const router = express.Router()

router.post("/:filename", async (req, res) => {
   const {filename} = req.params
   const fileExtension = path.extname(filename)
   const randomeFileName = crypto.randomUUID()
   const writeStream = createWriteStream(`./stroage/${randomeFileName}${fileExtension}`)
   req.pipe(writeStream)
   const newEntry = {
      id: randomeFileName,
      name: filename,
   };
   AllData.push(newEntry)
    console.log(AllData);
   await writeFile("./fileDb.json", JSON.stringify(AllData), (err) => {
      if (err) {
         console.log(err);
      }
   });
  
   res.send("file uploaded")
})  



export default router