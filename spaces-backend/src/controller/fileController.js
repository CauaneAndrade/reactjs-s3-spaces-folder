/*
endpoints de upload de arquivos no bucket
*/
const router = require("express").Router();
const multer = require("multer");
const User = require("../models/User");
const {
  createFileS3,
  createFolderS3,
  removeContentS3,
} = require("../utils/s3-connect");
const getUserContentFormat = require("../utils/chonky-data-format");

router.get("/content", async (req, res) => {
  const user = await User.findOne({ _id: req.user.id }).exec();
  var dic = await getUserContentFormat(user.vhost);
  return res.json(dic);
});

// upload de arquivo para o bucket
router.post("/content/file", multer().single("file"), async (req, res) => {
  const user = await User.findOne({ _id: req.user.id }).exec();
  const success = await createFileS3(user.vhost, req.file, req.body.path);
  return res.json({ success });
});

// upload de pastas para o bucket
router.post("/content/folder", async (req, res) => {
  const { path, name } = req.body;
  await createFolderS3(path, name);
  return res.json({ error: "test" });
});

router.delete("/content", async (req, res) => {
  // const user = await User.findOne({ _id: req.user.id }).exec();
  const { path, fileName } = req.body;
  const response = await removeContentS3(path, fileName);
  console.log(response)
  return res.json({ response });
});

module.exports = (app) => app.use("/user", router);
