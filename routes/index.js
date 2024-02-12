const router = require('koa-router')()
const { addDB, queryDB, delDB} = require('../utils/mysql');
const dayjs = require("dayjs")
/**添加商品 */
router.get('/add', async (ctx, next) => {
  console.log(ctx.query)
  const {tradeName,createDate,warranty} = ctx.query;
  /**生产日期时间戳转换 */
  const createDateTimestamp = dayjs(createDate).unix();
  /**截止日期时间戳转换 */
  const date = dayjs.unix(createDateTimestamp);
  let newDate;
  if(warranty > 1){
    newDate = date.add(warranty, 'month');
  }else{
    newDate = date.add(warranty*100, 'day');
  }
  
  const endDateTimestamp =  newDate.unix();

  const result =  await addDB(
    'INSERT INTO `commodity`(`month`,`commodityName`,`createDate`, `endDate`,`status`) VALUES (?,?,?,?,?)',
    [warranty,tradeName,createDateTimestamp,endDateTimestamp,0]
  )
  if(result.code === 101){
    ctx.body = {
      code:101,
      message:"请求成功"
    }
  }else{
    ctx.body = {
      code:102,
      message:"请求失败"
    }
  }
})

/**查询全部 */
router.get('/query', async (ctx, next) =>{
  const result = await queryDB('SELECT * FROM commodity')
  result.data.forEach(element => {
    element.createDateTxt = dayjs.unix(element.createDate).format('YYYY-MM-DD');
    element.endDateTxt = dayjs.unix(element.endDate).format('YYYY-MM-DD');
  });
  if(result.code === 101){
    ctx.body = {
      code:101,
      message:"请求成功",
      data:(result.data).reverse()
    }
  }else{
    ctx.body = {
      code:102,
      message:"请求失败"
    }
  }
})

/**警告商品 */
router.get("/err",async (ctx,next)=>{
  const result = await queryDB('SELECT * FROM commodity')
  if(!result.data.length){
    ctx.body = {
      code:102,
      data:[],
      message:"当前列表为空"
    }
  }
  const listData = result.data;
  result.data.forEach(element => {
    element.createDateTxt = dayjs.unix(element.createDate).format('YYYY-MM-DD');
    element.endDateTxt = dayjs.unix(element.endDate).format('YYYY-MM-DD');
  });
  // 过滤出 createDate 和 endDate 两个字段小于二十天的数据
  const filteredCommodities = listData.filter(commodity => {
    const daysBetweenCreateAndEnd = daysBetweenDates(commodity.createDate, commodity.endDate);
    return daysBetweenCreateAndEnd < 20;
  });
  
  ctx.body = {
    code:101,
    message:"请求成功",
    data:filteredCommodities
  }
})

/**删除商品 */
router.get("/del",async (ctx,next)=>{
  const {id} = ctx.query;
  console.log(id)  
  const result = await delDB('DELETE FROM commodity WHERE id = ?',[id])
  console.log(result)
  ctx.body = {
    code:101,
    message:"删除成功"
  }
})



// 计算两个时间戳之间的天数差
function daysBetweenDates(timestamp1, timestamp2) {
  const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
  const firstDate = new Date(timestamp1 * 1000); // 将秒数转换为毫秒
  const secondDate = new Date(timestamp2 * 1000); // 将秒数转换为毫秒

  return Math.round(Math.abs((firstDate - secondDate) / oneDay));
}



module.exports = router
