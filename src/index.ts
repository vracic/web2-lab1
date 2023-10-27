import express from 'express';
import path from 'path'
import { auth, requiresAuth } from 'express-openid-connect'; 
import https from 'https';
import fs from 'fs';
import { getPlayers, getGames, getGame, updateGameScore, updatePlayerPoints, getComp, getLastComp} from './db';
import { roundRobin } from './roundRobin';
const bodyParser = require('body-parser')

import dotenv from 'dotenv'
dotenv.config()

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set('view engine', 'pug');

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

const externalUrl = process.env.RENDER_EXTERNAL_URL;
const port = externalUrl && process.env.PORT ? parseInt(process.env.PORT) : 4080;

const config = { 
  authRequired : false,
  idpLogout : true,
  secret: process.env.SECRET,
  baseURL: externalUrl || `https://localhost:${port}`,
  clientID: process.env.CLIENT_ID,
  issuerBaseURL: 'https://dev-zlgp6k7zj86tzane.us.auth0.com',
  clientSecret: process.env.CLIENT_SECRET,
  authorizationParams: {
    response_type: 'code' ,
   },
};

if (externalUrl) {
  const hostname = '0.0.0.0'; //ne 127.0.0.1
  app.listen(port, hostname, () => {
  console.log(`Server locally running at http://${hostname}:${port}/ and from
  outside on ${externalUrl}`);
  });
  }
  else {
    https.createServer({
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.cert')
    }, app)
    .listen(port, function () {
    console.log(`Server running at https://localhost:${port}/`);
  });
}

// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(auth(config));

app.get('/',  function (req, res) {
  let username : string | undefined;
  if (req.oidc.isAuthenticated()) {
    username = req.oidc.user?.name ?? req.oidc.user?.sub;
  }
  res.render('index', {username});
});

app.get('/private', requiresAuth(), function (req, res) {       
  const user = JSON.stringify(req.oidc.user);      
  res.render('private', {user}); 
});

app.get('/profile', requiresAuth(), (req, res) => {
  res.send(JSON.stringify(req.oidc.user));
});

app.get('/define', requiresAuth(), (req, res) => {
  res.render('define');
})

app.post('/newComp', requiresAuth(), (req, res) => {
  let username : string | undefined;
  if (req.oidc.isAuthenticated()) {
    username = req.oidc.user?.name ?? req.oidc.user?.sub;
  }
  let players : string[] | undefined = req.body.players.split(',');
  let score : number[] | undefined = req.body.scoring.split('/');
  if (!players || !score || players?.length < 4 || players?.length > 8 || score?.length != 3) {
    let errMsg = "Uneseni podaci nisu valjani";
    res.render('define', {errMsg});
  }
  else{
    roundRobin(players, score, username).then(() => {
      getLastComp().then((comp_id) => {
        var url: string = 'https://web2-lab1-xkpt.onrender.com/comp/' + comp_id;
        res.render('index', {username, url});
      })
    });
  }
})

app.get('/comp/:id', (req, res) => {
  getPlayers(req.params['id']).then((players) => {
    getGames(req.params['id']).then((games) => {
      let username : string | undefined;
      if (req.oidc.isAuthenticated()) {
        username = req.oidc.user?.name ?? req.oidc.user?.sub;
      }
      var url: string = 'https://web2-lab1-xkpt.onrender.com/comp/' + req.params['id'];
      res.render('compInfo', {players, games, username, url});
    });
  });
})

app.post('/updateResult/:id', requiresAuth(), (req, res) => {
  var score: string = req.body['score'];
  var game_id: number = parseInt(req.body['game_id']);
  
  getGame(game_id).then((game) => {
    var comp_id = game.comp_id;
    getComp(comp_id).then((comp) => {
      var win: number = comp.scoring[0];
      var lose: number = comp.scoring[1];
      var draw: number = comp.scoring[2];
      var score_p1_new = parseInt(score.split('-')[0]);
      var score_p2_new = parseInt(score.split('-')[1]);
      if ((score_p1_new !== 0 && Number.isNaN(score_p1_new)) || (score_p2_new !== 0 && Number.isNaN(score_p2_new)) || score === game.score) {   // invalid input or same as old
        res.redirect(302, '/comp/' + comp_id);
      }
      else {      // podaci su valjani i treba ih pohranit u bazu
        var winner_new: string | undefined;
        var winner_old: string | undefined;
        if (score_p1_new > score_p2_new) winner_new = "p1";
        if (score_p1_new < score_p2_new) winner_new = "p2";
        if (score_p1_new === score_p2_new) winner_new = "x";

        if (game.score !== ''){                                     // vec postoji rezultat u bazi i treba ga promijeniti
          var score_p1_old = parseInt(game.score.split('-')[0]);
          var score_p2_old = parseInt(game.score.split('-')[1]);

          if (score_p1_old > score_p2_old) winner_old = "p1";
          if (score_p1_old < score_p2_old) winner_old = "p2";
          if (score_p1_old === score_p2_old) winner_old = "x";

          if (winner_new && (winner_new !== winner_old)) {          // unesen rezultat je valjan
            if (winner_new === "x" && winner_old === "p1") {
                    // iz 1 u x
              updatePlayerPoints(comp_id, game.player1_id, -win + draw);
              updatePlayerPoints(comp_id, game.player2_id, -lose + draw);
            }
            if (winner_new === "x" && winner_old === "p2") {
                    //iz 2 u x
              updatePlayerPoints(comp_id, game.player1_id, -lose + draw);
              updatePlayerPoints(comp_id, game.player2_id, -win + draw);
            }
            if (winner_new === "p1" && winner_old === "p2") {
                    // iz 2 u 1
              updatePlayerPoints(comp_id, game.player1_id, -lose + win);
              updatePlayerPoints(comp_id, game.player2_id, -win + lose);
            }
            if (winner_new === "p1" && winner_old === "x") {
                    //iz x u 1
              updatePlayerPoints(comp_id, game.player1_id, -draw + win);
              updatePlayerPoints(comp_id, game.player2_id, -draw + lose);
            }
            if (winner_new === "p2" && winner_old === "p1") {
                    // iz 1 u 2
              updatePlayerPoints(comp_id, game.player1_id, -win + lose);
              updatePlayerPoints(comp_id, game.player2_id, -lose + win);
            }
            if (winner_new === "p2" && winner_old === "x") {
                //iz x u 2
              updatePlayerPoints(comp_id, game.player1_id, -draw + lose);
              updatePlayerPoints(comp_id, game.player2_id, -draw + win);
            }
          }
          else {                                                          // brisanje rezultata
            if (winner_old === "x") {
              updatePlayerPoints(comp_id, game.player1_id, -draw);
              updatePlayerPoints(comp_id, game.player2_id, -draw);
            }
            if (winner_old === "p1") {
              updatePlayerPoints(comp_id, game.player1_id, -win);
              updatePlayerPoints(comp_id, game.player2_id, -lose);
            }
            if (winner_old === "p2") {
              updatePlayerPoints(comp_id, game.player1_id, -lose);
              updatePlayerPoints(comp_id, game.player2_id, -win);
            }
          }
        }
        else {      // ne postoji rezultat u bazi i potrebno je pohraniti uneseni
          if (winner_new == "p1") {
            updatePlayerPoints(comp_id, game.player1_id, win);
            updatePlayerPoints(comp_id, game.player2_id, lose);
          }
          if (winner_new == "p2") {
            updatePlayerPoints(comp_id, game.player1_id, lose);
            updatePlayerPoints(comp_id, game.player2_id, win);
          }
          if (winner_new == "x" && score !== "") {
            updatePlayerPoints(comp_id, game.player1_id, draw);
            updatePlayerPoints(comp_id, game.player2_id, draw);
          }
        }
          //update game score
        updateGameScore(game_id, score).then(() => res.redirect(302, '/comp/' + comp_id));
      }
    });
  });
})

//const server = app.listen(port, () => console.log(`Example app listening on port ${port}!`));

// server.keepAliveTimeout = 120 * 1000;
// server.headersTimeout = 120 * 1000;

// https.createServer({
//   key: fs.readFileSync('server.key'),
//   cert: fs.readFileSync('server.cert')
//   }, app)
//   .listen(port, function () {
//   console.log(`Server running at https://localhost:${port}/`);
//   });
  