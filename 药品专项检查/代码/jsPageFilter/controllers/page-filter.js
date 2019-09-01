const fs = require('fs')
const path = require('path')
const _ = require('lodash')

const WORD_LIB_FILE = 'd:/Works/大嘴鸟/we-watch/药品专项检查/样本/处方药清单_20190829.txt'
const HTML_PAGE_DB = 'd:/Works/大嘴鸟/we-watch/药品专项检查/样本/pagedb'

var fn_main = async (ctx, next) => {
    let name = ctx.params.name || ''
    let result = beginFilter(name)

    ctx.response.body = result
}

// 开始筛选
function beginFilter(name = '') {
    // 载入词库
    let words = loadWords(name)
    // 获得本地web网站的数据库入口
    let webEnters = getWebWEnters(HTML_PAGE_DB)

    // 检查比配关键词的网站
    let ary = _.map(webEnters, (webDir) => {
        let webInfo = getWebInfo(webDir)
        let matchInfo = getMatchHtmlPages(webDir, words, webInfo)
        if (matchInfo.length > 0) return matchInfo
    })

    return ary
}

// 获得web的信息
function getWebInfo(web_dir) {
    let webRoot = path.basename(web_dir)
    return { webRoot, webUrl: web_dir }
}

// 获得匹配的页面
function getMatchHtmlPages(web_dir, words, web_info) {
    let pages = []

    let files = fs.readdirSync(web_dir)
    _.forEach(files, (f) => {

        let fileName = `${web_dir}/${f}`

        // 如果是目录，递归找目录下的文件
        if (fs.statSync(fileName).isDirectory()) {
            pages = _.concat(pages, getMatchHtmlPages(fileName, words, web_info))
        }
        else if (f.endsWith('.html')) {
            // 如果是html文件，就匹配文件
            let htmlPage = fs.readFileSync(fileName, 'utf-8')
            // 获得匹配的关键词
            let matchWords = getMatchKeywords(htmlPage, words)
            if (matchWords.length > 0) {
                pages = _.concat(pages, buildMatchPageInfo(web_info, matchWords, fileName))
            }

        }

    })

    return pages
}

// 构建匹配的页面信息
function buildMatchPageInfo(web_info, match_words, file_url) {
    let pageUrl = _.replace(file_url, web_info.webUrl, web_info.webRoot)
    return {
        webRoot: web_info.webRoot,
        pageUrl,
        matchWords: _.join(match_words)
    }
}

// 从文件中检查是否匹配的关键词
function getMatchKeywords(page, words) {

    words = _.concat(words, '数字X光机')

    let matchWords = _.filter(words, (w) => {
        return page.indexOf(w) >= 0
    })

    return matchWords
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