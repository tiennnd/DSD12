var amqp = require('amqplib/callback_api');
var mongodb = require('mongodb');
var SHA256 = require("crypto-js/sha256");
var CryptoJS = require("crypto-js");

var MongoClient = mongodb.MongoClient;
var url = 'mongodb://192.168.1.43:27017/pmpt';
var db;
var collection;
/**
 * Config connection socket.io
 */
var io = require('socket.io-client');
var socket = io('http://localhost:3000');
    socket.on('connect', function (data) {
        socket.emit('receive1', 'Hello World from Receive...');
        sendSpeedInfo(socket);
    });

    function sendSpeedInfo(socket){
      setTimeout(() => {
        var time = Date.now() - startTimeCount;
        var speedReceive = countMsgReceive * 1000 / time;
        var speedSaveDB = countMsgSaveDB * 1000 / time;
        // socket.emit('receive1', 'Hello World from Receive...');
        socket.emit('receive1', speedReceive, speedSaveDB);
        countMsgReceive = 0;
        countMsgSaveDB = 0;
        startTimeCount = Date.now();
        sendSpeedInfo(socket);
      }, 500);
    }

/**
 * Config connection MongoClient
 */
MongoClient.connect(url, function (err, db) {
    if (err) {
        console.log('Unable to connect to the mongoDB server. Error:', err);

    } else {
      //HURRAY!! We are connected. :)
      console.log('Connection established to', url);
      this.db = db;
      collection = db.collection('Log');
    }
});



var countMsgReceive = 0;
var countMsgSaveDB = 0;
var startTimeCount = Date.now();

/**
 * Config connection RabbitMQ Client
 */
amqp.connect('amqp://tiennd:123456@192.168.1.43', function(err, conn) {
  conn.createChannel(function(err, ch) {
    var q = 'queuelogs';
    ch.assertQueue(q, {durable: false});
    console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q);
    ch.consume(q, function(log) {
      // console.log(log.content.toString());
      countMsgReceive++;

      // //decrypt
      var parsedWordArray = CryptoJS.enc.Base64.parse(log.content.toString());
      var parsedStr = parsedWordArray.toString(CryptoJS.enc.Utf8);
      // console.log("parsed:",parsedStr);

      var oo = JSON.parse(parsedStr);

      var hash = SHA256(JSON.stringify(oo.data)+"TienTuanKhiem").toString();
      if (hash === oo.sha) {
        // console.log("verify_agent true");
        oo.verify_agent = true;
      } else {
        console.log("hash = " + hash );
        console.log("oo.sha = " + oo.sha );
        oo.verify_agent = false;
      }

      oo.machine = "NguyenTienMBP";
      oo.date_receive = new Date().toLocaleString();

      // save db
      collection.insert (oo, function (error, result) {
        if(error) {
          console.log(error);
        } else {
          countMsgSaveDB++;
          if(oo.data.status > 0) {
            console.log(oo);
            var time = Date.now() - startTimeCount;
            console.log("speed mongodb msg = " + countMsgSaveDB * 1000 / time +" msg/s");
            console.log("speed receive msg = " + countMsgReceive * 1000 / time +" msg/s");
          }
        }
      })
    }, {noAck: true});
  });
});
