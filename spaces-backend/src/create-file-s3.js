const File = require("./models/File");
const User = require("./models/User");
const aws = require("aws-sdk");
const crypto = require("crypto");
const createVhostS3 = require("./create-vhost");

const s3 = new aws.S3();
const CommonParam = { Bucket: process.env.BUCKET_NAME };

const uploadFile = async (file, path) => {
  const params = {
    ...CommonParam,
    Key: path,
    Body: file,
  };
  
  await s3.upload(params, function (err, data) {
    if (err) {
      throw err;
    }
    console.log(data);
  });
};

async function getUserById(userId) {
  return await User.findOne({ _id: userId }).exec();
}

const setUrl = (path) => {
  return process.env.BUCKET_URL + path;
};

function setFileName(originalname) {
  const hash = crypto.randomBytes(16);
  return `${hash.toString("hex")}-${originalname}`;
}

const getPathName = (vhost, path) => {
  if (path) {
    return `${vhost}/${path}`;
  } else {
    // se não tiver caminho -> na raiz
    return `${vhost}`;
  }
};

function createFile(vhost, name, key, path, size, isDir, thumbnailUrl) {
  var data = { vhost, name, key, path, size, isDir }
  if (!isDir) {
    var data = {...data, thumbnailUrl}
  }
  return File.create(data);
}

async function createContentS3(file, pathName, userId, isDir, folderName) {
  const user = await getUserById(userId);
  const vhost = user.vhost;
  
  var originalName = folderName
  var thumbnailUrl = fileSize = ''
  if (!isDir) {
    var fileSize = file.size
    var originalName = file.originalname;
  }
  const key = await setFileName(originalName);
  const pathNameS3 = getPathName(vhost, pathName, key);
  if (!isDir) {
    await uploadFile(vhost, pathNameS3);
    var thumbnailUrl = setUrl(pathNameS3);
  } else {
    await createVhostS3(`${vhost}/${folderName}`);
  }
  
  return await createFile(vhost, originalName, key, pathNameS3, fileSize, isDir, thumbnailUrl)
}

async function createFileS3(file, pathName, vhost) {
  const originalName = file.originalname
  const key = await setFileName(originalName) // hash-name.fileType
  const pathNameS3 = getPathName(vhost, pathName) // `${vhost}/${path}` or `${vhost}`
  await uploadFile(file.buffer, pathNameS3)
  var thumbnailUrl = setUrl(pathNameS3)
  return await File.create({
    vhost,
    name: originalName,
    key,
    path: pathNameS3,
    size: file.size,
    isDir: false,
    thumbnailUrl,
    father: pathName
  });
}

async function createFolderS3(folderName, path, vhost) {
  const key = await setFileName(folderName) // hash-folderName
  var pathS3 = `${vhost}`
  if (path){
    var pathS3 = `${vhost}/${path}` // abc123/pasta1/pasta2
  }
  await createVhostS3(`${pathS3}/${key}`)  // // abc123/pasta1/pasta2/pastaDest

  return await File.create({
    vhost,
    key,
    name: folderName,
    path: pathS3,
    isDir: true
  });
}

function getPath(path) {
  if (!path) {
    return "";
  } else {
    return path + "/";
  }
}

async function getUserContentS3(userVhost, path) {
  const params = {
    ...CommonParam,
    Delimiter: "/",
    Prefix: userVhost + "/" + await getPath(path),
  };
  return await s3.listObjects(params).promise();
}

module.exports = { createContentS3, getUserContentS3, createFileS3, createFolderS3 };
