const expect = require('chai').expect

const lib = require("rewire")('../index.js')
const isWebZipDir = lib.__get__('isWebZipDir')
const findWebs = lib.__get__('findWebs')
const getRenameUrlMap = lib.__get__('getRenameUrlMap')

// webzip的样本目录
const SAMPLE_WEBZIP_DIR = 'd:/Works/大嘴鸟/we-watch/药品专项检查/样本/pagedb/mednova/www.mednova.com.cn'

// 样本页面数据目录
const SAMPLE_PAGE_DB = 'd:/Works/大嘴鸟/we-watch/药品专项检查/样本/pagedb'

const WZVisitor = require('../index.js')
const wzVisitor = new  WZVisitor(SAMPLE_PAGE_DB)

describe('webzip访问器单元测试', function () {

    it('isWebZipDir', (done) => {

        expect(isWebZipDir('d:/aaa/bbb', '不存在的目录 d:/aaa/bbb')).to.be.false
        expect(isWebZipDir(SAMPLE_WEBZIP_DIR), `${SAMPLE_WEBZIP_DIR} 是网站入口`).to.be.true

        done()
    })

    it('findWebs', (done) => {
        let ary = findWebs(SAMPLE_PAGE_DB)
        //expect(ary.length).to.equal(2)
        //expect(ary[1]).to.equal(SAMPLE_WEBZIP_DIR)

        done()
    })

    it('getRenameUrlMap',(done)=>{
        let urlMap = getRenameUrlMap('http://www.dxycare.com/page/15	15.html')
        expect(urlMap).to.deep.equal({src:'www.dxycare.com/page/15',tag:'www.dxycare.com/page/15.html'})

        urlMap = getRenameUrlMap('http://www.hljkkj.com/Birth/Detail?type=Jkzx_a&id=325	Detail¿type=Jkzx_a&id=325.html')
        expect(urlMap).to.deep.equal({src:'www.hljkkj.com/Birth/Detail?type=Jkzx_a&id=325',tag:'www.hljkkj.com/Birth/Detail¿type=Jkzx_a&id=325.html'})

        done()
    })

})

describe('webzip类测试',function(){
    it('getWebSiteInfo',(done)=>{
        let info = wzVisitor.getWebSiteInfo(SAMPLE_WEBZIP_DIR)

        done()
    })

    it('forEachPage',(done)=>{
        wzVisitor.forEachPage(SAMPLE_WEBZIP_DIR,(x)=>{
 
        })
        done()
    })


})
