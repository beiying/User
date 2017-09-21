var Http = require("../Core/http");
var qs = require('querystring');

var API_KEY = '0af11f9402e9e267639866e35b5ac582';
var TPL_ID = 1906274;
var APP_NAME = "聊点";
var SMS_URI = "https://sms.yunpian.com/v2/sms/tpl_single_send.json";

function sendSms(mobile, code) {
    var tplValue = {'#app#': APP_NAME, '#code#': code};
    var postData = {
        'apikey': API_KEY,
        'mobile': mobile,
        'tpl_id': TPL_ID,
        'tpl_value': qs.stringify(tplValue),
    };
    var content = qs.stringify(postData);
    return Http.request(SMS_URI, "post", content);
}

exports.sendSms = sendSms;
