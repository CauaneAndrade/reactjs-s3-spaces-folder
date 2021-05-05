require('dotenv').config()
const mongoose = require('mongoose')

// Database setup
const dbConnection = mongoose.connect(
  process.env.MONGO_URL,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
  }
)

module.exports = dbConnection
