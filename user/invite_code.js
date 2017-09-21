var MongoDB = require("../Core/mongodb");

function init() { }

function generate(query) {
    query.limit = parseInt(query.limit);
    if (isNaN(query.limit)) throw new Error("limit is not number");
    var codesToRelease = [];
    return generateLoop();

    function generateLoop() {
        var rndcode = createRandomString(5);
        return MongoDB.findOneAndUpdate("invite_code", {code: rndcode}, {$set: {code: rndcode}}, {projection: {_id: 0}, upsert: true}).then(function(code) {
            if (code !== null) { // 邀请码已经生成过了,重试
                return generateLoop();
            }
            codesToRelease.push(rndcode);
            if (codesToRelease.length < query.limit) return generateLoop();
            return codesToRelease;
        });
    }

    function createRandomString(len) {
        var CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        var NUMS = "0123456789";
        var str = "";
        for (var i = 0; i < len; ++i) {
            var type = Math.floor(Math.random() * 2);
            switch (type) {
                case 0:
                    str += CHARS[Math.floor(Math.random() * 26)];
                    break;
                case 1:
                    str += NUMS[Math.floor(Math.random() * 10)];
                    break;
                default:
                    break;
            }
        }
        return str;
    }
}

function validate(query) {
    if (typeof query.code !== "string") throw new Error("code is not string");
    if (typeof query.machine !== "object") throw new Error("missing machine");
    if (typeof query.machine.imei !== "string" && typeof query.machine.mac !== "string" && typeof query.machine.timestamp !== "string") throw new Error("missing machine.imei or mac or timestamp");
    query.code = query.code.toUpperCase();
    if (query.code === "WS123") return "ok"; // 特殊判断保留邀请码
    return lookupCode(query.code).then(function(exist) {
        if (!exist) return "invalid";
        var desc = createMachineDesc(query.machine);
        return tryGetMachineDescByCode(query.code).then(function(existingDesc) {
            if (desc === existingDesc) return "ok";
            if (existingDesc !== null) return "used";
            return MongoDB.updateOne("invite_code", {code: query.code}, {$set: {machine: desc}}).then(function (result) {
                if (result.modifiedCount !== 1) throw new Error("update invite code machine info failed.");
                return "ok";
            });
        });
    });
}

function lookupCode(code) {
    return MongoDB.findOne("invite_code", {code: code}).then(function(res) {
        return (res !== null);
    });
}

function createMachineDesc(machine) {
    if (typeof machine.imei === "string") return "imei_" + machine.imei;
    if (typeof machine.mac === "string") return "mac_" + machine.mac;
    if (typeof machine.timestamp === "string") return "timestamp_" + machine.timestamp;
    return "random_" + Math.random();
}

function tryGetMachineDescByCode(code) {
    return MongoDB.findOne("invite_code", {code: code}, {_id: 0, machine: 1}).then(function(result) {
        if (result.machine === undefined) return null;
        return result.machine;
    });
}

exports.init = init;
exports.validate = validate;
exports.generate = generate;