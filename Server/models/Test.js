/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


var waterline = require('waterline');

var Domain = waterline.Collection.extend({
    connection: 'default',
    identity: 'test',

    attributes: {
        a: 'string'
    }
});

module.exports = Domain;