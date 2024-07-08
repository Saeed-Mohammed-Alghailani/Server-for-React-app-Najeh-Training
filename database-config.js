const sql = require("mssql")
const config = { 

    user : 'sa',
    password : 'sa',
    server   : 'saidmohammed-app-5edbe9f026ce.herokuapp.com',
    database : 'Shopping_DB',
    options  : {

        trustServerCertificate : true
    }
};

sql.connect(config).catch(error => console.log(error))

module.exports = sql;