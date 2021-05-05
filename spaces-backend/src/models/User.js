const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const { exception } = require('console')
const createVhostS3 = require('../utils')

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, min: 6, max: 255 },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  vhost: { type: String, unique: true },
  createdAt: { type: Date, default: Date.now },
  // folder: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Folder' }]
  // posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }]
})

UserSchema.pre('save', async function (next) {
  if (!this.vhost) { // objeto novo, melhorar a verificação
    const passwordEncrypt = await bcrypt.hash(this.password, 10)
    this.password = passwordEncrypt

    const random = Math.random().toString()
    this.vhost = await crypto.createHash('sha1').update(random).digest('hex')

    try {
      await createVhostS3(this.vhost)
    } catch (error) {
      exception()
    }
  }
  next()
})

module.exports = mongoose.model('User', UserSchema)
