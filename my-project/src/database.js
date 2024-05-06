const mysql = require('mysql');
console.log(process.env.DATABASE_HOST, process.env.DATABASE_USER, process.env.DATABAS_NAME, process.env.DATABASE_PASS)
// Create a connection pool
const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,  
  password: process.env.DATABASE_PASS,  
  database: process.env.DATABAS_NAME,  
});

// Export the pool
module.exports = pool; 


