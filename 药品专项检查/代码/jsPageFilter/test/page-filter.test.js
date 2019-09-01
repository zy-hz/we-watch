const expect = require('chai').expect

const lib = require("rewire")('../controllers/page-filter')
const beginFilter = lib.__get__('beginFilter')
const isWebEnterDir = lib.__get__('isWebEnterDir')
const isWebEnterDir4WebZip = lib.__get__('isWebEnterDir4WebZip')
const getWebWEnters = lib.__get__('getWebWEnters')

const getMatchInfoFromPage = lib.__get__('getMatchInfoFromPage')

// webzip的样本目录
const SAMPLE_WEBZIP_DIR = 'd:/Works/大嘴鸟/we-watch/药品专项检查/样本/pagedb/mednova/www.mednova.com.cn'

// 样本页面数据目录
const SAMPLE_PAGE_DB = 'd:/Works/大嘴鸟/we-watch/药品专项检查/样本/pagedb'

describe('页面筛选器单元测试', function () {

    it('mocha测试', (done) => {
        expect(1).to.equal(1)
        done()
    })

    it('isWebEnterDir4WebZip',(done)=>{

        expect(isWebEnterDir4WebZip('d:/aaa/bbb','不存在的目录 d:/aaa/bbb')).to.be.false       
        expect(isWebEnterDir4WebZip(SAMPLE_WEBZIP_DIR),`${SAMPLE_WEBZIP_DIR} 是网站入口`).to.be.true

        done()
    })

    it('getWebWEnters',(done)=>{
        let ary = getWebWEnters(SAMPLE_PAGE_DB)
        expect(ary.length).to.equal(1)
        expect(ary[0]).to.equal(SAMPLE_WEBZIP_DIR)

        done()
    })


    it('筛选器入口统一测试',async ()=>{
        beginFilter()
    })

})

describe('页面匹配测试',function(){
    it('getMatchInfoFromPage',(done)=>{
        let page = '这是一个测试的内容'
        let words = ['aa']
        expect(getMatchInfoFromPage(page,words),'没有匹配').is.null

        words = ['一个','内容']
        expect(getMatchInfoFromPage(page,words),'匹配成功').to.equal('一个,内容')

        done()
    })
})