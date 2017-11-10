const axios = require('axios');
var i= 0;
var link = "http://localhost/dashboard";
var link10 = "http://localhost/dashboard/index.html";
var link1 = "http://localhost/giao-dien/public/history";
var link2 = "http://localhost/giao-dien/public";
var link3 = "http://localhost/giao-dien/public/index.html";
var link4 = "http://localhost/giao-dien/public/p1";
var link5 = "http://localhost/giao-dien/public/p2";
var link6 = "http://localhost/giao-dien/";
var link7 = "http://localhost/dashboard/ads";
var link8 = "http://localhost/dashboard/ads1";
var link9 = "http://localhost/dashboard/ads2";
var link11 = "http://localhost/applications.html";

var arr = [link,link1,link2,link3,link4,link5,link6,link7,link8,link9,link10,link11];
console.log(arr.length);
var countError = 0;
console.log("running...");
function autoRequest() {
  // console.log(i++);
  setTimeout(() => {
    var rd = Math.floor((Math.random() * arr.length));
    var href = arr[rd];

    axios.get(href).then(response => {
      // console.log(href);
      // console.log(response.status);
    }) .catch(error => {
      // console.log(error);
      // console.log("countError " + ++i);
    });
    autoRequest();
  }, 200);

}

autoRequest();
