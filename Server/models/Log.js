/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var waterline = require('waterline');

var Log = waterline.Collection.extend({
    connection: 'default',
    identity: 'log',

    attributes: {
        connection: 'string',
        content_language: 'string',
        content_type: 'string',
        date: 'string',
        domain: 'string',
        request_time: 'string',
        response_time: 'string',
        server: 'string',
        status: 'string',
        transfer_encoding: 'string'

    }
});

module.exports = Log;