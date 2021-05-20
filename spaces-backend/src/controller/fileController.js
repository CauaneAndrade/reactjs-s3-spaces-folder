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
  renameItemS3
} = require("../utils/s3-connect");
const getUserContentFormat = require("../utils/chonky-data-format");

router.get("/content", async (req, res) => {
  const user = await User.findOne({ _id: req.user.id }).exec();
  var data = await getUserContentFormat(user.vhost);
  return res.json(data);
});

// upload de arquivo para o bucket
router.post("/content/file", multer().single("file"), async (req, res) => {
  const user = await User.findOne({ _id: req.user.id }).exec();
  const data = await createFileS3(user.vhost, req.file, req.body.path);
  return res.json({ data });
});

// upload de pastas para o bucket
router.post("/content/folder", async (req, res) => {
  const { path, name } = req.body;
  const response = await createFolderS3(path, name, true);
  return res.json(response);
});

// deletar arquivo/pasta
router.delete("/content", async (req, res) => {
  const { path, fileName } = req.body;
  const data = await removeContentS3(path, fileName);
  return res.json({ data });
});

// alterar nome do arquivo ou pasta
router.post("/content/update", async (req, res) => {
  const { path, newName } = req.body;
  const response = await renameItemS3(path, newName);
  return res.json({});
});

module.exports = (app) => app.use("/user", router);
