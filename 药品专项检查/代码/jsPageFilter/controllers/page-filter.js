const fs = require('fs')
const path = require('path')
const _ = require('lodash')

const WORD_LIB_FILE = 'd:/Works/大嘴鸟/we-watch/药品专项检查/样本/处方药清单_20190829.txt'
const HTML_PAGE_DB = 'd:/Works/大嘴鸟/we-watch/药品专项检查/样本/pagedb'

var fn_main = async (ctx, next) => {
    let name = ctx.params.name || ''
    beginFilter(name)

    ctx.response.body = `<h1>page-filter, ${name}!</h1>`
}

// 开始筛选
function beginFilter(name = '') {
    // 载入词库
    let words = loadWords(name)
    // 获得本地web网站的数据库入口
    let webEnters = getWebWEnters(HTML_PAGE_DB)

    // 检查比配关键词的网站
    let ary = _.map(webEnters, (webDir) => {
        let matchInfo = getMatchHtmlPages(webDir, words)
        if (matchInfo.length > 0) return matchInfo
    })

    console.log(ary)
    return ary
}

// 获得匹配的页面
function getMatchHtmlPages(webDir, words) {
    let pages = []

    let files = fs.readdirSync(webDir)
    _.forEach(files, (f) => {

        let fileName = `${webDir}/${f}`

        // 如果是目录，递归找目录下的文件
        if (fs.statSync(fileName).isDirectory()) {
            pages = _.concat(pages, getMatchHtmlPages(fileName, words))
        }
        else if (f.endsWith('.html')) {
            // 如果是html文件，就匹配文件
            let htmlPage = fs.readFileSync(fileName, 'utf-8')
            let info = getMatchInfoFromPage(htmlPage, words)
            if (info != null) pages = _.concat(pages, info)
        }

    })

    return pages
}

// 从文件中检查是否匹配的关键词
function getMatchInfoFromPage(page, words) {
    
    words = _.concat(words,'数字X光机')

    let matchWords = _.filter(words, (w) => {
        return page.indexOf(w) >= 0
    })

    if(matchWords.length === 0) return null

    // 合成匹配的信息
    return _.join(matchWords)
}

// 载入词表
function loadWords(word_list) {
    return word_list === '' ? loadWordLib() : word_list.split(',')
}

// 载入词库
function loadWordLib() {
    try {
        var data = fs.readFileSync(WORD_LIB_FILE, 'utf-8')
        return data.split('\r\n')
    } catch (e) {
        console.log(e)
        return []
    }
}

// 获得web的入口集合
function getWebWEnters(root_dir) {
    let array = []

    // 获得根目录下的所有目录
    let files = fs.readdirSync(root_dir);
    let dirs = files.filter((f) => {
        let subDir = `${root_dir}/${f}`
        // 如果不是目录，继续比对下一个
        if (fs.statSync(subDir).isDirectory()) {
            // 是否为web入口的目录
            if (isWebEnterDir(subDir)) {
                array = _.concat(array, subDir)
            }
            else {
                // 继续发现子目录
                array = _.concat(array, getWebWEnters(subDir))
            }
        }
    })

    return array
}

// 是否为web入口的目录
function isWebEnterDir(dir_name) {
    return isWebEnterDir4WebZip(dir_name)
}

// webzip格式的网站入口
function isWebEnterDir4WebZip(dir_name) {
    // 目录必须存在
    if (!fs.existsSync(dir_name)) return false

    // 获得目录下的所有文件
    let files = fs.readdirSync(dir_name)
    let htmlFiles = _.filter(files, (f) => {
        return f.endsWith('.html')
    })

    // 只有一个html文件
    return htmlFiles.length === 1
}

module.exports = {
    'GET /page-filter/:name': fn_main,
    'GET /page-filter/': fn_main
}