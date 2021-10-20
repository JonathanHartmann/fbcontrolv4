"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var dotenv_1 = __importDefault(require("dotenv"));
var file_service_1 = require("./services/file.service");
var firebase_service_1 = require("./services/firebase.service");
var fritz_service_1 = require("./services/fritz.service");
var event_service_1 = require("./services/event.service");
dotenv_1.default.config();
var start = function () {
    firebase_service_1.FirebaseService.loadEvents().then(function (events) {
        var filteredEvents = events.filter(function (e) { return !e.background; });
        getRoomsMap().then(function (roomsMap) {
            checkEvents(filteredEvents, roomsMap);
        });
    });
};
var checkEvents = function (events, roomsMap) {
    console.log(new Date().toISOString(), ' - Start check...');
    file_service_1.SIDService.readSIDFile(function (err, sid) {
        return __awaiter(this, void 0, void 0, function () {
            var eventsEnh;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!err) return [3 /*break*/, 1];
                        console.error('Could not read sid.txt! ', err);
                        return [3 /*break*/, 4];
                    case 1:
                        if (!(sid.length !== 16)) return [3 /*break*/, 2];
                        file_service_1.SIDService.requestNewSID();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, event_service_1.EventService.getEnhancedEvents(events, roomsMap)];
                    case 3:
                        eventsEnh = _a.sent();
                        event_service_1.EventService.checkTimes(eventsEnh, roomsMap, function (room, event) {
                            // Before the event
                            firebase_service_1.FirebaseService.updateRoom(__assign(__assign({}, room), { heated: true, cooled: false }));
                            fritz_service_1.FritzService.heatUpRoom(room, sid);
                        }, function (room, event) {
                            // After the event
                            firebase_service_1.FirebaseService.updateRoom(__assign(__assign({}, room), { heated: false, cooled: true }));
                            fritz_service_1.FritzService.coolDownRoom(room, sid);
                            if ((event === null || event === void 0 ? void 0 : event.seriesEndless) && event.seriesId) {
                                console.log('try to create new event');
                                firebase_service_1.FirebaseService.appendEndlessEvent(events, event.seriesId);
                            }
                        });
                        _a.label = 4;
                    case 4:
                        console.log(new Date().toISOString(), ' - Check ended');
                        return [2 /*return*/];
                }
            });
        });
    });
};
var getRoomsMap = function () { return __awaiter(void 0, void 0, void 0, function () {
    var roomsArr, roomsMap;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, firebase_service_1.FirebaseService.loadRooms()];
            case 1:
                roomsArr = _a.sent();
                roomsMap = new Map();
                roomsArr.forEach(function (r) { return roomsMap.set(r.id, r); });
                return [2 /*return*/, roomsMap];
        }
    });
}); };
start();
