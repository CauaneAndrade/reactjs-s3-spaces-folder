const { getContentsS3 } = require("../utils/s3-connect");

function getChildren(fileMap, initialNameList) {  // [ '0d77e6da63f51d627c1ca9dfe7f886c0b2b35c99/pasta1/' ]
  console.log(fileMap)
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
    if (nameList.length) {
      getChildren(fileMap, nameList);
    }
  });
  return fileMap;
}

async function getUserContentFormat(userVhost) {
  const contents = await getContentsS3(userVhost);

  const vhost = userVhost + '/'
  var dic = { rootFolderId: vhost, fileMap: {} };
  const fileMap = dic["fileMap"];
  // contents.shift();
  contents.forEach((item) => {
    const itemKey = item["Key"]
    var listFolderName = itemKey.split("/");  // [ '0d77e6da63f51d627c1ca9dfe7f886c0b2b35c99', 'pasta1', '' ]
    const folderLength = listFolderName.length;  // 3
    const lastElement = folderLength - 1 // 2
    if (listFolderName[lastElement] !== "") {
      // se for arquivo e não pasta
      var objectPosition = lastElement, isDir = false;
      var name = listFolderName.pop();
    } else {
      listFolderName.pop();  var name = listFolderName.pop()
      var objectPosition = folderLength - 2; // 1
      var isDir = true;
    }

    // elemento raiz, a pasta máxima do usuário
    const test = listFolderName[objectPosition]  // 1
    
    const parentId = listFolderName.join('/')
    fileMap[itemKey] = {
      id: itemKey,
      name: name,
      isDir: isDir,
      childrenIds: [],
      childrenCount: 0,
      parentId: parentId + '/',
    };
    if (!isDir) {
      fileMap[itemKey]['thumbnailUrl'] = `${process.env.BUCKET_NAME}.${process.env.BUCKET_URL}${itemKey}`
    }
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
