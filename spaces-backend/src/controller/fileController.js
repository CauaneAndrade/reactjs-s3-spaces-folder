/*
endpoints de upload de arquivos no bucket
*/
const router = require("express").Router();
const multer = require("multer");
const File = require("../models/File");
const Folder = require("../models/Folder");
const User = require("../models/User");
const { createContentS3, getUserContentS3, createFileS3, createFolderS3 } = require("../create-file-s3");
const { getData, Test } = require("./util");

router.get("/user/content", async (req, res) => {
    const loggedUser = await User.findOne({ _id: req.user.id }).exec();
    const userVhost = loggedUser.vhost;
    const data = await Test(userVhost)
    return res.json(data);
});

router.get("/user/abacate", async (req, res) => {
    file1 = await File.create({ name: 'arquivo1', isDir: false })
    folder1_1 = await Folder.create({
        name: 'pasta1_1',
        isDir: true,
        filhos: []
    })
    
    folder1 = await Folder.create({
        name: 'pasta1',
        isDir: true,
        filhos: [folder1_1]
    })
    
    folder2 = await Folder.create({
        name: 'pasta2',
        isDir: true,
        filhos: []
    })
    
    vhost = await Folder({ name: '7f9b921d9ba0a8162bc6b0998d7dc05043da12a5', filhos: [], isDir: true })
    vhost.filhos.push(folder1, folder2, file1)
    vhost.save()
    // ----------------------------------------------------------------------------------------
    var dic = {
        "rootFolderId": vhost._id,
        "fileMap": {}
    }
    function getFilho(folder, parent) {
        dic['fileMap'][folder.id] = {
            "id": folder.id,
            "name": folder.name,
            "isDir": folder.isDir
        }
        dic['fileMap'][folder.id]["childrenIds"] = []
        folder.filhos.forEach(obj => {
            dic['fileMap'][folder.id]["childrenIds"].push(obj._id)
        })
        dic['fileMap'][folder.id]["childrenCount"] = folder.filhos.length
        if (parent) {
            dic['fileMap'][folder.id]["parentId"] = parent.id
        }
        folder.filhos.forEach(filho => {
            if (filho.isDir) {
                getFilho(filho, folder)
            } else {
                dic['fileMap'][filho._id] = {
                    "id": filho.id,
                    "name": folder.name,
                }
                if (folder) {
                    dic['fileMap'][filho._id]["parentId"] = folder.id
                }
            }
        })
        // ----------------------------------------------------------------------------------------
        return dic
    }
    
    const data = await getFilho(vhost, '')
    return res.json(data)
});

// upload de arquivo para o bucket
router.post("/user/content", multer().single("file"), async (req, res) => {
    // isDir, path, name -> folder
    // isDir, file, path -> file
    const isDir = req.body.isDir; const path = req.body.path
    const loggedUser = await User.findOne({ _id: req.user.id }).exec(); const userVhost = loggedUser.vhost;
    if (isDir === '0') {
        var dataFile = await createFolderS3(req.body.name, path || '', userVhost)
        return res.json(dataFile)
    } else if (isDir === '1'){
        var dataFile = await createFileS3(req.file, path, userVhost)
        return res.json(dataFile)
    } else {
        return res.json({error: "invalid value"})
    }
});

router.delete("/user/files/:id", async (req, res) => {
    // tem um hook que define se será deletado localmente ou no s3
    const post = await File.findById(req.params.id);
    await post.remove();
    return res.send();
});

module.exports = (app) => app.use("/", router);
