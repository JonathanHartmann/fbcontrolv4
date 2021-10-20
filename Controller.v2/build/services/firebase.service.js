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
exports.FirebaseService = void 0;
var firebase_1 = require("../config/firebase");
var firebase_admin_1 = require("firebase-admin");
var FirebaseService = /** @class */ (function () {
    function FirebaseService() {
    }
    FirebaseService.loadEvents = function () {
        return __awaiter(this, void 0, void 0, function () {
            var startDate, endDate, startTimestamp, endTimestamp, eventSnap, events;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        startDate = new Date();
                        startDate.setHours(startDate.getHours() - 2);
                        endDate = new Date();
                        endDate.setHours(24);
                        startTimestamp = firebase_admin_1.firestore.Timestamp.fromDate(startDate);
                        endTimestamp = firebase_admin_1.firestore.Timestamp.fromDate(endDate);
                        return [4 /*yield*/, firebase_1.firestore.collection('events')
                                .where('start', '>', startTimestamp)
                                .where('start', '<', endTimestamp)
                                .get()];
                    case 1:
                        eventSnap = _a.sent();
                        events = FirebaseService.getDataFromSnapshot(eventSnap);
                        console.log('Nr events:', events.length);
                        return [2 /*return*/, events];
                }
            });
        });
    };
    FirebaseService.loadRooms = function () {
        return __awaiter(this, void 0, void 0, function () {
            var roomSnap, rooms;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, firebase_1.firestore.collection('rooms').get()];
                    case 1:
                        roomSnap = _a.sent();
                        rooms = FirebaseService.getDataFromSnapshot(roomSnap);
                        console.log('Request Rooms');
                        return [2 /*return*/, rooms];
                }
            });
        });
    };
    FirebaseService.appendEndlessEvent = function (allEvents, seriesId) {
        return __awaiter(this, void 0, void 0, function () {
            var eventSeries, lastEvent, nextEvent, validRoom, valid;
            return __generator(this, function (_a) {
                eventSeries = allEvents.filter(function (e) { return e.seriesId = seriesId; }).sort(function (a, b) {
                    if (a.start > b.start) {
                        return -1;
                    }
                    else if (a.start < b.start) {
                        return 1;
                    }
                    else {
                        return 0;
                    }
                });
                lastEvent = eventSeries[0];
                if (lastEvent.seriesId && lastEvent.seriesNr) {
                    nextEvent = FirebaseService.eventNextWeek(lastEvent, lastEvent.seriesNr + 1, lastEvent.seriesId);
                    validRoom = FirebaseService.checkRoomValidity(nextEvent, allEvents);
                    valid = nextEvent.seriesDuringHoliday ? true : FirebaseService.checkValidity(nextEvent, allEvents);
                    if (valid && validRoom) {
                        console.log('--- Create new endless Event!');
                        FirebaseService.saveEvent(nextEvent);
                    }
                }
                return [2 /*return*/];
            });
        });
    };
    FirebaseService.getDataFromSnapshot = function (snapshot) {
        return snapshot.docs.map(function (value) {
            return __assign(__assign({}, value.data()), { id: value.id });
        });
    };
    FirebaseService.eventNextWeek = function (event, seriesNr, seriesId) {
        var newEvent = __assign(__assign({}, event), { start: firebase_admin_1.firestore.Timestamp.fromDate(new Date(event.start.toDate().getTime() + 7 * 24 * 60 * 60 * 1000)), end: firebase_admin_1.firestore.Timestamp.fromDate(new Date(event.end.toDate().getTime() + 7 * 24 * 60 * 60 * 1000)), seriesId: seriesId, seriesNr: seriesNr });
        return newEvent;
    };
    FirebaseService.checkValidity = function (event, events) {
        var validity = true;
        var backgroundEvents = events.filter(function (e) { return e.background; });
        backgroundEvents.forEach(function (backEvent) {
            if (event.start.toDate() >= backEvent.start.toDate() && event.start.toDate() <= backEvent.end.toDate() ||
                event.end.toDate() >= backEvent.start.toDate() && event.end.toDate() <= backEvent.end.toDate()) {
                validity = false;
            }
        });
        return validity;
    };
    FirebaseService.updateRoom = function (room) {
        return __awaiter(this, void 0, void 0, function () {
            var eventsColl, updated;
            return __generator(this, function (_a) {
                eventsColl = firebase_1.firestore.collection('rooms');
                updated = eventsColl.doc(room.id).update(room);
                return [2 /*return*/];
            });
        });
    };
    FirebaseService.checkRoomValidity = function (event, events) {
        var validity = true;
        var sameRoomEvents = events.filter(function (e) { return (e.roomId === event.roomId) && (e.id !== event.id); });
        sameRoomEvents.forEach(function (roomEvent) {
            if (event.start.toDate() >= roomEvent.start.toDate() && event.start.toDate() <= roomEvent.end.toDate() ||
                event.end.toDate() >= roomEvent.start.toDate() && event.end.toDate() <= roomEvent.end.toDate()) {
                validity = false;
            }
        });
        return validity;
    };
    FirebaseService.saveEvent = function (event) {
        return __awaiter(this, void 0, void 0, function () {
            var eventsColl;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        eventsColl = firebase_1.firestore.collection('events');
                        return [4 /*yield*/, eventsColl.add(__assign({}, event))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return FirebaseService;
}());
exports.FirebaseService = FirebaseService;
