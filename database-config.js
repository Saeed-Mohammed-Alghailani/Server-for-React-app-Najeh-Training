const sql = require("mssql")
const config = { 

    user : 'saidadmin',
    password : 'Ss$95392644',
    server   : 'servershopping.database.windows.net',
    database : 'shoppingdb',
    options  : {

        // trustServerCertificate : true
        encrypt: true // use this if you're using Azure
    }
};

sql.connect(config).catch(error => console.log(error))

module.exports = sql;
