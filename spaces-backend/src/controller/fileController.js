/*
endpoints de upload de arquivos no bucket
*/
require("dotenv").config();
const router = require("express").Router();
const multer = require("multer");
const File = require("../models/File");
const Folder = require("../models/Folder");
const User = require("../models/User");
const { createContentS3, getUserContentS3, createFileS3, createFolderS3 } = require("../create-file-s3");
const { getData, Test } = require("./util");
const aws = require("aws-sdk");
const crypto = require("crypto");
const s3 = new aws.S3();

router.get("/user/content", async (req, res) => {
    const loggedUser = await User.findOne({ _id: req.user.id }).exec();
    const userVhost = loggedUser.vhost;
    const data = await Test(userVhost)
    return res.json(data);
});

function getChildren(fileMap, list) {
    list.forEach((childName) => {
        let childrenList = []
        let aux = []
        for (const [key, value] of Object.entries(fileMap)) {
            if (value['parentId'] == childName) {
                console.log(value)
                childrenList.push(value['name'])
                aux.push(value['id'])
                for (const [key2, value2] of Object.entries(fileMap)) {
                    if (value2['name'] == value['parentId']) {
                        fileMap[value2['id']]['childrenIds'] = aux
                        fileMap[value2['id']]['childrenCount'] = aux.length
                    }
                }
            }
        }
        getChildren(fileMap, childrenList)
    })
    return fileMap
}

// Não armazenar local
// o app tem que bater no bucket, para listar tb
// se não tem muito custo para armazenar a info duplicada (bucket e no banco)
router.get("/user/abacate", async (req, res) => {
    const loggedUser = await User.findOne({ _id: req.user.id }).exec(); const userVhost = loggedUser.vhost;
    const params = {
        Bucket: process.env.BUCKET_NAME,
        Prefix: userVhost + "/",
    };
    const data = await s3.listObjects(params).promise();
    const contents = data['Contents']
    var dic = { rootFolderId: userVhost, fileMap: {} };
    /* formato que o chonky espera
    {
        rootFolderId: vhost_do_usuario,
        fileMap: {
            "abc-pasta1": {
                "id": "abc-pasta1",
                "name": "pasta1",
                "isDir": true,
                "childrenIds": [
                    "def-pasta1_1"
                ],
                "childrenCount": 1,
                "parentId": "975bfbccd5492dbab426234a0b6cc97d3cd2e246"
            },
            "def-pasta1_1": {
                "id": "def-pasta1_1",
                "name": "pasta1_1",
                "isDir": true,
                "childrenIds": [],
                "childrenCount": 0,
                "parentId": "pasta1"
            },
        }
    }
    */
    const fileMap = dic['fileMap']
    contents.shift() // removendo o primeiro elemento pois é a raiz
    contents.forEach((item) => {
        const key = item['Key']
        let listFolderName = key.split('/') // ['vhostName', 'Folder', '']
        const folderName = listFolderName[listFolderName.length - 2] // Folder
        const hash = crypto.randomBytes(16); const hashFolder = `${hash.toString("hex")}-${folderName}`
        const parentId = listFolderName[listFolderName.length - 3] || ''
        fileMap[hashFolder] = {
            'id': hashFolder,
            'name': folderName,
            "isDir": true,
            'childrenIds': [],
            "childrenCount": 0,
            'parentId': parentId
        }
    })
    let childrenList = []
    let aux = []
    for (const [key, value] of Object.entries(fileMap)) {
        if (value['parentId'] == userVhost) {
            childrenList.push(value['id'])
            aux.push(value['name'])
        }
    }
    let newfileMap = getChildren(fileMap, aux)
    newfileMap[userVhost] = {
        'id': userVhost,
        'name': 'raiz',
        "isDir": true,
        'childrenIds': childrenList,
        "childrenCount": childrenList.length
    }
    dic['fileMap'] = newfileMap
    return res.json(dic)
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
