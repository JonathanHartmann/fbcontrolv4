"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FritzService = void 0;
var http_1 = __importDefault(require("http"));
var FritzService = /** @class */ (function () {
    function FritzService() {
    }
    FritzService.heatUpRoom = function (room, sid) {
        return __awaiter(this, void 0, void 0, function () {
            var baseUrl, roomId, temp, url, prodMode;
            return __generator(this, function (_a) {
                console.log('🔼 Heat up room: ', room.title);
                baseUrl = process.env.FRITZ_ADDRESS;
                roomId = room.id;
                temp = room.comfortTemp;
                url = baseUrl + "/webservices/homeautoswitch.lua?sid=" + sid + "&ain=" + roomId + "&switchcmd=sethkrtsoll&param=" + temp * 2;
                console.log('call: ', url);
                prodMode = process.env.MODE;
                if (prodMode === 'prod') {
                    http_1.default.get(url, function (res) {
                        var data = '';
                        // A chunk of data has been received.
                        res.on('data', function (chunk) {
                            data += chunk;
                        });
                        // The whole response has been received. Print out the result.
                        res.on('end', function () {
                            console.log('Recieved data from FrtizBox for heating up room', room.title, ':');
                            console.log(JSON.parse(data));
                        });
                    });
                }
                return [2 /*return*/];
            });
        });
    };
    FritzService.coolDownRoom = function (room, sid) {
        return __awaiter(this, void 0, void 0, function () {
            var baseUrl, roomId, temp, url, prodMode;
            return __generator(this, function (_a) {
                console.log('🔽 Cool down room: ', room.title);
                baseUrl = process.env.FRITZ_ADDRESS;
                roomId = room.id;
                temp = room.emptyTemp;
                url = baseUrl + "/webservices/homeautoswitch.lua?sid=" + sid + "&ain=" + roomId + "&switchcmd=sethkrtsoll&param=" + temp * 2;
                console.log('call: ', url);
                prodMode = process.env.MODE;
                if (prodMode === 'prod') {
                    http_1.default.get(url, function (res) {
                        var data = '';
                        // A chunk of data has been received.
                        res.on('data', function (chunk) {
                            data += chunk;
                        });
                        // The whole response has been received. Print out the result.
                        res.on('end', function () {
                            console.log('Recieved data from FrtizBox for cooling down room', room.title, ':');
                            console.log(JSON.parse(data));
                        });
                    });
                }
                return [2 /*return*/];
            });
        });
    };
    return FritzService;
}());
exports.FritzService = FritzService;
