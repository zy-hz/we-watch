const fs = require('fs')
const path = require('path')
const _ = require('lodash')
const WZVisitor = require('../libs/webzip-visitor')

const WORD_LIB_FILE = 'd:/Works/大嘴鸟/we-watch/药品专项检查/样本/处方药清单_20190829.txt'
const HTML_PAGE_DB = 'd:/Works/大嘴鸟/we-watch/药品专项检查/data'
//const HTML_PAGE_DB = 'd:/Works/大嘴鸟/we-watch/药品专项检查/样本/pagedb'

// webzip目录的访问器
const wzVisitor = new WZVisitor(HTML_PAGE_DB)

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
    let webSites = wzVisitor.getAllWebSites()

    // 检查比配关键词的网站
    let ary = _.map(webSites, (site) => {
        let webInfo = wzVisitor.getWebSiteInfo(site)
        let pageInfo = getMatchHtmlPages(site, words, webInfo)

        // 如果没有发现匹配的页面，就不输出
        if (!_.isNil(pageInfo) && !_.isEmpty(pageInfo))
            return buildMathWebInfo(webInfo, pageInfo)
    })

    return _.filter(ary, (x) => { return !_.isNil(x) })
}

// 构建匹配的网站信息
function buildMathWebInfo(web_info, page_info) {
    // 数组去重
    page_info = page_info || []
    return {
        companyName: web_info.companyName,
        rootUrl: web_info.rootUrl,
        matchPageCount: page_info.length,
        matchPages: page_info
    }
}

// 获得匹配的页面
function getMatchHtmlPages(web_dir, words, web_info) {

    let pages = wzVisitor.forEachPage(web_dir, (x) => {

        // 获得匹配的关键词
        let matchWords = getMatchKeywords(x.pageContent, words)
        // 去掉重复的关键词
        matchWords = _.uniq(matchWords || [])

        // 构建匹配的页面
        if (!_.isEmpty(matchWords)) return buildMatchPageInfo(web_info, matchWords, x.pageFileName)
    })

    return pages
}

// 构建匹配的页面信息
function buildMatchPageInfo(web_info, match_words, file_url) {
    let pageUrl = _.replace(file_url, web_info.siteDir, web_info.rootUrl)
    // 去中文字符
    pageUrl = pageUrl.replace(/[^\x00-\xff]/mg, "")
    let urlMap = _.find(web_info.renameUrls, (x) => {
        x = x || {}
        let tag = x.tag || ''
        tag = tag.replace(/[^\x00-\xff]./mg, "")

        return tag === pageUrl
    })

    if (!_.isUndefined(urlMap))
        pageUrl = urlMap.src

    return {
        pageUrl,
        matchWords: _.join(match_words)
    }
}

// 从文件中检查是否匹配的关键词
function getMatchKeywords(page, words) {

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



module.exports = {
    'GET /page-filter/:name': fn_main,
    'GET /page-filter/': fn_main
}