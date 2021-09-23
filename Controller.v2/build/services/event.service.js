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
        this.heatingUpRooms = new Map();
        this.coolRooms = new Map();
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
        return events.map(function (e) {
            var startsIn = Math.round(((e.event.start.toMillis() - Date.now()) / 60000) * 100) / 100;
            var endedIn = Math.round(((e.event.end.toMillis() - Date.now()) / 60000) * 100) / 100;
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
    EventService.prototype.checkTimes = function (events, beginCb, endCb) {
        var _this = this;
        var fritzRoomId = process.env.ROOM_FRIZTZ_ID;
        var fritzRoomName = process.env.ROOM_NAME;
        var floorRoom = {
            id: '123',
            title: fritzRoomName ? fritzRoomName : '',
            comfortTemp: 21,
            emptyTemp: 16,
            createdFrom: '',
            createdFromId: '',
            eventColor: '',
            fritzId: fritzRoomId ? fritzRoomId : ''
        };
        var actions = [];
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
            if (e.room && e.startsIn < roomTempTime && e.startsIn > 0) {
                actions.push({ type: 'heat', event: e });
            }
            else if (e.room && e.endedIn < 0 && e.endedIn > -5) {
                actions.push({ type: 'cool', event: e });
            }
        });
        var actionPerRoom = [];
        actions.reverse().forEach(function (action) {
            if (action.event.room && !actionPerRoom.includes(action.event.room.id)) {
                actionPerRoom.push(action.event.room.id);
                if (action.type === 'heat' && !_this.heatingUpRooms.has(action.event.room.id)) {
                    _this.heatingUpRooms.set(action.event.room.id, action.event.room);
                    _this.coolRooms.delete(action.event.room.id);
                    beginCb(action.event.room, action.event.event);
                }
                else if (action.type === 'cool' && !_this.coolRooms.has(action.event.room.id)) {
                    _this.heatingUpRooms.delete(action.event.room.id);
                    _this.coolRooms.set(action.event.room.id, action.event.room);
                    endCb(action.event.room, action.event.event);
                }
            }
        });
        var shouldFloorBeHeated = !this.heatingUpRooms.has(floorRoom.id) && this.heatingUpRooms.size > 0;
        var shouldFloorBeCooled = this.heatingUpRooms.has(floorRoom.id) && !this.coolRooms.has(floorRoom.id) && this.heatingUpRooms.size === 1;
        if (shouldFloorBeHeated && floorRoom.fritzId !== '') {
            this.heatingUpRooms.set(floorRoom.id, floorRoom);
            this.coolRooms.delete(floorRoom.id);
            beginCb(floorRoom, undefined);
        }
        else if (shouldFloorBeCooled) {
            this.heatingUpRooms.delete(floorRoom.id);
            this.coolRooms.set(floorRoom.id, floorRoom);
            endCb(floorRoom, undefined);
        }
    };
    return EventService;
}());
exports.EventService = EventService;
