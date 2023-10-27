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
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
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
exports.roundRobin = void 0;
var db_1 = require("./db");
function roundRobin(players, scoring, username) {
    return __awaiter(this, void 0, void 0, function () {
        var compm, bye, comp_id, i_1, i, c, j;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    //var comp: String;
                    if (players.length == 4) {
                        compm = [[[1, 4], [2, 3]],
                            [[2, 1], [3, 4]],
                            [[1, 3], [4, 2]]];
                        //comp = "1,4,2,3,2,1,3,4,1,3,4,2";
                    }
                    else {
                        if (players.length === 5 || players.length === 6) {
                            compm = [[[1, 6], [2, 5], [3, 4]],
                                [[2, 1], [3, 6], [4, 5]],
                                [[1, 3], [4, 2], [5, 6]],
                                [[4, 1], [5, 3], [6, 2]],
                                [[1, 5], [6, 4], [2, 3]]];
                            //comp = "1,6,2,5,3,4,2,1,3,6,4,5,1,3,4,2,5,6,4,1,5,3,6,2,1,5,6,4,2,3";
                        }
                        else {
                            compm = [[[1, 8], [2, 7], [3, 6], [4, 5]],
                                [[2, 1], [3, 8], [4, 7], [5, 6]],
                                [[1, 3], [4, 2], [5, 8], [6, 7]],
                                [[4, 1], [5, 3], [6, 2], [7, 8]],
                                [[1, 5], [6, 4], [7, 3], [8, 2]],
                                [[6, 1], [7, 5], [8, 4], [2, 3]],
                                [[1, 7], [8, 6], [2, 5], [3, 4]]];
                            //comp = "1,8,2,7,3,6,4,5,2,1,3,8,4,7,5,6,1,3,4,2,5,8,6,7,4,1,5,3,6,2,7,8,1,5,6,4,7,3,8,2,6,1,7,5,8,4,2,3,1,7,8,6,2,5,3,4";
                        }
                    }
                    bye = false;
                    if (players.length === 5 || players.length === 7)
                        bye = true;
                    return [4 /*yield*/, (0, db_1.createComp)(compm, username, scoring, bye)];
                case 1:
                    _a.sent();
                    comp_id = 0;
                    return [4 /*yield*/, (0, db_1.getLastComp)().then(function (val) { return comp_id = val; })];
                case 2:
                    _a.sent();
                    i_1 = 0;
                    _a.label = 3;
                case 3:
                    if (!(i_1 < players.length)) return [3 /*break*/, 6];
                    return [4 /*yield*/, (0, db_1.createPlayer)(comp_id, i_1 + 1, players[i_1])];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5:
                    i_1++;
                    return [3 /*break*/, 3];
                case 6:
                    for (i = 0; i < compm.length; i++) {
                        c = compm[i];
                        for (j = 0; j < c.length; j++) {
                            if ((players.length !== 5 || (c[j][0] !== 6 && c[j][1] !== 6)) && (players.length !== 7 || (c[j][0] !== 8 && c[j][1] !== 8)))
                                (0, db_1.createGame)(comp_id, c[j][0], c[j][1], i + 1);
                        }
                    }
                    return [2 /*return*/];
            }
        });
    });
}
exports.roundRobin = roundRobin;
