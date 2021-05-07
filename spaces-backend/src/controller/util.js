const { getUserContentS3 } = require("../create-file-s3");

function getData(path, data, userVhost) {
  const list = [];
  if (data) {
    for (let index = 0; index < data.CommonPrefixes.length; index++) {
      const itemName = data.CommonPrefixes[index].Prefix.replace(
        `${userVhost}/`,
        ""
        );
        list.push({
          key: index,
          itemName: itemName,
          itemType: "folder",
          itemUrl: "",
        });
      }
      for (let count = 1; count < data.Contents.length; count++) {
        const itemName = data.Contents[count].Key.replace(`${userVhost}/`, "");
        list.push({
          key: "keyId",
          itemName: itemName,
          itemType: "file",
          itemUrl: "",
        });
      }
    }
    return list;
  }
  
  const File = require("../models/File");
  async function Test(vhost) {
    const files = await File.find({ vhost: vhost }).exec();
    let filesx = [];
    const alo = `${vhost}`
    let dic = {
      "rootFolderId": vhost,
      "fileMap": {}
    }
    dic["fileMap"][vhost] = {"id": vhost, "name": "/", "isDir": true, "childrenIds": [], "childrenCount": 0}
    files.forEach((element) => {
      if (element.path === vhost) {
        filesx.push(element.key)
      }
    });
    dic['fileMap'][vhost]['childrenIds'] = filesx
    dic['fileMap'][vhost]['childrenCount'] = filesx.length
    let listChildren = []
    
    files.forEach((element) => {
      filesx.forEach((obj) => {
        var l = element.path.split('/')
        if (l[l.length - 1] === obj) {
          dic['fileMap'][obj] = {
            "id": obj, "name": 'test', "isDir": element.isDir, "parentId": vhost, "childrenIds": listChildren,
          }
        }
      });
    });
    return files;
  }
  
  module.exports = { getData, Test };
  