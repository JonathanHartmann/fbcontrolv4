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
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventService = void 0;
var EventService = /** @class */ (function () {
    function EventService() {
    }
    EventService.getEnhancedEvents = function (events, roomsMap) {
        return __awaiter(this, void 0, void 0, function () {
            var eventsRoom, eventsEnh;
            return __generator(this, function (_a) {
                eventsRoom = events.map(function (e) {
                    var room = roomsMap.get(e.roomId);
                    var startsIn = 0;
                    var endedIn = 0;
                    return { event: e, startsIn: startsIn, endedIn: endedIn, room: room };
                });
                eventsEnh = EventService.updateTimes(eventsRoom);
                return [2 /*return*/, eventsEnh];
            });
        });
    };
    EventService.updateTimes = function (events) {
        var _this = this;
        return events.map(function (e) {
            var startsIn = Math.round(((_this.getUTCDateFromTimestamp(e.event.start).getTime() - (new Date()).getTime()) / 60000) * 100) / 100;
            var endedIn = Math.round(((_this.getUTCDateFromTimestamp(e.event.end).getTime() - (new Date()).getTime()) / 60000) * 100) / 100;
            return __assign(__assign({}, e), { startsIn: startsIn, endedIn: endedIn });
        }).sort(function (a, b) {
            if (a.startsIn > b.startsIn) {
                return 1;
            }
            else if (a.startsIn < b.startsIn) {
                return -1;
            }
            else {
                return 0;
            }
        });
    };
    EventService.checkTimes = function (events, roomsMap) {
        var _this = this;
        var _a, _b, _c;
        var fritzRoomId = process.env.ROOM_FRITZ_ID;
        var floorRoom = Array.from(roomsMap.values()).find(function (r) { return r.fritzId === fritzRoomId; });
        var actions = [];
        var heatUpRooms = [];
        var coolDownRooms = [];
        events.sort(function (a, b) {
            if (a.event.start > b.event.start) {
                return 1;
            }
            else if (a.event.start < b.event.start) {
                return -1;
            }
            else {
                return 0;
            }
        })
            .forEach(function (e) {
            var roomTempTime = e.room && e.room.tempTime ? e.room.tempTime : Number(process.env.FALLBACK_TEMP_THRESHOLD);
            if (e.room && e.startsIn < roomTempTime && e.endedIn > 0 && e.room.tempTime !== 0) {
                actions.push({ type: 'heat', event: e });
            }
            else if (e.room && e.endedIn < 0 && e.endedIn > -5 && e.room.tempTime !== 0) {
                actions.push({ type: 'cool', event: e });
            }
        });
        console.log('events:', events);
        console.log(actions);
        var actionPerRoom = [];
        actions.reverse().forEach(function (action) { return __awaiter(_this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                if (action.event.room && !actionPerRoom.includes(action.event.room.id)) {
                    actionPerRoom.push(action.event.room.id);
                    if (action.type === 'heat' && !((_a = roomsMap.get(action.event.room.id)) === null || _a === void 0 ? void 0 : _a.heated)) {
                        roomsMap.set(action.event.room.id, __assign(__assign({}, action.event.room), { heated: true, cooled: false }));
                        heatUpRooms.push({ room: action.event.room, event: action.event.event });
                    }
                    else if (action.type === 'cool' && !((_b = roomsMap.get(action.event.room.id)) === null || _b === void 0 ? void 0 : _b.cooled)) {
                        roomsMap.set(action.event.room.id, __assign(__assign({}, action.event.room), { heated: false, cooled: true }));
                        coolDownRooms.push({ room: action.event.room, event: action.event.event });
                    }
                }
                return [2 /*return*/];
            });
        }); });
        if (floorRoom) {
            var heatedRooms = Array.from(roomsMap.values()).filter(function (r) { return r.heated; });
            var shouldFloorBeHeated = !((_a = roomsMap.get(floorRoom.id)) === null || _a === void 0 ? void 0 : _a.heated) && heatedRooms.length > 0;
            var shouldFloorBeCooled = ((_b = roomsMap.get(floorRoom.id)) === null || _b === void 0 ? void 0 : _b.heated) && !((_c = roomsMap.get(floorRoom.id)) === null || _c === void 0 ? void 0 : _c.cooled) && heatedRooms.length === 1;
            if (shouldFloorBeHeated && floorRoom.fritzId !== '') {
                roomsMap.set(floorRoom.id, __assign(__assign({}, floorRoom), { heated: true, cooled: false }));
                heatUpRooms.push({ room: floorRoom, event: undefined });
            }
            else if (shouldFloorBeCooled) {
                roomsMap.set(floorRoom.id, __assign(__assign({}, floorRoom), { heated: false, cooled: true }));
                coolDownRooms.push({ room: floorRoom, event: undefined });
                for (var _i = 0, _d = Array.from(roomsMap.values()); _i < _d.length; _i++) {
                    var room = _d[_i];
                    coolDownRooms.push({ room: room, event: undefined });
                }
            }
        }
        return { heatUpRooms: heatUpRooms, coolDownRooms: coolDownRooms };
    };
    EventService.getUTCDateFromTimestamp = function (timestamp) {
        var _a = this.getDate(timestamp.toDate()).split('-').map(function (s) { return Number(s); }), year = _a[0], month = _a[1], day = _a[2];
        var _b = this.getTime(timestamp.toDate()).split(':').map(function (s) { return Number(s); }), hours = _b[0], minutes = _b[1];
        var date = new Date(year, month, day, hours, minutes);
        return date;
    };
    EventService.getTime = function (date) {
        if (date) {
            var hours = date.getUTCHours().toString();
            var min = date.getUTCMinutes().toString();
            if (hours.length === 1) {
                hours = '0' + hours;
            }
            if (min.length === 1) {
                min = '0' + min;
            }
            return hours + ":" + min;
        }
        else {
            return '';
        }
    };
    EventService.getDate = function (date, addDays) {
        if (addDays === void 0) { addDays = 0; }
        if (date) {
            var year = date.getUTCFullYear();
            var month = (date.getUTCMonth()).toString();
            date.setDate(date.getUTCDate() + addDays);
            var day = date.getDate().toString();
            if (month.length === 1) {
                month = '0' + month;
            }
            if (day.length === 1) {
                day = '0' + day;
            }
            return year + "-" + month + "-" + day;
        }
        else {
            return '';
        }
    };
    return EventService;
}());
exports.EventService = EventService;
