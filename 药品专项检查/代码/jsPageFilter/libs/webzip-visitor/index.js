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

// 格式化来源url
function formatSourceUrl(src, tag) {
    // 去http头
    src = src.replace(/^.*?\/\//mg, "")

    // 以/结尾的是目录
    if (src.endsWith('/')) return { src, tag: src + tag }

    // 找到最后的文件名
    let idx = _.lastIndexOf(src, '/')
    if (idx < 0) return src
    let lastPm = src.slice(idx + 1)

    if (tag.indexOf(lastPm) == 0) {
        // 目标和最后一个参数相同
        return { src, tag: src + '/' + tag }
    }
    else {
        // todo::处理api的访问
        // api.php?op=count&id=65&modelid=1
        return { src, tag }
    }
}

// 获得url的影射
function getRenameUrlMap(line) {
    let gp = _.split(line, '\t')
    if (gp.length != 2) return null

    return formatSourceUrl(gp[0], gp[1])
}

// 获得站点的重命名列表
function getRenameUrls(site_dir) {
    let renameListFileName = `${site_dir}/../renamelist.txt`
    if (!fs.existsSync(renameListFileName)) return []

    let content = fs.readFileSync(renameListFileName, 'utf-8')
    let lines = _.split(content, '\r\n')

    return _.map(lines, (x) => {
        let urlMap = getRenameUrlMap(x)
        if (urlMap != null) return urlMap
    })
}

module.exports = class WebZipVisitor {
    constructor(root_dir) {
        this.rootDir = root_dir
    }

    // 获得所有的web站点
    getAllWebSites() {
        return findWebs(this.rootDir)
    }

    // 获得web的信息
    getWebSiteInfo(site_dir) {
        let rootUrl = path.basename(site_dir)
        let renameUrls = getRenameUrls(site_dir)
        return { rootUrl, siteDir: site_dir, renameUrls }
    }

    // 循环过滤每一个页面
    forEachPage(web_dir, fn) {
        let pages = []

        let files = fs.readdirSync(web_dir)
        _.forEach(files, (f) => {

            let fileName = `${web_dir}/${f}`

            // 如果是目录，递归找目录下的文件
            if (fs.statSync(fileName).isDirectory()) {
                pages = _.concat(pages, this.forEachPage(fileName, fn))
            }
            else if (f.endsWith('.html')) {
                // 如果是html文件，就匹配文件
                let htmlPage = fs.readFileSync(fileName, 'utf-8')

                // 
                let result = fn({
                    rootDir: this.rootDir,
                    pageDir: web_dir,
                    pageFileName: fileName,
                    pageContent: htmlPage
                })
                if (result != null) pages = _.concat(pages, result)

            }

        })

        return pages
    }
}

