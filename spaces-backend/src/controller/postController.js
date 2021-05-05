const router = require('express').Router()
const multer = require('multer')
const multerConfig = require('../config/multer') // habilita upload de arquivos
const Post = require('../models/Post')
const User = require('../models/User')
const Folder = require('../models/Folder')

router.get('/user/posts', async (req, res) => {
  const userId = req.user.id
  const loggedUser = await User.findOne({ _id: userId }).exec()
  const posts = await Post.find({ _id: { $in: loggedUser.posts } })
  return res.json(posts)
})

router.post('/user/posts', multer(multerConfig).single('file'), async (req, res) => { // um arquivo por vez, tem a opção array para poder salvar mais, porém perde-se o controle de progresso
  const { originalname: name, size, key, location: url = '' } = req.file // reestruturação
  const path = req.body.path
  const post = await Post.create({
    name,
    size,
    key,
    url,
    path
  })
  // const folder = await Folder.findOne({ userId: req.user.id, path: path }).exec()
  // folder.posts.push(post); folder.save()
  return res.json(post)
})

router.delete('/user/posts/:id', async (req, res) => { // tem um hook que define se será deletado localmente ou no s3
  const post = await Post.findById(req.params.id)
  await post.remove()
  return res.send()
})

module.exports = app => app.use('/', router)
