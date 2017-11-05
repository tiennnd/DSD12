/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var mongoAdapter = require('sails-mongo');
var waterline = require('waterline');
var orm = new waterline();

var config = {
    adapters: {
        sailsMongo: mongoAdapter
    },

    connections: {
        default: {
            adapter: 'sailsMongo',
            host: "localhost",
            //port: 27017, //optiona
            //password: myConst.DB_DOMAIN_PASSWORD, //optional
            database: "pmpt" //optional
        }
        // someMongodbServer: {
        //   adapter: 'sails-mongo',
        //   host: 'localhost',
        //   port: 27017,
        //   user: 'username', //optional
        //   password: 'password', //optional
        //   database: 'your_mongo_db_name_here' //optional
        // },
    }
};

var fs = require('fs');
var path = require("path");

fs.readdirSync(__dirname).filter(function (file) {
    return (file.indexOf(".") !== 0) && (file !== "index.js");
}).forEach(function (file) {
    var model = require(path.join(__dirname, file));
    orm.loadCollection(model);
});

module.exports = {
    waterline: orm,
    config: config
};