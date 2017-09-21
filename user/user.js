var Q = require("q");
var MongoDB = require("../Core/mongodb");
var Crypto = require("../Core/crypto");
var Config = require("../config");
var Log = require("../Core/log");
var AutoIncrement = require("../Core/key").AutoIncrement;
var HttpRpcClient = require("../Core/http").HttpRpcClient;
var Http = require("./../Core/http");

var VerifCode = require("./verification_code");

var httpClient;

var MAX_LEGO_BRICK_COUNT = 32;

function init() {
    httpClient = new HttpRpcClient(Config.lego_remotes);
}

function checkInitInfo(info) {
    if ((info.phone ||info.imei || info.mac || info.idfv || info.idfa) === "") {
        throw new Error("register info all empty");
    }
}

function validateQuery(query) {
    if (query.uid == undefined) throw new Error("missing the user's uid");
    if (parseInt(query.uid) instanceof Number) throw new Error("the user's uid is not number");
}

function initUser(info) {
    //checkInitInfo(info);
    return Q.fcall(function() {
        if (info.phone) {
            return tryGetUserId(Crypto.md5sum(info.phone));
        } else if (info.imei) {
            return tryGetUserId(Crypto.md5sum(info.imei));
        } else if (info.mac) {
            return tryGetUserId(Crypto.md5sum(info.mac));
        } else if (info.idfv) {
            return tryGetUserId(Crypto.md5sum(info.idfv));
        } else if (info.idfa) {
            return tryGetUserId(Crypto.md5sum(info.idfa));
        } else {
            return -1;
        }
    }).then(function(plausibleUid) {
        if (plausibleUid != -1) {
            return plausibleUid;
        }
        return assignUserId(info).then(function(r) {
            return r.uid;
        });
    });
}

function tryGetUserId(hash) {
    return MongoDB.find("user_info", {hash: hash}).then(function(results) {
        if (results[0]) return results[0].uid;
        return -1;
    });
}

function checkRegisterInfo(info) {
    if (info.phone == undefined) throw new Error("missing the user's phone");
    if (typeof info.phone != "string") throw new Error("the user's phone is not string");
    if (info.password == undefined) throw new Error("missing the user's password");
    if (info.vcode == undefined) throw new Error("missing the user's verification code");
}

function register(info) {
    checkRegisterInfo(info);
    return VerifCode.checkVerifCode(info).then(function(r) {
        if (r && r.err_code == 0) {
            validateQuery(info);
            return getUserInfoByUid(info).then(function(r) {
                if (r == undefined || r == null) {
                    return getUserInfoByPhone(info);
                }
                return r;
            }).then(function(r) {
                delete info.vcode;
                if (r == undefined || r == null) {
                    return addNewUser(info);
                }
                if (r.phone) {
                    if (r.phone == info.phone) {
                        //throw new Error("该手机号已经注册过");
                        return {"err_code": 1001, "err_des": "该手机号已经注册过"};
                    }
                    return addNewUser(info);
                } else {
                    return updateUserInfo(info);
                }
            });
        } else {
            return r;
        }
    });
}

function checkLoginInfo(info) {
    if (info.phone == undefined) throw new Error("missing the user's phone");
    if (typeof info.phone != "string") throw new Error("the user's phone is not string");
    if (info.password == undefined) throw new Error("missing the user's password");
}

function login(info) {
    checkLoginInfo(info);
    return getUserInfoByPhone(info).then(function(r) {
        if (r == undefined) {
            //throw new Error("该手机号的用户不存在");
            return {"err_code": 1005, "err_des": "该手机号的用户不存在"};
        }
        if (r.phone && r.phone == info.phone && r.password && r.password == info.password) {
            delete r.hash;
            delete r._id;
            delete r.password;
            return r;
        } else {
            //throw new Error("输入的手机号或密码不正确");
            return {"err_code": 1004, "err_des": "输入的手机号或密码不正确"};
        }
    });
}

function checkThirdPartyInfo(info) {
    if (info == undefined) throw new Error("the data is null");
    if (info.source == undefined) throw new Error("missing the info's source");
    if (info.source === "qq") {
        if (info.qq_info == undefined || info.qq_info.open_id == undefined) {
            throw new Error("missing the info's qq_info");
        }
    } else if (info.source === "weibo") {
        if (info.weibo_info == undefined || info.weibo_info.weibo_id == undefined) {
            throw new Error("missing the info's weibo_info");
        }
    } else if (info.source === "wechat") {
        if (info.wechat_info == undefined || info.wechat_info.open_id == undefined) {
            throw new Error("missing the info's wechat_info");
        }
    }
}

function checkBindPhoneInfo(info) {
    if (info.phone == undefined) throw new Error("missing the user's phone");
    if (typeof info.phone != "string") throw new Error("the user's phone is not String");
    if (info.vcode == undefined) throw new Error("missing the user's verification code");
}

function bindCheck(info) {
    checkThirdPartyInfo(info);
    return getUserInfoByOpenId(info).then(function(r) {
        if (r == undefined || r.phone == undefined) {
            //throw new Error("please bind the phone");
            return {};
        }
        return updateUserInfoByOpenId(info);
    });
}

function bindLogin(info) {
    checkThirdPartyInfo(info);
    checkBindPhoneInfo(info);
    return VerifCode.checkVerifCode(info).then(function(r) {
        if (r && r.err_code == 0) {
            validateQuery(info);
            return getUserInfoByUid(info).then(function(r) {
                if (r == undefined || r == null) {
                    return getUserInfoByPhone(info);
                }
                return r;
            }).then(function(r) {
                delete info.vcode;
                if (r == undefined || r == null) {
                    return addNewUser(info);
                }
                if (info.source === "qq") {
                    info.name = info.qq_info.nick_name;
                } else if (info.source === "wechat") {
                    info.name = info.wechat_info.nick_name;
                } else if (info.source === "weibo") {
                    info.name = info.weibo_info.name;
                }
                if (r.phone) {
                    if (r.phone == info.phone) {
                        return updateUserInfoByPhone(info)
                    } else {
                        return addNewUser(info);
                    }
                } else {
                    return updateUserInfo(info);
                }
            });
        } else {
            return r;
        }
    });
}

function resetPassword(info) {
    checkRegisterInfo(info);
    return VerifCode.checkVerifCode(info).then(function(r) {
        if (r && r.err_code == 0) {
            checkBindPhoneInfo(info);
            return getUserInfoByPhone(info).then(function(r) {
                if (r == undefined || r == null) {
                    //throw new Error("不存在使用该手机号的用户");
                    return {"err_code": 1005, "err_des": "不存在使用该手机号的用户"};
                }
                delete info.vcode;
                return updateUserInfoByPhone(info);
            });
        } else {
            return r;
        }
    });
}

function getUserInfoByUid(query) {
    validateQuery(query);
    return MongoDB.findOne("user_info", {uid: parseInt(query.uid)}, {_id: 0, hash: 0});
}

function getUserInfoByPhone(query) {
    if (query.phone == undefined) throw new Error("missing the user's phone");
    return MongoDB.findOne("user_info", {phone: query.phone}, {_id: 0, hash: 0});
}

function getUserInfoByOpenId(info) {
    if (info.source === "qq") {
        if (info.qq_info.open_id) {
            return MongoDB.findOne("user_info", {"qq_info.open_id": info.qq_info.open_id}, {_id: 0, hash: 0});
        }
    } else if (info.source === "weibo") {
        if (info.weibo_info.weibo_id) {
            return MongoDB.findOne("user_info", {"weibo_info.weibo_id": info.weibo_info.weibo_id}, {_id: 0, hash: 0});
        }
    } else if (info.source === "wechat") {
        if (info.wechat_info.open_id) {
            return MongoDB.findOne("user_info", {"wechat_info.open_id": info.wechat_info.open_id}, {_id: 0, hash: 0});
        }
    }
    return Q();
}

function updateUserInfo(info) {
    validateQuery(info);
    delete info.imei;
    delete info.mac;
    delete info.idfv;
    delete info.idfa;
    return MongoDB.findOneAndUpdate("user_info", {uid: parseInt(info.uid)}, {$set: info}, {upsert: true, returnOriginal: false}).then(function(r) {
        if (r == undefined) throw new Error("update user_info(uid=" + info.uid + ") failed");
        delete r._id;
        delete r.hash;
        delete r.password;
        return r;
    });
}

function updateUserInfoByOpenId(info) {
    if (info.source === "qq") {
        if (info.qq_info.open_id) {
            return MongoDB.findOneAndUpdate("user_info", {"qq_info.open_id": info.qq_info.open_id}, {$set: {"source": info.source, "qq_info": info.qq_info}}, {upsert: true, returnOriginal: false}).then(function(r) {
                if (r == undefined) throw new Error("update user_info(uid=" + info.uid + ") failed");
                delete r._id;
                delete r.hash;
                delete r.password;
                delete r.vcode;
                return r;
            });
        }
    } else if (info.source === "weibo") {
        if (info.weibo_info.weibo_id) {
            return MongoDB.findOneAndUpdate("user_info", {"weibo_info.weibo_id": info.weibo_info.weibo_id}, {$set: {"source": info.source, "weibo_info": info.weibo_info}}, {upsert: true, returnOriginal: false}).then(function(r) {
                if (r == undefined) throw new Error("update user_info(uid=" + info.uid + ") failed");
                delete r._id;
                delete r.hash;
                delete r.password;
                delete r.vcode;
                return r;
            });
        }
    } else if (info.source === "wechat") {
        if (info.wechat_info.open_id) {
            return MongoDB.findOneAndUpdate("user_info", {"wechat_info.open_id": info.wechat_info.open_id}, {$set: {"source": info.source, "wechat_info": info.wechat_info}}, {upsert: true, returnOriginal: false}).then(function(r) {
                if (r == undefined) throw new Error("update user_info(uid=" + info.uid + ") failed");
                delete r._id;
                delete r.hash;
                delete r.password;
                delete r.vcode;
                return r;
            });
        }
    }
}

function updateUserInfoByPhone(info) {
    delete info.imei;
    delete info.mac;
    delete info.idfv;
    delete info.idfa;
    delete info.uid;
    return MongoDB.findOneAndUpdate("user_info", {phone: info.phone}, {$set: info}, {upsert: true, returnOriginal: false}).then(function(r) {
        if (r == undefined) throw new Error("update user_info(phone=" + info.phone + ") failed");
        delete r._id;
        delete r.hash;
        delete r.password;
        delete r.vcode;
        return r;
    });
}

function deleteUserInfo(query) {
    validateQuery(query)
    return MongoDB.deleteOne("user_info", {uid: parseInt(query.uid)}).then(function(r) {
        if (r.deletedCount != 1) throw new Error("delete user_info(uid=" + query.uid + ") failed");
        return;
    });
}

function assignUserId(info) {
    if ((info.phone ||info.imei || info.mac || info.idfv || info.idfa) === "") {
        return addNewUser(info);
    }

    if ((info.phone ||info.imei || info.mac || info.idfv || info.idfa) === undefined) {
        return addNewUser(info);
    }

    var hash = Crypto.md5sum(info.phone || info.imei || info.mac || info.idfv || info.idfa);
    info.hash = hash;
    return addNewUser(info);
}

function addNewUser(info) {
    info.wealth = 10;
    return AutoIncrement.getNextId("user_info").then(function(id) {
        info.uid = id;
        return MongoDB.insertOne("user_info", info);
    }).then(function(result) {
        if (result.insertedCount !== 1) throw new Error("insert user failed, data=\n" + JSON.stringify(info));
        Log.i("用户(id=" + info.uid + ")已入库");
        delete info._id;
        delete info.hash;
        delete info.password;
        return info;
    });
}

function validateLegoBrickQuery(query) {
    if (query.uid == undefined) throw new Error("missing the user's uid");
    if (parseInt(query.uid) instanceof Number) throw new Error("the user's uid is not number");

    if (query.lego_brick_id == undefined) throw new Error("missing the user's lego_brick_id");
    if (parseInt(query.lego_brick_id) instanceof Number) throw new Error("the user's lego_brick_id is not number");
}

function buyLegoBrick(lego_brick) {
    validateLegoBrickQuery(lego_brick);
    var uid = parseInt(lego_brick.uid);
    var lego_brick_id = parseInt(lego_brick.lego_brick_id);
    return httpClient.call("/legobrick/get?id=" + lego_brick_id,{}).then(function(legobrick) {
        if (legobrick.length <= 0) return;
        if (legobrick[0].price == undefined) legobrick[0].price = 0;
        return MongoDB.insertOne("lego_brick", {uid: uid, app: legobrick[0].app, lego_brick_id: legobrick[0].id}).then(function(res) {
            if (res.insertedCount != 1) throw new Error("buy the lego brick failed");
            return MongoDB.findOneAndUpdate("user_info", {uid: uid}, {$inc:{wealth: (0 - parseInt(legobrick[0].price))}}, {upsert: false, returnOriginal: false});
        }).then(function(user) {
            if (user) {
                if (user.wealth < 0) {
                    return MongoDB.findOneAndUpdate("user_info", {uid: uid}, {$inc:{wealth: parseInt(legobrick[0].price)}});
                } else {
                    return user;
                }
            } else {
                throw new Error("the user is null");
            }
        });
    });
}

function addLegoBrick(lego_brick) {
    var uid = parseInt(lego_brick.uid);
    var lego_brick_id = parseInt(lego_brick.lego_brick_id);
    return MongoDB.count("lego_brick", {uid: uid}).then(function(count) {
        if (count >= MAX_LEGO_BRICK_COUNT) throw new Error("the max count of lego_brick go beyond");
        return httpClient.call("/legobrick/get?id=" + lego_brick_id,{});
    }).then(function(legobrick) {
        if (legobrick.length <= 0) throw new Error("the lego_brick(id=" + lego_brick_id+ " )is not exsit");
        return MongoDB.insertOne("lego_brick", {uid: uid, app: legobrick[0].app, lego_brick_id: legobrick[0].id}).then(function(res) {
            if (res.insertedCount != 1) throw new Error("add the lego brick failed");
            lego_brick.app = legobrick[0].app;
            return lego_brick;
        });
    });
}


function validateGetLegoBrickQuery(query) {
    if (query.uid == undefined) throw new Error("missing the user's uid");
    if (parseInt(query.uid) instanceof Number) throw new Error("the user's uid is not number");
    if (query.app == undefined) throw new Error("missing the lego_brick's app");
}
function getLegoBrick(query) {
    validateGetLegoBrickQuery(query);
    return MongoDB.find("lego_brick", {uid: parseInt(query.uid), app: query.app}, {_id:0, lego_brick_id: 1}).then(function(datas) {
        if (datas.length <= 0) return [];
        return datas.map(function(data) {
            return data.lego_brick_id;
        })
    });
}

function getAllLegoBrick(query) {
    validateQuery(query);
    return MongoDB.find("lego_brick", {uid: parseInt(query.uid)}, {_id: 0, lego_brick_id: 1}).then(function(legobricks) {
        if (legobricks.length <= 0) return;
        var promise = Q();
        promise = legobricks.map(function(legobrick) {
           return httpClient.call("/legobrick/get?id=" + legobrick.lego_brick_id, {}).then(function(res) {
               if (res.length <= 0) return;
               return res[0];
           });
        });
        return Q.all(promise);
    }).then(function(res) {
        if (res == undefined || res.length <= 0) return [];
        var legobricks = new Array();
        for (var i = 0;i < res.length; i++) {
            if (res[i] != null) {
                legobricks.push(res[i]);
            }
        }
        return legobricks;
    });
}

function deleteLegoBrick(query) {
    validateLegoBrickQuery(query);
    return MongoDB.deleteOne("lego_brick", {uid: parseInt(query.uid), lego_brick_id: parseInt(query.lego_brick_id)}).then(function(r) {
        if (r.deletedCount != 1) throw new Error("delete user_lego_brick(lego_brick=" + query.lego_brick_id + ") failed");
        return;
    });
}

exports.init = init;
exports.checkInitInfo = checkInitInfo;
exports.initUser = initUser;
exports.register = register;
exports.getUserInfoByPhone  = getUserInfoByPhone;
exports.getUserInfoByUid = getUserInfoByUid;
exports.getUserInfoByOpenId = getUserInfoByOpenId;
exports.updateUserInfo = updateUserInfo;
exports.deleteUserInfo = deleteUserInfo;
exports.login = login;
exports.bindLogin = bindLogin;
exports.bindCheck = bindCheck;
exports.resetPassword = resetPassword;
exports.buyLegoBrick = buyLegoBrick;
exports.addLegoBrick = addLegoBrick;
exports.getLegoBrick = getLegoBrick;
exports.getAllLegoBrick = getAllLegoBrick;
exports.deleteLegoBrick = deleteLegoBrick;