const aws = require('aws-sdk')

const s3 = new aws.S3()
// async function createVhostS3 (vhost, path) {
//   /*
//   cria uma pasta no bucket.
//   é usado para criar o vhost do usuário quando ele é cadastrado e
//   no endpoint de criação de pastas
//   */
//   const pathHandled = `${vhost}/${path}`
//   await s3.putObject({
//     Key: pathHandled,
//     Bucket: process.env.BUCKET_NAME
//   }, (res) => {
//     console.log(pathHandled)
//   })
// }

async function createVhostS3 (path) {
  /*
  cria uma pasta no bucket.
  é usado para criar o vhost do usuário quando ele é cadastrado e
  no endpoint de criação de pastas
  */
  const pathHandled = path + '/'
  await s3.putObject({
    Key: pathHandled,
    Bucket: process.env.BUCKET_NAME
  }, (res) => {
    console.log(pathHandled)
  })
}


module.exports = createVhostS3
