const expect = require('chai').expect

const lib = require("rewire")('../controllers/page-filter')
const beginFilter = lib.__get__('beginFilter')
const isWebEnterDir = lib.__get__('isWebEnterDir')
const isWebEnterDir4WebZip = lib.__get__('isWebEnterDir4WebZip')

// webzip的样本目录
const SAMPLE_WEBZIP_DIR = 'd:/Works/大嘴鸟/we-watch/药品专项检查/样本/pagedb/mednova/www.mednova.com.cn'

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


    it('筛选器入口统一测试',async ()=>{
        beginFilter()
    })

})
