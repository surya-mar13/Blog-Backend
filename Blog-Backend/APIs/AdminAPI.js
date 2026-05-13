import exp from 'express'
import { UserTypeModel } from '../models/UserModel.js'

export const adminRoute = exp.Router()

// list users
adminRoute.get('/users', async (req, res, next) => {
  try {
    const users = await UserTypeModel.find({ role: 'USER' }).sort({ createdAt: -1 })
    return res.status(200).json({ message: 'users', payload: users })
  } catch (err) {
    next(err)
  }
})

// list authors
adminRoute.get('/authors', async (req, res, next) => {
  try {
    const authors = await UserTypeModel.find({ role: 'AUTHOR' }).sort({ createdAt: -1 })
    return res.status(200).json({ message: 'authors', payload: authors })
  } catch (err) {
    next(err)
  }
})

// block user
adminRoute.put('/blockUsers', async (req, res, next) => {
  try {
    let { userId } = req.body
    let user = await UserTypeModel.findByIdAndUpdate(userId, { isActive: false }, { new: true })
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    return res.json({ message: 'User blocked successfully', user })
  } catch (err) {
    next(err)
  }
})

// unblock user
adminRoute.put('/unblockUsers', async (req, res, next) => {
  try {
    let { userId } = req.body
    let user = await UserTypeModel.findByIdAndUpdate(userId, { isActive: true }, { new: true })
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    return res.json({ message: 'User unblocked successfully', user })
  } catch (err) {
    next(err)
  }
})
