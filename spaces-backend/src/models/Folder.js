const mongoose = require('mongoose')

const FolderSchema = new mongoose.Schema({
  name: String,
  url: String,
  path: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
  createdAt: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('Folder', FolderSchema)
