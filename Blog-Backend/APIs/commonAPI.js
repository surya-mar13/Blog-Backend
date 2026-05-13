import exp from 'express'
import bcrypt from 'bcryptjs'
import multer from 'multer'
import { v2 as cloudinary } from 'cloudinary'
import { authenticate } from '../services/authService.js'
import { verifyToken } from '../Middlewears/verifyToken.js'
import { UserTypeModel } from '../models/UserModel.js'
import { ArticleModel } from '../models/ArticleModel.js'
import { cloudinaryConfig } from '../config/cloudinaryConfig.js'
export const commonRouter=exp.Router()
const upload = multer({ storage: multer.memoryStorage() })

cloudinary.config({
    cloud_name: cloudinaryConfig.cloudName,
    api_key: cloudinaryConfig.apiKey,
    api_secret: cloudinaryConfig.apiSecret,
})

//login
commonRouter.post("/login",async(req,res,next)=>{
    try{
    //get user cred object
    let userCred=req.body;
        //call authenticate service
        let {token,user}=await authenticate(userCred);
        res.cookie('token',token,{
            httpOnly:true,
            secure:false,
            sameSite:'lax'
        });
        res.status(200).json({message:'login success',token,payload:user});
    }catch(err){
        next(err)
    }
})

// check auth (refresh support)
commonRouter.get('/check-auth', verifyToken, async (req, res) => {
    const user = await UserTypeModel.findById(req.user.userId).select('-password')
    if (!user) {
        return res.status(401).json({ message: 'Unauthorized request' })
    }

    return res.status(200).json({
        message: 'authenticated',
        payload: user,
    })
})
//logout
commonRouter.get('/logout',async(req,res)=>{
    //Clear the cookie named 'token

res.clearCookie('token',{
    httpOnly:true,
    secure:false,
    sameSite:'lax'
});
res.status(200).json({message:'Logged out successfully'});
});

///change password
commonRouter.post('/changePassword',verifyToken,async(req,res,next)=>{
    try{
    let {oldPassword,newPassword}=req.body;
    let userId=req.user.userId;
    //find user by id
    let user=await UserTypeModel.findById(userId);
    
    //First Check The Old Password
    const isMatch=await bcrypt.compare(oldPassword,user.password)
    if(!isMatch){
        return res.status(401).json({message:"Invalid old password"})
    }
    //check if new password is same as old password
    if(oldPassword===newPassword){
        return res.status(400).json({message:"New password cannot be same as old password"})
    }
    //hash new password
    user.password=await bcrypt.hash(newPassword,12)
    await user.save();
    res.json({message:"Password changed successfully"})
    }catch(err){
        next(err)
    }
})

// upload image to cloudinary
commonRouter.post('/upload-image', upload.single('image'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Image file is required' })
        }

        const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`
        const result = await cloudinary.uploader.upload(dataUri, {
            folder: 'blogapp/profiles',
        })

        return res.status(200).json({
            message: 'image uploaded',
            imageUrl: result.secure_url,
        })
    } catch (err) {
        next(err)
    }
})

// article by id
commonRouter.get('/article/:articleId', async (req, res, next) => {
    try {
        const { articleId } = req.params
        const article = await ArticleModel.findById(articleId)
            .populate('author', 'firstName lastName email profileImageUrl role')

        if (!article || !article.isArticleActive) {
            return res.status(404).json({ message: 'Article not found' })
        }

        return res.status(200).json({ message: 'article', payload: article })
    } catch (err) {
        next(err)
    }
})