"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SIDService = void 0;
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
                var sid = data; // TODO entschluesseln!
                cb(err, sid);
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
    return SIDService;
}());
exports.SIDService = SIDService;
