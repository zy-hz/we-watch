const fs = require('fs')
const path = require('path')
const _ = require('lodash')

// webzip格式的网站入口
function isWebZipDir(dir_name) {
    // 目录必须存在
    if (!fs.existsSync(dir_name)) return false

    let baseName = path.basename(dir_name)
    return /.*?\..*?/m.test(baseName)
}

// 获得web的入口集合
function findWebs(root_dir) {
    let array = []

    // 获得根目录下的所有目录
    let files = fs.readdirSync(root_dir);
    let dirs = files.filter((f) => {
        let subDir = `${root_dir}/${f}`
        // 如果不是目录，继续比对下一个
        if (fs.statSync(subDir).isDirectory()) {
            // 是否为web入口的目录
            if (isWebZipDir(subDir)) {
                array = _.concat(array, subDir)
            }
            else {
                // 继续发现子目录
                array = _.concat(array, findWebs(subDir))
            }
        }
    })

    return array
}

module.exports = class WebZipVisitor {
    constructor(root_dir) {
        this.rootDir = root_dir
    }

    // 获得所有的web站点
    getAllWebSites(){
        return findWebs(this.rootDir)
    }
} 

