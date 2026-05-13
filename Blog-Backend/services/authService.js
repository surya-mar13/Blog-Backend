import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import {UserTypeModel} from "../models/UserModel.js"

//register function
export const register=async (userObj)=>{
//create document
const user=new UserTypeModel(userObj);
//validate for empty passwords
await user.validate();
//hash and replace plain password 
user.password=await bcrypt.hash(user.password,10);
//save
const created=await user.save();
console.log("User created:", created)
//convert document to object to remove password
const newUserObj=created.toObject();
//remove password
delete newUserObj.password;
///return user obj without password
return newUserObj;
};

//authenticate function
export const  authenticate=async ({email,password})=>{
//check user with email & role
const user=await UserTypeModel.findOne({email});
    if(!user){
        const err=new Error("Invalid email or role");
        err.status=401;
        throw err;
    }

    //compare password
    const isMatch=await bcrypt.compare(password,user.password);
    if(!isMatch){
        const err=new Error("Invalid password");
        err.status=401;
        throw err;
    }
    //check isActive State
    if(user.isActive===false){
        const err=new Error("Your account is Blocked.PLZ contact Admin")
        err.status=403;
        throw err;
    }
    //generate token
    const token=jwt.sign({userId:user._id,role:user.role,email:user.email},
        process.env.JWT_SECRET || "dev_secret_key",{
            expiresIn:"1h",
        }
    )

    const userObj=user.toObject();
    delete userObj.password;
    return {token,user:userObj};
};

