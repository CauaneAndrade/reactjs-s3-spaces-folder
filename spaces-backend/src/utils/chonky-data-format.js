const { getContentsS3 } = require("../utils/s3-connect");

function getChildren(fileMap, initialNameList) {
  let nameList = [];
  initialNameList.forEach((childId) => {  // pasta1
    for (const [_, value] of Object.entries(fileMap)) {
      const parent = value["parentId"];
      if (parent == childId) {
        nameList.push(value["id"]);
        for (const [_, anotherValue] of Object.entries(fileMap)) {
          if (anotherValue["id"] == parent) {
            const parentId = anotherValue["id"];
            const data = fileMap[parentId];
            data["childrenIds"] = nameList;
            data["childrenCount"] = nameList.length;
          }
        }
      }
    }
    getChildren(fileMap, nameList);
  });
  return fileMap;
}

async function getUserContentFormat(userVhost) {
  const contents = await getContentsS3(userVhost);
  
  const vhost = userVhost + '/'
  var dic = { rootFolderId: vhost, fileMap: {} };
  const fileMap = dic["fileMap"];

  contents.forEach((item) => {
    var listFolderName = item["Key"].split("/");

    const folderLength = listFolderName.length;
    const lastElement = folderLength - 1
    var objectPosition = folderLength - 2, isDir = true;
    if (listFolderName[lastElement] !== "") {
      // se for arquivo e não pasta
      var objectPosition = lastElement, isDir = false;
    }

    // elemento raiz, a pasta máxima do usuário
    const objName = listFolderName[objectPosition];
    if (listFolderName[lastElement] === '') {  // if is a folder
      listFolderName.pop()
      listFolderName.pop()
    } else {
      listFolderName.pop()
    }
    const parentId = listFolderName.join('/')
      fileMap[item["Key"]] = {
      id: item["Key"],
      name: objName,
      isDir: isDir,
      childrenIds: [],
      childrenCount: 0,
      parentId: parentId + '/',
      // thumbnailUrl: 'https://i.imgur.com/gzmHg7n.jpg'
    };
  });

  let childrenList = [];
  for (const [key, value] of Object.entries(fileMap)) {
    if (value["parentId"] == vhost) {
      childrenList.push(value["id"]);
    }
  }
  let newfileMap = await getChildren(fileMap, childrenList);
  newfileMap[vhost] = {
    id: vhost,
    name: "/",
    isDir: true,
    childrenIds: childrenList,
    childrenCount: childrenList.length,
  };
  dic["fileMap"] = newfileMap;
  return dic
}

module.exports = getUserContentFormat;
