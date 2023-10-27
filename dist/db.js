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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePlayerPoints = exports.updateGameScore = exports.getGame = exports.getGames = exports.getPlayers = exports.getComp = exports.getLastComp = exports.createGame = exports.createPlayer = exports.createComp = void 0;
var pg_1 = require("pg");
var dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
var pool = new pg_1.Pool({
    user: process.env.user,
    host: process.env.host,
    database: 'web2_lab1_63uh',
    password: process.env.password,
    port: 5432,
    ssl: true
});
function createComp(comp, user, scoring, bye) {
    if (user === void 0) { user = "user"; }
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, pool.query('insert into competitions values (default, $1, $2, $3, $4)', [JSON.stringify(comp), user, scoring, bye])];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.createComp = createComp;
function createPlayer(comp_id, id_in_comp, username) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, pool.query('insert into players values (default, $1, $2, 0, $3)', [comp_id, id_in_comp, username])];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.createPlayer = createPlayer;
function createGame(comp_id, player1_id, player2_id, round) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, pool.query('insert into games values (default, $1, $2, $3, $4, $5)', [comp_id, player1_id, player2_id, round, ''])];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.createGame = createGame;
function getLastComp() {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, pool.query('select comp_id from competitions order by comp_id desc limit 1')];
                case 1:
                    result = _b.sent();
                    return [4 /*yield*/, ((_a = result === null || result === void 0 ? void 0 : result.rows[0]) === null || _a === void 0 ? void 0 : _a.comp_id)];
                case 2: return [2 /*return*/, _b.sent()];
            }
        });
    });
}
exports.getLastComp = getLastComp;
function getComp(comp_id) {
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, pool.query('select * from competitions where comp_id = $1', [comp_id])];
                case 1:
                    result = _a.sent();
                    return [4 /*yield*/, (result === null || result === void 0 ? void 0 : result.rows[0])];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
exports.getComp = getComp;
function getPlayers(comp_id) {
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, pool.query('select username, points from players where comp_id = $1 order by points desc', [comp_id])];
                case 1:
                    result = _a.sent();
                    return [2 /*return*/, result === null || result === void 0 ? void 0 : result.rows];
            }
        });
    });
}
exports.getPlayers = getPlayers;
function getGames(comp_id) {
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, pool.query('select g.game_id, g.round, g.score, p1.username p1, p2.username p2 from games g join players p1 on g.player1_id = p1.id_in_comp and g.comp_id = p1.comp_id join players p2 on g.player2_id = p2.id_in_comp and g.comp_id = p2.comp_id where g.comp_id = $1 order by g.round, g.game_id', [comp_id])];
                case 1:
                    result = _a.sent();
                    return [2 /*return*/, result === null || result === void 0 ? void 0 : result.rows];
            }
        });
    });
}
exports.getGames = getGames;
function getGame(game_id) {
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, pool.query('select * from games where game_id = $1', [game_id])];
                case 1:
                    result = _a.sent();
                    return [4 /*yield*/, (result === null || result === void 0 ? void 0 : result.rows[0])];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
exports.getGame = getGame;
function updateGameScore(game_id, score) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, pool.query('update games set score = $1 where game_id = $2', [score, game_id])];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.updateGameScore = updateGameScore;
function updatePlayerPoints(comp_id, player_id, points) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, pool.query('update players set points = points + $1 where comp_id = $2 and id_in_comp = $3', [points, comp_id, player_id])];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.updatePlayerPoints = updatePlayerPoints;
