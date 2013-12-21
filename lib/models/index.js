var Sequelize = require('sequelize');
var dbconfig = require("../../config/database").config;
var dbname = dbconfig.db;
var dbhostname = dbconfig.hostname;
var dbport = dbconfig.port;
var dbuser = dbconfig.user;
var dbpassword = dbconfig.password;

var sequelize = new Sequelize(dbname, dbuser, dbpassword, {
    host: dbhostname,
    port: dbport,
    logging: false
});


// //list all models that will be loaded
var models = [
    {
        name: 'BlogEntries',
        file: 'blog-post'
    },
    {
        name: 'Comments',
        file: 'comments'
    }
    ,
    {
        name: 'Users',
        file: 'users'
    }
];

// //load models dynamically
models.forEach(function(model) {
    module.exports[model.name] = sequelize.import(__dirname + '/' + model.file); 
});



(function(model) {
    model.BlogEntries.sync()
    .success(function() {
    })
    .error(function(error) {
        console.log('Error during Task.sync(): ' + error); 
    });
})




module.exports.sequelize = sequelize;