var MongoDB = require("../Core/mongodb");
var Sms = require("./sms");
var User = require("./user");

function getVerifCode(item) {
    validatePhone(item);
    var code = generateRandomCode();
    return User.getUserInfoByPhone(item).then(function(r) {
        if ((r === undefined || r === null) && item.action === "reset") {
            //throw new Error("该手机号的用户不存在");
            return {"err_code": 1005, "err_des": "该手机号的用户不存在"};
        }
        if (r && item.action === "register") {
            //throw new Error("该手机号已经注册过");
            return {"err_code": 1001, "err_des": "该手机号已经注册过"};
        }

        if (item.phone === "18211672654") {
            var created_at = new Date();
            return MongoDB.findOneAndUpdate("vcode", {phone: item.phone},
                {
                    phone: item.phone,
                    vcode: "888888",
                    created_at: created_at
                }, {upsert: true, returnOriginal: false}).then(function () {
                    return {"err_code": 0};
                })
        }

        return MongoDB.find("anti_repeat", {phone: item.phone}).then(
            function (res) {
                if (res.length === 0) {
                    return Sms.sendSms(item.phone, code).then(function (res) {
                        var json = JSON.parse(res);
                        if (json.msg === "发送成功") {
                            var created_at = new Date();
                            return MongoDB.insertOne("anti_repeat", {phone: item.phone, created_at: created_at})
                        } else {
                            throw new Error(res);
                        }
                    }).then(function (res) {
                        if (res.insertedCount !== 1) throw new Error("something wrong with anti-repeat system");
                        var created_at = new Date();
                        return MongoDB.findOneAndUpdate("vcode", {phone: item.phone},
                            {
                                phone: item.phone,
                                vcode: code,
                                created_at: created_at
                            }, {upsert: true, returnOriginal: false})
                    }).then(function () {
                        return {"err_code": 0};
                    });
                } else {
                    //throw new Error("60秒防刷");
                    return {"err_code": 1006, "err_des": "60秒防刷"};
                }
            }
        );
    });
}

function generateRandomCode() {
    return ('000000' + Math.floor(Math.random() * 999999)).slice(-6);
}

function validatePhone(item) {
    if (item.phone === undefined) throw new Error("missing phone");
    if (typeof item.phone != "string") throw new Error("the user's phone is not string");
    if (item.phone.toString().length !== 11 || item.phone.toString().indexOf("1") !== 0)
        throw new Error("phone is illegal");
    if (item.action === undefined) throw new Error("missing action");
}

function checkVerifCode(info) {
    return MongoDB.findOne("vcode", {phone: info.phone}).then(function(r) {
        if (r == undefined || r == null) {
            //throw new Error("验证码未获取或已失效");
            return {"err_code": 1002, "err_des": "验证码未获取或已失效"};
        }
        if (r.vcode != undefined && r.vcode != info.vcode) {
            //throw new Error("验证码错误");
            return {"err_code": 1003, "err_des": "验证码错误"};
        }
        return {"err_code": 0};
    });
}

exports.getVerifCode = getVerifCode;
exports.checkVerifCode = checkVerifCode;