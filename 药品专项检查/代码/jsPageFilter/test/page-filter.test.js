const expect = require('chai').expect

const lib = require("rewire")('../controllers/page-filter')
const beginFilter = lib.__get__('beginFilter')
const getMatchKeywords = lib.__get__('getMatchKeywords')



describe('页面筛选器单元测试', function () {

    it('筛选器入口统一测试', async () => {
        beginFilter()
    })

})

describe('页面匹配测试', function () {
    it('getMatchKeywords', (done) => {
        let page = '这是一个测试的内容'
        let words = ['aa']
        expect(getMatchKeywords(page, words), '没有匹配').is.empty

        words = ['一个', '内容']
        expect(getMatchKeywords(page, words), '匹配成功').to.deep.equal(words)

        done()
    })
})