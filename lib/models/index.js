var Sequelize = require('sequelize');
var dbconfig = require("../../config/database").config;

var sequelize = new Sequelize(dbconfig.db, dbconfig.user, dbconfig.password, {
    host: dbconfig.hostname,
    port: dbconfig.port,
    logging: false
});

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
    model.BlogEntries.sync({
    }).success(function() {
    }).error(function(error) {
        console.log('Error during Task.sync(): ' + error); 
    });
})

module.exports.sequelize = sequelize;