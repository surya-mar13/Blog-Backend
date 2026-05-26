import exp from 'express'
import {connect} from 'mongoose'
import{config} from 'dotenv'
import {userRoute} from './APIs/UserAPI.js'
import {adminRoute} from './APIs/AdminAPI.js'
import {authorRoute} from './APIs/AuthorAPI.js'
import cookieParser from 'cookie-parser'
import {commonRouter} from './APIs/commonAPI.js'
import cors from 'cors'

config()//process.env

const app=exp()

//add body parser middleware
app.use(exp.json())
app.use(cookieParser())
app.use(cors({
    origin: 'https://blog-application-beryl.vercel.app',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))

app.options('*', cors())

//connect APIs
app.use("/common-api",commonRouter)
app.use('/user-api',userRoute)
app.use('/author-api',authorRoute)
app.use('/admin-api',adminRoute)
app.post('/logout',(req,res)=>{
    //Clear the cookie named 'token

res.clearCookie('token',{
    httpOnly:true, //Must match original seettings
    secure:false, //Must match original settings
    sameSite:'lax' //Must match original settings
});
res.status(200).json({message:'Logged out Successfully'});});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.message)
    const status = err.status || 500
    const message = err.message || 'Internal Server Error'
    res.status(status).json({ message: message })
})
//connect to db
const connectDB=async()=>{
    try{
        await connect(process.env.DB_URL)
        console.log("DB connection success")
        //Start http server
        app.listen(process.env.PORT || process.env.port,()=>console.log(`server started on port ${process.env.PORT || process.env.port}`))
    }
    catch(err){
        console.log("there is an error in connecting"+err)
    }

}
connectDB()

//error handling middlewear
app.use((err,req,res,next)=>{
    console.log("err:",err)
    res.status(err.status || 500).json({message:err.message || "error"})
})
app.use((req,res,next)=>{
    res.status(404).json({message:"invalid path"})
})