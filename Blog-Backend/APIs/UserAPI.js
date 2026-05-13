import exp from 'express'
import {register,authenticate} from '../services/authService.js'
import { ArticleModel } from '../models/ArticleModel.js'
export const userRoute=exp.Router()

//Register user
userRoute.post('/users',async(req,res,next)=>{
    try{
    console.log("=== User Registration Request ===");
    console.log("Request body:", req.body);
    //get user obj from req
    let userObj=req.body;
    //call register
    const newUserObj=await register({...userObj,role:"USER"});
    console.log("User registered successfully:", newUserObj);
    //send res
        res.status(201).json({message:"user created",payload:newUserObj})
    }catch(err){
        console.error("User registration error:", err.message);
        next(err)
    }
});
//Authenticate user
userRoute.post('/authenticate',async (req,res,next)=>{
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
//Read all articles
userRoute.get('/articles', async (req, res, next) => {
    try {
        const articles = await ArticleModel.find({ isArticleActive: true })
            
            .populate('author', 'firstName lastName email role profileImageUrl')

        return res.status(200).json({ message: 'articles', payload: articles })
    } catch (err) {
        next(err)
    }
})

//Add comment
userRoute.post('/comment/:articleId', async (req, res, next) => {
    try {
        const { articleId } = req.params
        const { userId, comment } = req.body

        if (!comment || comment.trim() === '') {
            return res.status(400).json({ message: 'Comment cannot be empty' })
        }

        const article = await ArticleModel.findById(articleId)
        if (!article) {
            return res.status(404).json({ message: 'Article not found' })
        }

        article.comments.push({
            user: userId,
            comment: comment.trim(),
        })

        await article.save()

        const updatedArticle = await article.populate(
            'comments.user',
            'firstName lastName profileImageUrl'
        )

        return res.status(201).json({
            message: 'Comment added successfully',
            payload: updatedArticle.comments,
        })
    } catch (err) {
        next(err)
    }
})

//Get article comments
userRoute.get('/article/:articleId/comments', async (req, res, next) => {
    try {
        const { articleId } = req.params
        const article = await ArticleModel.findById(articleId)
            .select('comments')
            .populate('comments.user', 'firstName lastName profileImageUrl')

        if (!article) {
            return res.status(404).json({message:"Article Not Found"});
        }

        return res.status(200).json({
            message: 'comments',
            payload: article.comments,
        })
    } catch (err) {
        next(err)
    }
})

