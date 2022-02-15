"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FritzService = void 0;
var https_1 = __importDefault(require("https"));
var file_service_1 = require("./file.service");
var FritzService = /** @class */ (function () {
    function FritzService() {
    }
    FritzService.heatUpRoom = function (room, sid) {
        console.log('🔼 Heat up room: ', room.title);
        var baseUrl = process.env.FRITZ_ADDRESS;
        var roomId = room.fritzId;
        var temp = room.comfortTemp;
        var url = baseUrl + "/webservices/homeautoswitch.lua?sid=" + sid + "&ain=" + roomId + "&switchcmd=sethkrtsoll&param=" + temp * 2;
        console.log('call: ', url);
        var prodMode = process.env.MODE;
        if (prodMode === 'prod' && temp != 0) {
            https_1.default.get(url, function (res) {
                var data = '';
                // A chunk of data has been received.
                res.on('data', function (chunk) {
                    data += chunk;
                });
                // The whole response has been received. Print out the result.
                res.on('end', function () {
                    var state = 'Heat up  ';
                    var jsonData = JSON.parse(data);
                    console.log('Recieved data from FritzBox for heating up room', room.title, ': ', jsonData);
                    file_service_1.SimpleLog.writeSimpleLog(room.title, temp * 2, jsonData, state);
                });
            });
        }
    };
    FritzService.coolDownRoom = function (room, sid) {
        console.log('🔽 Cool down room: ', room.title);
        var baseUrl = process.env.FRITZ_ADDRESS;
        var roomId = room.fritzId;
        var temp = room.emptyTemp;
        var url = baseUrl + "/webservices/homeautoswitch.lua?sid=" + sid + "&ain=" + roomId + "&switchcmd=sethkrtsoll&param=" + temp * 2;
        console.log('call: ', url);
        var prodMode = process.env.MODE;
        if (prodMode === 'prod' && temp != 0) {
            https_1.default.get(url, function (res) {
                var data = '';
                // A chunk of data has been received.
                res.on('data', function (chunk) {
                    data += chunk;
                });
                // The whole response has been received. Print out the result.
                res.on('end', function () {
                    var state = 'Cool down';
                    var jsonData = JSON.parse(data);
                    console.log('Recieved data from FritzBox for cooling down room', room.title, ': ', jsonData);
                    file_service_1.SimpleLog.writeSimpleLog(room.title, temp * 2, jsonData, state);
                });
            });
        }
    };
    return FritzService;
}());
exports.FritzService = FritzService;
