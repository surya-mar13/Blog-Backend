import exp from 'express'
import { authenticate ,register} from '../services/authService.js';
import { UserTypeModel } from '../models/UserModel.js';
import { ArticleModel } from '../models/ArticleModel.js';

export const authorRoute=exp.Router()

//Register author
authorRoute.post('/register',async(req,res,next)=>{
  try {
    const author=await register({
      ...req.body,
      role:"AUTHOR"
    })
    //send res
    res.status(201).json({message:"Author created",payload:author})
  } catch (err) {
    next(err)
  }
});
//Authenticate author
//Create article
authorRoute.post('/article',async(req,res,next)=>{
  try {
    console.log("=== Article Creation Request ===");
    console.log("Request body:", req.body);
    
    //get article from req
    const { author, title, category, content } = req.body;

    if (!author || !title || !category || !content) {
      console.log("Validation failed - Missing fields");
      return res.status(400).json({ message: 'Missing required fields: author, title, category, content' });
    }

    console.log("Looking for author ID:", author);
    const authorDoc = await UserTypeModel.findById(author);
    console.log("Author found:", authorDoc);
    
    if (!authorDoc || authorDoc.role !== 'AUTHOR') {
      console.log("Invalid author");
      return res.status(400).json({ message: 'Invalid author id or not an author' });
    }

    //create article document
    console.log("Creating article with data:", { author, title, category, content });
    const article=new ArticleModel({ author, title, category, content })
    console.log("Article instance created:", article);
    
    //save
    let createdArticleDoc=await article.save()
    console.log("Article saved successfully:", createdArticleDoc)
    
    //send res
    res.status(201).json({message:"article created",payload:createdArticleDoc})
  } catch (err) {
    console.error("=== Article Creation Error ===");
    console.error("Error message:", err.message);
    console.error("Error stack:", err.stack);
    next(err)
  }
})
//Read articles of author
authorRoute.get("/articles/:authorId", async (req, res, next) => {
  try {
    // get author id
    const authorId = req.params.authorId;

    // read articles by this author
    const articles = await ArticleModel.find({ author: authorId });

    return res.status(200).json({ payload: articles });

  } catch (error) {
    next(error)
  }
});

//edit article
authorRoute.put('/article/:articleId', async (req, res, next) => {
  try {
    const { articleId } = req.params;
    const { author, title, category, content } = req.body;

    const article = await ArticleModel.findById(articleId);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    if (String(article.author) !== String(author)) {
      return res.status(403).json({ message: 'You can edit only your own articles' });
    }

    article.title = title ?? article.title;
    article.category = category ?? article.category;
    article.content = content ?? article.content;

    const updatedArticle = await article.save();
    return res.status(200).json({ message: 'Article updated', payload: updatedArticle });
  } catch (err) {
    next(err)
  }
})

//delete(soft delete) article