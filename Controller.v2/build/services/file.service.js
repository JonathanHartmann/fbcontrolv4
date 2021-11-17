"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimpleLog = exports.SIDService = void 0;
var crypto_1 = require("crypto");
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var SIDService = /** @class */ (function () {
    function SIDService() {
    }
    SIDService.readSIDFile = function (cb) {
        var sidPath = process.env.SID_FILE;
        if (sidPath) {
            var filename = path_1.default.join(__dirname, sidPath);
            fs_1.default.readFile(filename, 'utf8', function (err, data) {
                console.log('Encrypt SID ', data);
                if (process.env.SID_KEY) {
                    var sid = SIDService.decrypt(data, process.env.SID_KEY);
                    // console.log('Decrypt SID ', sid);
                    cb(err, sid);
                }
            });
        }
    };
    SIDService.requestNewSID = function () {
        var sidPath = process.env.SID_FILE;
        if (sidPath) {
            var filename = path_1.default.join(__dirname, sidPath);
            fs_1.default.writeFile(filename, '', function () {
                console.log('Cleared file, waiting now for new SID!');
                console.log('Request new SID...');
            });
        }
    };
    SIDService.decrypt = function (cipherText, key) {
        var mykey = (0, crypto_1.createDecipheriv)('aes-128-ecb', key, null);
        var mystr = mykey.update(cipherText, 'base64', 'utf8');
        return mystr;
    };
    return SIDService;
}());
exports.SIDService = SIDService;
var SimpleLog = /** @class */ (function () {
    function SimpleLog() {
    }
    //Direkte Ansteuerungsbefehle aus der fritz.service.ts (Zeile 8,31) mit Realtime Timestamp in eine eigene .log Datei schreiben
    //Pfad der Datei muss definiert sein (.env)
    //
    SimpleLog.writeSimpleLog = function (roomTitle, expectedTemp, fritzBoxTemp, others) {
        var simplelogpath = process.env.simplelog_path;
        var date_controller = new Date().toISOString();
        var date = new Date();
        if (simplelogpath) {
            var filename = path_1.default.join(__dirname, simplelogpath);
            var simpledata = date + " | Date Controller:" + date_controller + " | Cool down room: " + roomTitle + " | expected temp: " + expectedTemp + " | actual temp: " + fritzBoxTemp;
            if (others) {
                simpledata += ' | ' + others;
            }
            simpledata += '\n';
            fs_1.default.appendFile(filename, simpledata, function () {
                // Hier kommt Logik rein, die Ausgeführt wird, wenn simpledata an die Datei angehangen wurde.
            });
        }
    };
    return SimpleLog;
}());
exports.SimpleLog = SimpleLog;
