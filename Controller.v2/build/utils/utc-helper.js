"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toDateTime = exports.getDisplayDate = exports.getDate = exports.getTimezoneTime = exports.getTime = void 0;
var getTime = function (date) {
    if (date) {
        var hours = date.getUTCHours().toString();
        var min = date.getUTCMinutes().toString();
        return formatTime(hours, min);
    }
    else {
        return '';
    }
};
exports.getTime = getTime;
var getTimezoneTime = function (date) {
    if (date) {
        var hours = date.getHours().toString();
        var min = date.getMinutes().toString();
        return formatTime(hours, min);
    }
    else {
        return '';
    }
};
exports.getTimezoneTime = getTimezoneTime;
var formatTime = function (h, m) {
    if (h.length === 1) {
        h = '0' + h;
    }
    if (m.length === 1) {
        m = '0' + m;
    }
    return h + ":" + m;
};
var getDate = function (date) {
    return dateToString(date, false);
};
exports.getDate = getDate;
var getDisplayDate = function (date) {
    return dateToString(date, true);
};
exports.getDisplayDate = getDisplayDate;
var dateToString = function (date, display) {
    if (date) {
        var year = date.getUTCFullYear();
        var month = (date.getUTCMonth() + (display ? 1 : 0)).toString();
        var day = date.getUTCDate().toString();
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
var toDateTime = function (secs) {
    var t = new Date(secs * 1000); // Epoch
    return t;
};
exports.toDateTime = toDateTime;
