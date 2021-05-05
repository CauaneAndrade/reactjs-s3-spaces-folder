const router = require('express').Router()
const User = require('../models/User')
const Folder = require('../models/Folder')
const createVhostS3 = require('../utils')

router.post('/user/folder/', async (req, res) => {
  const userId = req.user.id
  const loggedUser = await User.findOne({ _id: userId }).exec()
  const folders = await Folder.find({ _id: { $in: loggedUser.folder }, path: { $all: req.body.path } })
  return res.json(folders)
})

router.post('/user/folder/new', async (req, res) => {
  const { name, path, url = '' } = req.body // reestruturação
  const userId = req.user.id
  const loggedUser = await User.findOne({ _id: userId }).exec()
  const folder = await Folder.create({
    userId,
    name,
    path,
    url
  })
  await createVhostS3(`${loggedUser.vhost}/${path}`)
  return res.json(folder)
})

module.exports = app => app.use('/', router)
