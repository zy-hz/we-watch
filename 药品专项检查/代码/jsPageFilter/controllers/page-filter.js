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
    let words = loadWords(name)
    let webEnters = getWebWEnters(HTML_PAGE_DB)

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
                array = _.concat(array,subDir)
            }
            else {
                // 继续发现子目录
                array = _.concat(array,getWebWEnters(subDir))
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
    if(!fs.existsSync(dir_name)) return false

    // 获得目录下的所有文件
    let files = fs.readdirSync(dir_name)
    let htmlFiles = _.filter(files,(f)=>{
        return f.endsWith('.html')
    })

    // 只有一个html文件
    return htmlFiles.length === 1
}

module.exports = {
    'GET /page-filter/:name': fn_main,
    'GET /page-filter/': fn_main
}