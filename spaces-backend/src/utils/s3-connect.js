const aws = require("aws-sdk");

var EP = new aws.Endpoint(process.env.BUCKET_URL);
const s3 = new aws.S3({ endpoint: EP });

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

const checkUserVhostIsValid = (userVhost, path) => {
  const vhost = path.split("/")[0];
  return userVhost === vhost;
};

const checkPathIsValid = async (userVhost, path, fileName) => {
  const userVhostIsValid = await checkUserVhostIsValid(userVhost, path);
  if (userVhostIsValid) {
    const userContent = await getContentsS3(userVhost);
    const pathExist = userContent.find((obj) => obj["Key"] == path);
    const fileNameExist = userContent.find(
      (obj) => obj["Key"] == path + fileName
    );

    if (!pathExist && !path == userVhost) {
      return { message: "pathNotExist" };
    }
    if (fileNameExist) {
      return { message: "fileNameAlreadyExist" };
    } else {
      return { message: "fileCreatedSucced" };
    }
  }
  return { message: "PathIsNotValid" };
};

async function createFileS3(userVhost, file, pathName) {
  const fileName = file.originalname;
  const pathIsValid = await checkPathIsValid(userVhost, pathName, fileName);
  console.log(pathIsValid);
  if (pathIsValid["message"] === "fileCreatedSucced") {
    try {
      await uploadFile(file.buffer, pathName + fileName);
      return true;
    } catch (error) {
      return false;
    }
  } else {
    return false;
  }
}

async function createVhostS3(pathHandled) {
  /*
  cria uma pasta no bucket.
  é usado para criar o vhost do usuário quando ele é cadastrado e
  no endpoint de criação de pastas
  */
  const data = await s3.putObject(
    {
      ...CommonParam,
      Key: pathHandled,
    },
    (res) => {
      console.log(res);
    }
  );
  return data;
}

async function createFolderS3(path, folderName) {
  await createVhostS3(`${path}${folderName}/`);
}

async function getContentsS3(vhost) {
  const params = { ...CommonParam, Prefix: vhost };
  const data = await s3.listObjects(params).promise();
  return data["Contents"];
}

async function removeContentS3(path, obj) {
  var key = await `${path}${obj}`;
  if (!key.includes(".")) {
    var key = `${key}/`;
  }
  var params = { ...CommonParam, Prefix: key };

  async function emptyS3Directory() {
    const listedObjects = await s3.listObjectsV2(params).promise();

    if (listedObjects.Contents.length === 0) return;

    const deleteParams = {
      ...CommonParam,
      Delete: { Objects: [] },
    };

    listedObjects.Contents.forEach(({ Key }) => {
      deleteParams.Delete.Objects.push({ Key });
    });

    await s3.deleteObjects(deleteParams).promise();

    if (listedObjects.IsTruncated) await emptyS3Directory();
  }
  try {
    emptyS3Directory();
    return true;
  } catch (error) {
    return false;
  }
}

module.exports = {
  createFileS3,
  createFolderS3,
  createVhostS3,
  getContentsS3,
  removeContentS3,
};
