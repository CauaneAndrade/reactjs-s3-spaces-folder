const express = require('express')
const morgan = require('morgan')
const path = require('path')
const cors = require('cors')
const verifyToken = require('./utils/validate-login-token')

const app = express()

app.use(cors())
app.use(express.json()) // habilitando para o node conseguir lidar com json
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev'))
app.use('/files', express.static(path.resolve(__dirname, '..', 'tmp', 'uploads'))) // arquivos acessíveis via url

app.use('/user', verifyToken)
require('./config/database')

// routers
require('./controller/authController')(app)
require('./controller/fileController')(app)

app.listen(3001)
