const routes = require("express").Router();
const multer = require("multer");
const multerConfig = require("./config/multer");  // habilita upload de arquivos

const Post = require("./models/Post");

routes.get("/posts", async (req, res) => {  // todos os arquivos
  const posts = await Post.find();
  return res.json(posts);
});

routes.post("/posts", multer(multerConfig).single("file"), async (req, res) => {
  // um arquivo por vez, tem a opção array para poder salvar mais, porém
  // ... perdemos o controle de progresso, pelo que entendi na doc
  const { originalname: name, size, key, location: url = "" } = req.file;  // reestruturação
  const post = await Post.create({
    name,
    size,
    key,
    url,
  });
  return res.json(post);
});

routes.delete("/posts/:id", async (req, res) => {  // tem um hook que define se será deletado localmente ou no s3
  const post = await Post.findById(req.params.id);
  await post.remove();
  return res.send();
});

module.exports = routes;