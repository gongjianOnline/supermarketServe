/*导入模块*/
const mysql = require('mysql2');

/*创建一个数据库连接*/
const db = mysql.createPool({
  host: '', /* 地址*/
  port: "3306", /* 端口号*/
  user: 'root', /* 用户名*/
  password: "", /* 密码*/
  database: '' /*数据库名称*/
});

/*连接状态监听器*/
db.getConnection((err, connection) => {
  if(err) {
    console.log("连接失败")
    console.log(err);
  }else{
    console.log("连接成功")
  }
})

/*查询数据*/
/*SHOW * FROM users;*/
const queryDB = (sql)=>{
  return new Promise((resolve,reject)=>{
    db.query(
      sql,
      function(err, data) {
        if(err){
          reject({
            code:102,
            error:err
          })
        }else{
          resolve({
            code:101,
            data:data
          })
        }
      }
    );
  })
}

/*增加数据*/
/*INSERT INTO users SET ?*/
const addDB = (sql,data)=>{
  return new Promise((resolve,reject)=>{
    db.query(sql, data, (err, data) => {
      if (err) {
        reject({
          code:102,
          error:err
        })
      } else {
        resolve({
          code:101,
          data:data
        })
      }
    });
  })
}

/* 修改数据 */
/* 'UPDATE users SET ? WHERE id = ?' */
const reviseDB = (sql)=>{
  return new Promise((resolve,reject)=>{
    db.query(sql, [data], (error, data) => {
      if(error){
        reject(
          {
            code:102,
            error:error
          }
        )
      }else{
        resolve(
          {
            code:101,
            data:data
          }
        )
      }
    });
  })
}

/**删除数据 */
/**'DELETE FROM user WHERE condition = ?', ['your_condition'] */
const delDB = (sql,params)=>{
  return new Promise((resolve,reject)=>{
    db.query(sql,params, (err, data) => {
      if(err){
        reject(
          {
            code:102,
            error:err
          }
        )
      }else{
        resolve(
          {
            code:101,
            data:data
          }
        )
      }
    });
  })
}

/**数据库去重 */
const initDB = (sql)=>{
  return new Promise((resolve,reject)=>{
    db.query(sql, (err, data) => {
      if(err){
        reject(
          {
            code:102,
            error:err
          }
        )
      }else{
        resolve(
          {
            code:101,
            data:data
          }
        )
      }
    })
  })
}

module.exports = {
  queryDB,
  addDB,
  reviseDB,
  delDB,
  initDB
};

