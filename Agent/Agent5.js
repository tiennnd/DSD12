var amqp = require('amqplib/callback_api');
var parse = require('clf-parser');
var fs = require('fs');
var readline = require("readline");
var SHA256 = require("crypto-js/sha256");
var CryptoJS = require("crypto-js");
var moment = require('moment');

// log record default
var mLog = {
  data : {
    agent_name:"Agent5",
    remote_addr: null,
    time_local_log: null,
    method: null,
    path: null,
    protocol: null,
    status: -1,
    body_bytes_sent:  0,
    date_agent: null
  },
  sha: null
};

// listening access_log file change
var lastLineRead = 1;
function watchFile(filePath) {
   try {
       fs.watch(filePath, function (event, fileName) {
           var startTime = Date.now();
           var stream = fs.createReadStream(filePath );
           var lineReader = readline.createInterface({
               input: stream
           });
           var lineCount = 0;
           lineReader.on("line", function (line) {
               lineCount++;
               if (lineCount > lastLineRead) {
                   lastLineRead++;
                   console.log(line);
                   var vLog = parseLog(line);

                   mLog.data.remote_addr = vLog.remote_addr;
                   mLog.data.time_local_log = moment(vLog.time_local, "DD/MM/YYYY").format('YYYY-MM-DD hh:mm:ss');
                   mLog.data.method = vLog.method;
                   mLog.data.path = vLog.path;
                   mLog.data.protocol = vLog.protocol;
                   mLog.data.status = vLog.status;
                   mLog.data.body_bytes_sent = vLog.body_bytes_sent;
               }
           })
       });

   } catch (e) {
       console.log("error: " + e);
   }
}
watchFile("/Applications/XAMPP/xamppfiles/logs/access_log");


// connect to rabbitmq
amqp.connect('amqp://tiennd:123456@192.168.1.43', function(err, conn) {

    if(err) {
      console.log(err);

    } else {
      console.log("connected to rabbitmq ..");
      conn.createChannel(function(err, ch) {
        var queue = 'queuelogs';
        ch.assertQueue(queue, {durable: false});
        sendLogs(false,ch,queue);
      });
      // setTimeout(function() { conn.close(); process.exit(0) }, 3000000);
    }
});


var i = 0;
function sendLogs(stop,ch,queue){
  if(stop === true) {
    console.log("stop..");
    return;
  }

  // var msg = "AgentFromTien1 : msg index = " + (i++);
  // console.log(msg);
  if(mLog.data.status > -1) {
    console.log(mLog);
  }

  // insert date and sha256
  mLog.data.date_agent = moment(new Date(), "DD/MM/YYYY").format('YYYY-MM-DD hh:mm:ss');
  mLog.sha = SHA256(JSON.stringify(mLog.data)+"TienTuanKhiem").toString();
  // console.log(JSON.stringify(mLog));

// encryption base64
  var wordArray = CryptoJS.enc.Utf8.parse(JSON.stringify(mLog));
  var base64 = CryptoJS.enc.Base64.stringify(wordArray);
  // console.log('encrypted:', base64);

  ch.sendToQueue(queue, new Buffer(base64));

  // set status for log if not change
  if(mLog.data.status > -1) {
    mLog.data.status = -1;
  }
  setTimeout(sendLogs, 2, false,ch,queue);
}


// parse record log to object
function parseLog(value){
    return parse(value);
}
