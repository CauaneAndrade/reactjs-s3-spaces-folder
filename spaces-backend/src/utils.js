const aws = require('aws-sdk')

const s3 = new aws.S3()
async function createVhostS3 (vhost) {
  await s3.putObject({
    Key: `${vhost}/`,
    Bucket: process.env.BUCKET_NAME
  }, (res) => {
    console.log(`${vhost}`)
  })
}

module.exports = createVhostS3
