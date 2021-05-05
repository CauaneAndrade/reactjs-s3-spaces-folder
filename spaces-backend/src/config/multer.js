const multer = require('multer')
const path = require('path')
const crypto = require('crypto')
const aws = require('aws-sdk')
const multerS3 = require('multer-s3')
const User = require('../models/User')

const MAX_SIZE_TWO_MEGABYTES = 2 * 1024 * 1024 // tamanho do arquivo

const s3 = new aws.S3()
// s3.config.update({ endpoint: 'nyc3.digitaloceanspaces.com' })

const multerS3Config = multerS3({
  s3: s3,
  bucket: process.env.BUCKET_NAME,
  contentType: multerS3.AUTO_CONTENT_TYPE,
  key: (req, file, cb) => { // gerando hashes para tornar ref do arquivo única
    crypto.randomBytes(16, (err, hash) => {
      if (err) cb(err)
      User.findOne({ _id: req.user.id }).exec().then((value) => {
        // const fileName = `${value.vhost}/${path}/${hash.toString('hex')}-${file.originalname}`
        const fileName = `${value.vhost}/${hash.toString('hex')}-${file.originalname}`
        cb(null, fileName) // sucesso
      })
    })
  }
})

const multerLocalConfig = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve(__dirname, '..', '..', 'tmp', 'uploads'))
  },
  filename: (req, file, cb) => {
    crypto.randomBytes(16, (err, hash) => {
      if (err) cb(err)

      file.key = `${hash.toString('hex')}-${file.originalname}`

      cb(null, file.key)
    })
  }
})

const storageTypes = {
  local: multerLocalConfig,
  s3: multerS3Config
}

module.exports = {
  dest: path.resolve(__dirname, '..', '..', 'tmp', 'uploads'),
  storage: storageTypes[process.env.STORAGE_TYPE],
  limits: {
    fileSize: MAX_SIZE_TWO_MEGABYTES
  },
  fileFilter: (req, file, cb) => {
    /*
    // Restringir upload de arquivo por tipo
    const allowedMimes = [
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type."));
    }
    */
    cb(null, true) // aceita qualquer tipo de arquivo
  }
}
