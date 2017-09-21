var Q = require("q");
var Cluster = require("./../Core/cluster");
var Http = require("./../Core/http");
var File = require("./../Core/file");

var Config = require("../config");
var User = require("../user/user");
var InviteCode = require("../user/invite_code");
var VerifCode = require("../user/verification_code");

var serverApi = {};

Cluster.startClusterServer({
    port: Config.user_server.port,
    mongodbOption: Config.mongodb_options,
    debug: true,
    serverApi: serverApi
}).then(function(isMaster) {
    if (isMaster) return;
    User.init();
    InviteCode.init();
});

serverApi["/init"] = function(req, res) {
    Http.readBody(req).then(function(data) {
        var userInfo = JSON.parse(data);
        return User.initUser(userInfo);
    }).then(Http.createResultResponser(res))
    .catch(Http.createErrorResponser(res));
};

serverApi["/register"] = function(req, res) {
    Http.readBody(req).then(function(data) {
        var userInfo = JSON.parse(data);
        return User.register(userInfo);
    }).then(Http.createResultResponser(res))
        .catch(Http.createErrorResponser(res));
};

serverApi["/login"] = function(req, res) {
    Http.readBody(req).then(function(data) {
        var userInfo = JSON.parse(data);
        return User.login(userInfo);
    }).then(Http.createResultResponser(res))
        .catch(Http.createErrorResponser(res));
};

serverApi["/bind/check"] = function(req, res) {
    Http.readBody(req).then(function(data) {
        var userInfo = JSON.parse(data);
        return User.bindCheck(userInfo);
    }).then(Http.createResultResponser(res))
        .catch(Http.createErrorResponser(res));
};

serverApi["/bind"] = function(req, res) {
    Http.readBody(req).then(function(data) {
        var userInfo = JSON.parse(data);
        return User.bindLogin(userInfo);
    }).then(Http.createResultResponser(res))
        .catch(Http.createErrorResponser(res));
};

serverApi["/reset/password"] = function(req, res) {
    Http.readBody(req).then(function(data) {
        var userInfo = JSON.parse(data);
        return User.resetPassword(userInfo);
    }).then(Http.createResultResponser(res))
        .catch(Http.createErrorResponser(res));
};

serverApi["/get"] = function(req, res) {
    Q.fcall(function() {
        var query = Http.parseQuery(req);
        return User.getUserInfoByUid(query);
    }).then(Http.createResultResponser(res))
        .catch(Http.createErrorResponser(res));
};

serverApi["/update"] = function(req, res) {
    Http.readBody(req).then(function(data) {
        var userInfo = JSON.parse(data);
        return User.updateUserInfo(userInfo);
    }).then(Http.createOKResponser(res))
        .catch(Http.createErrorResponser(res));
};

serverApi["/del"] = function(req, res) {
    Q.fcall(function() {
        var query = Http.parseQuery(req);
        return User.deleteUserInfo(query);
    }).then(Http.createOKResponser(res))
        .catch(Http.createErrorResponser(res));
};

serverApi["/legobrick/buy"] = function(req, res) {
    Http.readBody(req).then(function(data) {
        var legobrick = JSON.parse(data);
        return User.addLegoBrick(legobrick);
    }).then(Http.createResultResponser(res))
        .catch(Http.createErrorResponser(res));
};

serverApi["/legobrick/get"] = function(req, res) {
    Q.fcall(function() {
        var query = Http.parseQuery(req);
        return User.getLegoBrick(query);
    }).then(Http.createResultResponser(res))
        .catch(Http.createErrorResponser(res));
};

serverApi["/legobrick/all"] = function(req, res) {
    Q.fcall(function() {
        var query = Http.parseQuery(req);
        return User.getAllLegoBrick(query);
    }).then(Http.createResultResponser(res))
        .catch(Http.createErrorResponser(res));
};

serverApi["/legobrick/del"] = function(req, res) {
    Q.fcall(function() {
        var query = Http.parseQuery(req);
        return User.deleteLegoBrick(query);
    }).then(Http.createOKResponser(res))
        .catch(Http.createErrorResponser(res));
};

serverApi["/invitecode/validate"] = function(req, res) {
    Http.readBody(req).then(function(data) {
        var query = JSON.parse(data);
        return InviteCode.validate(query);
    }).then(Http.createResultResponser(res))
        .catch(Http.createErrorResponser(res));
};

serverApi["/invitecode/generate"] = function(req, res) {
    Q.fcall(function() {
        var query = Http.parseQuery(req);
        return InviteCode.generate(query);
    }).then(Http.createResultResponser(res))
        .catch(Http.createErrorResponser(res));
};

serverApi["/vcode/get"] = function(req, res) {
    Http.readBody(req).then(function(data) {
        var query = JSON.parse(data);
        return VerifCode.getVerifCode(query);
    }).then(Http.createResultResponser(res))
        .catch(Http.createErrorResponser(res));
};

serverApi["/readme"] = function(req, res) {
    File.readFile("./README.md")
    .then(Http.createTextResponser(res))
    .catch(Http.createErrorResponser(res));
};