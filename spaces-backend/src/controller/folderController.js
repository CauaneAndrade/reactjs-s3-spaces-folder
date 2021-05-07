/*
endpoints de criação de pastas no bucket
*/
require("dotenv").config();
const router = require("express").Router();
const User = require("../models/User");
const Folder = require("../models/File");
const createVhostS3 = require("../create-vhost");
const aws = require("aws-sdk");
const getData = require("./util");

const s3 = new aws.S3();

// listar conteúdos de uma pasta no bucket
// recebe um path: caminho no bucket que deve ser listado
router.post("/user/content", async (req, res) => {
  const loggedUser = await User.findOne({ _id: req.user.id }).exec();
  const userVhost = loggedUser.vhost;
  let path = req.body.path;
  if (!path) {
    path = "";
  } else {
    path = path + "/";
  }

  const params = {
    Bucket: process.env.BUCKET_NAME,
    Delimiter: "/",
    Prefix: userVhost + "/" + path,
  };
  const data = await s3.listObjects(params).promise();
  const data2 = {
    id: "mcd",
    name: "chonky-sphere-v2.png",
    thumbnailUrl: "https://chonky.io/chonky-sphere-v2.png",
  };
  return res.json({ data: getData(path, data, userVhost) }); // [{}]
});

// criar uma nova pasta no bucket
// recebe um path: caminho que deve ser criado a pasta
router.post("/user/folder", async (req, res) => {
  let { name, path } = req.body;
  const loggedUser = await User.findOne({ _id: req.user.id }).exec();
  const userVhost = loggedUser.vhost;
  if (path === "/") path = "";
  name = name.replace(" ", "_");
  const folder = await Folder.create({
    userVhost,
    name,
    path,
  });
  await createVhostS3(userVhost, path + name);
  return res.json(folder);
});

module.exports = (app) => app.use("/", router);
