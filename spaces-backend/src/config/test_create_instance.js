import File from '../models/File'
import Folder from '../models/Folder'

file1 = File.create({ name: 'arquivo1', isDir: false })
folder1_1 = Folder.create({
    name: 'pasta1_1',
    isDir: true,
    filhos: []
})

folder1 = Folder.create({
    name: 'pasta1',
    isDir: true,
    filhos: [folder1_1]
})

folder2 = Folder.create({
    name: 'pasta2',
    isDir: true,
    filhos: []
})

vhost = Folder({ name: '7f9b921d9ba0a8162bc6b0998d7dc05043da12a5', filhos: [], isDir: true, })
vhost.filhos.push(folder1, folder2, file1)
vhost.save()

// ----------------------------------------------------------

var dic = {
    "rootFolderId": vhost.name,
    "fileMap": {}
}
function getFilho(folder, parent) {
    dic['fileMap'][folder.name] = {
        "id": folder.id,
        "name": folder.name,
        "isDir": folder.isDir
    }
    if (folder.filhos) {
        dic['fileMap'][folder.name]["childrenIds"] = folder.filhos
        dic['fileMap'][folder.name]["childrenCount"] = folder.filhos.length
    }
    if (parent) {
        dic['fileMap'][folder.name]["parentId"] = parent.id
    }
    folder.filhos.forEach(filho => {
        if (filho.isDir) {
            getFilho(filho, folder)
        } else {
            dic['fileMap'][filho.name] = {
                "id": filho.id,
                "name": folder.name,
            }
            if (folder) {
                dic['fileMap'][filho.name]["parentId"] = folder.id
            }
        }
    })
    return dic
}

// const data = getFilho(vhost, '')
// console.log(data)
export default getFilho