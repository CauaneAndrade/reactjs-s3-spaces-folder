const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const aws = require("aws-sdk");
const multerS3 = require("multer-s3");

const MAX_SIZE_TWO_MEGABYTES = 2 * 1024 * 1024;  // tamanho do arquivo

const multerS3Config = multerS3({
  s3: new aws.S3(),
  bucket: process.env.BUCKET_NAME,
  contentType: multerS3.AUTO_CONTENT_TYPE,
  // acl: "public-read",  // está dando erro, não consigo tornar público
  key: (req, file, cb) => {  // gerando hashes para tornar ref do arquivo única
    crypto.randomBytes(16, (err, hash) => {
      if (err) cb(err);

      const fileName = `${hash.toString("hex")}-${file.originalname}`;
      cb(null, fileName);  // sucesso
    });
  },
});

const storageTypes = {
  local: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.resolve(__dirname, "..", "..", "tmp", "uploads"));
    },
    filename: (req, file, cb) => {
      crypto.randomBytes(16, (err, hash) => {
        if (err) cb(err);

        file.key = `${hash.toString("hex")}-${file.originalname}`;

        cb(null, file.key);
      });
    },
  }),
  s3: multerS3Config
};

module.exports = {
  dest: path.resolve(__dirname, "..", "..", "tmp", "uploads"),
  storage: storageTypes[process.env.STORAGE_TYPE],
  limits: {
    fileSize: MAX_SIZE_TWO_MEGABYTES,
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
  
    cb(null, true);  // aceita qualquer tipo de arquivo
  },
};