const router = require('koa-router')()
const { addDB, queryDB, delDB, initDB} = require('../utils/mysql');
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
  if(warranty >= 1){
    newDate = date.add(warranty, 'month');
  }else{
    newDate = date.add(convertToInteger(warranty), 'day');
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
  console.log(Date.now(),Math.floor((dayjs().valueOf()) / 1000))
  result.data.forEach(element => {
    const remainingSeconds = element.endDate - Math.floor((dayjs().valueOf()) / 1000);
    // 将剩余秒数转换为剩余天数
    const remainingDays = Math.ceil(remainingSeconds / (60 * 60 * 24));
    element.createDateTxt = dayjs.unix(element.createDate).format('YYYY-MM-DD');
    element.endDateTxt = dayjs.unix(element.endDate).format('YYYY-MM-DD');
    element.distance = remainingDays;
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
    const remainingSeconds = element.endDate - Math.floor((dayjs().valueOf()) / 1000);
    // 将剩余秒数转换为剩余天数
    const remainingDays = Math.ceil(remainingSeconds / (60 * 60 * 24));
    element.createDateTxt = dayjs.unix(element.createDate).format('YYYY-MM-DD');
    element.endDateTxt = dayjs.unix(element.endDate).format('YYYY-MM-DD');
    element.distance = remainingDays;
  });
  // 过滤出 createDate 和 endDate 两个字段小于二十天的数据
  const filteredCommodities = listData.filter(commodity => {
    const daysBetweenCreateAndEnd = daysBetweenDates(commodity.createDate, commodity.endDate);
    return daysBetweenCreateAndEnd < 20;
  });
  filteredCommodities.sort((a, b) => a.distance - b.distance);

  
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

/**查询商品接口*/
router.get("/queryFill",async (ctx,next)=>{
  const {name} = ctx.query;
  if(name !== "000"){
    const result = await queryDB(`SELECT * FROM commodity WHERE commodityName LIKE '%${name}%'`)
    result.data.forEach(element => {
      const remainingSeconds = element.endDate - Math.floor((dayjs().valueOf()) / 1000);
      // 将剩余秒数转换为剩余天数
      const remainingDays = Math.ceil(remainingSeconds / (60 * 60 * 24));
      element.createDateTxt = dayjs.unix(element.createDate).format('YYYY-MM-DD');
      element.endDateTxt = dayjs.unix(element.endDate).format('YYYY-MM-DD');
      element.distance = remainingDays;
    });
    ctx.body = {
      code:101,
      message:"请求成功",
      data:(result.data).reverse()
    }
  }else{
    const result = await queryDB(`SELECT * FROM commodity WHERE createDate < 0 OR endDate < 0`)
    result.data.forEach(element => {
      const remainingSeconds = element.endDate - Math.floor((dayjs().valueOf()) / 1000);
      // 将剩余秒数转换为剩余天数
      const remainingDays = Math.ceil(remainingSeconds / (60 * 60 * 24));
      element.createDateTxt = dayjs.unix(element.createDate).format('YYYY-MM-DD');
      element.endDateTxt = dayjs.unix(element.endDate).format('YYYY-MM-DD');
      element.distance = remainingDays;
    });
    ctx.body = {
      code:101,
      message:"请求成功",
      data:(result.data).reverse()
    }
  }
  
}) 


/**数据库去重 */
router.get("/initDB",async (ctx,next)=>{
  const result = await initDB(`DELETE t1 FROM commodity t1
  INNER JOIN commodity t2 
  WHERE t1.id > t2.id 
  AND t1.commodityName = t2.commodityName 
  AND t1.createDate = t2.createDate;`)
  ctx.body = {
    code:101,
    data:result
  }
})

// 计算两个时间戳之间的天数差
function daysBetweenDates(timestamp1, timestamp2) {
  const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
  // const firstDate = new Date(timestamp1 * 1000); // 将秒数转换为毫秒
  const firstDate = Date.now(); // 将秒数转换为毫秒
  const secondDate = new Date(timestamp2 * 1000); // 将秒数转换为毫秒

  return Math.round(Math.abs((firstDate - secondDate) / oneDay));
}

// 小鼠取整数
function convertToInteger(num) {
  // 将小数转换为字符串
  var numStr = num.toString();
  
  // 删除小数点后的零
  numStr = numStr.replace('.', '');
  
  // 将结果转换回数字
  var result = parseInt(numStr);
  
  return result;
}




module.exports = router
