const router = require('koa-router')()
const { addDB, queryDB } = require('../utils/mysql');

router.get('/add', async (ctx, next) => {
  await ctx.render('index', {
    title: 'Hello Koa 2!'
  })
})


module.exports = router
