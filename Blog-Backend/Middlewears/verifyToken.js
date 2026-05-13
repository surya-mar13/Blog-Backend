import jwt from "jsonwebtoken"
import {config} from "dotenv"
config()
export const verifyToken = (req, res, next) => {
    //read token from req
    let token=req.cookies.token
    if(token===undefined) {
        return res.status(401).json({message:"Unauthorized request"})
    }

    try{
        const decoded=jwt.verify(token,process.env.JWT_SECRET || "dev_secret_key")
        req.user=decoded
        next()
    }catch(err){
        return res.status(401).json({message:"Invalid or expired token"})
    }
}