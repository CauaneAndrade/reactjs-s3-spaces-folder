/*
constrole de autenticação
login e signup
*/
const router = require('express').Router()
const User = require('../models/User')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

router.post('/login', async (req, res) => {
  const user = await User.findOne({ email: req.body.email })
  if (!user) return res.status(400).json({ error: 'Email is wrong' }) // throw error when email is wrong

  const validPassword = await bcrypt.compare(req.body.password, user.password) // check for password correctness
  if (!validPassword) return res.status(400).json({ error: 'Login failed' })

  const token = jwt.sign(
    {
      name: user.email,
      id: user._id
    },
    process.env.TOKEN_SECRET
  )
  res.header('auth-token', token).json({
    error: null,
    data: { token }
  })
})

router.post('/signup', async (req, res) => {
  const { username, email, password } = req.body
  try {
    const post = await User.create({
      username,
      email,
      password
    })
    return res.json(post)
  } catch (err) {
    console.log(err)
    return res.status(400).send({ error: 'registration failed' })
  }
})

module.exports = app => app.use('/auth', router)
