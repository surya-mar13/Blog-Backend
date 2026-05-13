import { UserTypeModel } from "../models/UserModel.js"

export const checkAuthor = async (req, res, next) => {
  try {
    let aid = req.body?.author || req.params?.authorId
    if (!aid) {
      return res.status(400).json({ message: "Author ID is required" })
    }
    let author = await UserTypeModel.findById(aid)
    if (!author) {
      return res.status(404).json({ message: "Author not found" })
    }
    if (author.role !== "AUTHOR") {
      return res.status(403).json({ message: "User is not an author" })
    }
    req.author = author
    next()
  } catch (err) {
    next(err)
  }
}