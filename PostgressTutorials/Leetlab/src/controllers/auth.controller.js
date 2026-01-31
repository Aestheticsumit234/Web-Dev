import bcrypt from "bcryptjs"
import {db} from "../libs/db.js"

export const register = async(req,res)=>{
    const {name, email, password,image,role} = req.body
    try {
        const exestingUser = await db.user.findUnique({where:{ email }})
        if(exestingUser){
            res.status(400).json({message : "user already exists"})
        }

        const hashedPassword = await bcrypt.hash(password,10)

        const newUser = await db.user.create({
            data:{
                email,
                password : hashedPassword,
                name,
                role ,
                image 
            }
        })
        
    } catch (error) {
        console.log("Error is creating User to db.");                
    }

}
export const login = async()=>{}
export const logout = async()=>{}
export const check = async() =>{}