const mongoose = require('mongoose')

const FolderSchema = new mongoose.Schema({
  name: String,
  filhos: [],
  isDir: Boolean,
  createdAt: {
    type: Date,
    default: Date.now
  }
})

// FolderSchema.pre('save', async function () {
//   if (!this.url) {
//     this.url = `${process.env.BUCKET_URL}${this.userVhost}/${this.path + this.name}`
//   }
// })

module.exports = mongoose.model('Folder', FolderSchema)
