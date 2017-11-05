var parse = require('clf-parser');
var aaa = "192.168.43.72 - - [27/Oct/2017:14:51:16 +0700] \"GET /dashboard/images/favicon.png HTTP/1.1\" 200 2508";
var xxx = parse(aaa);
// console.log(xxx);
var json = JSON.stringify(xxx);

// var SHA256 = require("crypto-js/sha256");
// var hash = SHA256(json+"NguyenTienMBP").toString();
//
// console.log(hash);
// if (hash === "a468610befedcaeafd2cfdf688ff23c4c419fbc40af994ef8eb55fc5c037799b") {
//   console.log(true);
// } else {
//   console.log(false);
// }

var CryptoJS = require("crypto-js");//replace thie with script tag in browser env

//encrypt
// var rawStr = "Chống chối bỏ: kết quả của quy trách nhiệm";
// var rawStr = "{\"data\":{\"agent_name\":\"Agent1\",\"isnew\":0,\"remote_addr\":null,\"time_local_log\":null,\"method\":null,\"path\":null,\"protocol\":null,\"status\":-1,\"body_bytes_sent\":0,\"date_agent\":\"11/3/2017, 8:33:12 PM\"},\"sha\":\"0eea50a5b7be9f3570543bda2c43d6c61a621473bb68fe8c5ee3fde29df9af3b\"}";
// var wordArray = CryptoJS.enc.Utf8.parse(rawStr);
// var base64 = CryptoJS.enc.Base64.stringify(wordArray);
// console.log('encrypted:', base64);
//
// //decrypt
// var parsedWordArray = CryptoJS.enc.Base64.parse(base64);
// var parsedStr = parsedWordArray.toString(CryptoJS.enc.Utf8);
// console.log("parsed:",parsedStr);


// var encrypted = CryptoJS.TripleDES.encrypt("Message", "SecretPassphrase");
// console.log(encrypted);
//
// var decrypted = CryptoJS.TripleDES.decrypt(encrypted, "SecretPassphrase");
// console.log(decrypted);

var encrypted1 = CryptoJS.AES.encrypt("Message", "Secret Passphrase");
console.log(encrypted1.toString());
var decrypted1 = CryptoJS.AES.decrypt(encrypted1, "Secret Passphrase");
console.log(decrypted1.toString());
