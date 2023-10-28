"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var path_1 = __importDefault(require("path"));
var express_openid_connect_1 = require("express-openid-connect");
var https_1 = __importDefault(require("https"));
var fs_1 = __importDefault(require("fs"));
var db_1 = require("./db");
var roundRobin_1 = require("./roundRobin");
var bodyParser = require('body-parser');
var dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
var app = (0, express_1.default)();
app.set("views", path_1.default.join(__dirname, "views"));
app.set('view engine', 'pug');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
var externalUrl = process.env.RENDER_EXTERNAL_URL;
var port = externalUrl && process.env.PORT ? parseInt(process.env.PORT) : 4080;
var config = {
    authRequired: false,
    idpLogout: true,
    secret: process.env.SECRET,
    baseURL: externalUrl || "https://localhost:".concat(port),
    clientID: process.env.CLIENT_ID,
    issuerBaseURL: 'https://dev-zlgp6k7zj86tzane.us.auth0.com',
    clientSecret: process.env.CLIENT_SECRET,
    authorizationParams: {
        response_type: 'code',
    },
};
if (externalUrl) {
    var hostname_1 = '0.0.0.0'; //ne 127.0.0.1
    app.listen(port, hostname_1, function () {
        console.log("Server locally running at http://".concat(hostname_1, ":").concat(port, "/ and from\n  outside on ").concat(externalUrl));
    });
}
else {
    https_1.default.createServer({
        key: fs_1.default.readFileSync('server.key'),
        cert: fs_1.default.readFileSync('server.cert')
    }, app)
        .listen(port, function () {
        console.log("Server running at https://localhost:".concat(port, "/"));
    });
}
// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use((0, express_openid_connect_1.auth)(config));
app.get('/', function (req, res) {
    var _a, _b, _c;
    var username;
    if (req.oidc.isAuthenticated()) {
        username = (_b = (_a = req.oidc.user) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : (_c = req.oidc.user) === null || _c === void 0 ? void 0 : _c.sub;
    }
    res.render('index', { username: username });
});
app.get('/private', (0, express_openid_connect_1.requiresAuth)(), function (req, res) {
    var user = JSON.stringify(req.oidc.user);
    res.render('private', { user: user });
});
app.get('/profile', (0, express_openid_connect_1.requiresAuth)(), function (req, res) {
    res.send(JSON.stringify(req.oidc.user));
});
app.get('/define', (0, express_openid_connect_1.requiresAuth)(), function (req, res) {
    res.render('define');
});
app.post('/newComp', (0, express_openid_connect_1.requiresAuth)(), function (req, res) {
    var _a, _b, _c;
    var username;
    if (req.oidc.isAuthenticated()) {
        username = (_b = (_a = req.oidc.user) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : (_c = req.oidc.user) === null || _c === void 0 ? void 0 : _c.sub;
    }
    console.log(req.body.players);
    var players_string = req.body.players.replace('\n', ';');
    var players = players_string.split(';');
    var score = req.body.scoring.split('/');
    if (!players || !score || (players === null || players === void 0 ? void 0 : players.length) < 4 || (players === null || players === void 0 ? void 0 : players.length) > 8 || (score === null || score === void 0 ? void 0 : score.length) != 3) {
        var errMsg = "Uneseni podaci nisu valjani";
        res.render('define', { errMsg: errMsg });
    }
    else {
        (0, roundRobin_1.roundRobin)(players, score, username).then(function () {
            (0, db_1.getLastComp)().then(function (comp_id) {
                var url = 'https://web2-lab1-xkpt.onrender.com/comp/' + comp_id;
                res.render('index', { username: username, url: url });
            });
        });
    }
});
app.get('/comp/:id', function (req, res) {
    (0, db_1.getPlayers)(req.params['id']).then(function (players) {
        (0, db_1.getGames)(req.params['id']).then(function (games) {
            var _a, _b, _c;
            var username;
            if (req.oidc.isAuthenticated()) {
                username = (_b = (_a = req.oidc.user) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : (_c = req.oidc.user) === null || _c === void 0 ? void 0 : _c.sub;
            }
            var url = 'https://web2-lab1-xkpt.onrender.com/comp/' + req.params['id'];
            res.render('compInfo', { players: players, games: games, username: username, url: url });
        });
    });
});
app.post('/updateResult/:id', (0, express_openid_connect_1.requiresAuth)(), function (req, res) {
    var score = req.body['score'];
    var game_id = parseInt(req.body['game_id']);
    (0, db_1.getGame)(game_id).then(function (game) {
        var comp_id = game.comp_id;
        (0, db_1.getComp)(comp_id).then(function (comp) {
            var win = comp.scoring[0];
            var lose = comp.scoring[1];
            var draw = comp.scoring[2];
            var score_p1_new = parseInt(score.split('-')[0]);
            var score_p2_new = parseInt(score.split('-')[1]);
            if (score !== "" && (Number.isNaN(score_p1_new) || Number.isNaN(score_p2_new) || score === game.score)) { // invalid input or same as old
                res.redirect(302, '/comp/' + comp_id);
            }
            else { // podaci su valjani i treba ih pohranit u bazu
                var winner_new;
                var winner_old;
                if (score_p1_new > score_p2_new)
                    winner_new = "p1";
                if (score_p1_new < score_p2_new)
                    winner_new = "p2";
                if (score_p1_new === score_p2_new)
                    winner_new = "x";
                if (game.score !== '') { // vec postoji rezultat u bazi i treba ga promijeniti
                    var score_p1_old = parseInt(game.score.split('-')[0]);
                    var score_p2_old = parseInt(game.score.split('-')[1]);
                    if (score_p1_old > score_p2_old)
                        winner_old = "p1";
                    if (score_p1_old < score_p2_old)
                        winner_old = "p2";
                    if (score_p1_old === score_p2_old)
                        winner_old = "x";
                    if (winner_new && (winner_new !== winner_old)) { // unesen rezultat je valjan
                        if (winner_new === "x" && winner_old === "p1") {
                            // iz 1 u x
                            (0, db_1.updatePlayerPoints)(comp_id, game.player1_id, -win + draw);
                            (0, db_1.updatePlayerPoints)(comp_id, game.player2_id, -lose + draw);
                        }
                        if (winner_new === "x" && winner_old === "p2") {
                            //iz 2 u x
                            (0, db_1.updatePlayerPoints)(comp_id, game.player1_id, -lose + draw);
                            (0, db_1.updatePlayerPoints)(comp_id, game.player2_id, -win + draw);
                        }
                        if (winner_new === "p1" && winner_old === "p2") {
                            // iz 2 u 1
                            (0, db_1.updatePlayerPoints)(comp_id, game.player1_id, -lose + win);
                            (0, db_1.updatePlayerPoints)(comp_id, game.player2_id, -win + lose);
                        }
                        if (winner_new === "p1" && winner_old === "x") {
                            //iz x u 1
                            (0, db_1.updatePlayerPoints)(comp_id, game.player1_id, -draw + win);
                            (0, db_1.updatePlayerPoints)(comp_id, game.player2_id, -draw + lose);
                        }
                        if (winner_new === "p2" && winner_old === "p1") {
                            // iz 1 u 2
                            (0, db_1.updatePlayerPoints)(comp_id, game.player1_id, -win + lose);
                            (0, db_1.updatePlayerPoints)(comp_id, game.player2_id, -lose + win);
                        }
                        if (winner_new === "p2" && winner_old === "x") {
                            //iz x u 2
                            (0, db_1.updatePlayerPoints)(comp_id, game.player1_id, -draw + lose);
                            (0, db_1.updatePlayerPoints)(comp_id, game.player2_id, -draw + win);
                        }
                    }
                    else { // brisanje rezultata
                        if (winner_old === "x") {
                            (0, db_1.updatePlayerPoints)(comp_id, game.player1_id, -draw);
                            (0, db_1.updatePlayerPoints)(comp_id, game.player2_id, -draw);
                        }
                        if (winner_old === "p1") {
                            (0, db_1.updatePlayerPoints)(comp_id, game.player1_id, -win);
                            (0, db_1.updatePlayerPoints)(comp_id, game.player2_id, -lose);
                        }
                        if (winner_old === "p2") {
                            (0, db_1.updatePlayerPoints)(comp_id, game.player1_id, -lose);
                            (0, db_1.updatePlayerPoints)(comp_id, game.player2_id, -win);
                        }
                    }
                }
                else { // ne postoji rezultat u bazi i potrebno je pohraniti uneseni
                    if (winner_new == "p1") {
                        (0, db_1.updatePlayerPoints)(comp_id, game.player1_id, win);
                        (0, db_1.updatePlayerPoints)(comp_id, game.player2_id, lose);
                    }
                    if (winner_new == "p2") {
                        (0, db_1.updatePlayerPoints)(comp_id, game.player1_id, lose);
                        (0, db_1.updatePlayerPoints)(comp_id, game.player2_id, win);
                    }
                    if (winner_new == "x" && score !== "") {
                        (0, db_1.updatePlayerPoints)(comp_id, game.player1_id, draw);
                        (0, db_1.updatePlayerPoints)(comp_id, game.player2_id, draw);
                    }
                }
                (0, db_1.updateGameScore)(game_id, score).then(function () { return res.redirect(302, '/comp/' + comp_id); });
            }
        });
    });
});
