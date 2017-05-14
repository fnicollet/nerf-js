var express = require('express');
var router = express.Router();
var _ = require('underscore');

var jsonfile = require('jsonfile');
var say = require('say');
const myo = require('../myo-input/index');

var file = './data-nerf.json';
var obj = {};

router.get('/', function(req, res, next) {
    res.render('game');
});

router.get('/load', function(req, res, next) {
    jsonfile.readFile(file, function(err, obj) {
        const game = obj.games[obj.games.length - 1];
        res.send(game);
    });
});

router.get('/start', function (req, res) {
    jsonfile.readFile(file, function (err, obj) {
        if (!obj) {
            obj = [];
        }
        obj.games = obj.games || [];
        const game = {
            id: obj.games.length + 1,
            player1Score: 0,
            player2Score: 0,
            player1Drawn: false,
            player2Drawn: false,
        };
        obj.games.push(game);
        try {
            myo.start((player) => {
                console.log(player, 'drawn');
                game[`${player}Drawn`] = true;
                jsonfile.writeFile(file, obj);
            });
        } catch (e){
            console.log("myo fail")
        }
        jsonfile.writeFile(file, obj, _ => res.send(game));
    });
});

router.get('/stop', function(req, res) {
    var player = parseInt(req.query.player);
    jsonfile.readFile(file, function(err, obj) {
        var game = obj.games[obj.games.length - 1];
        var player1Finished = game.hasOwnProperty("player1");
        var player2Finished = game.hasOwnProperty("player2");
        // éviter les doubles saisies
        if (player == 1 && player1Finished){
            res.send(game);
            return;
        }
        if (player == 2 && player2Finished){
            res.send(game);
            return;
        }
        var timestamp = +new Date();
        game["player" + player] = timestamp;
        var isGameStarted = game.hasOwnProperty("start");
        var diff = "";
        if (!isGameStarted){
            res.send(game);
            return;
        }
        var difference = timestamp - game.start;
        var secondsDifference = Math.floor(difference/1000);

        if (secondsDifference == 0){
            diff = "00";
        }else if (secondsDifference < 10){
            diff = "0" + secondsDifference;
        } else {
            diff = "" + secondsDifference;
        }
        diff += ":" + ("" + difference % 1000).substr(0, 2);

        game["player" + player + "Diff"] = diff;

        player1Finished = game.hasOwnProperty("player1");
        player2Finished = game.hasOwnProperty("player2");
        if (player1Finished && !player2Finished){
            game.player1Score = game.player1Score + 1;
        }
        if (!player1Finished && player2Finished){
            game.player2Score = game.player2Score + 1;
        }
        try {
            myo.stop();
        } catch (e){
            console.log("myo failed to stop");
        }
        jsonfile.writeFile(file, obj, function (err) {
            res.send(game);
        });
    });
});
router.get('/nextRound', function(req, res, next) {
    jsonfile.readFile(file, function(err, obj) {
        var game = obj.games[obj.games.length - 1];
        delete game.player1;
        delete game.player2;
        delete game.player1Diff;
        delete game.player2Diff;
        delete game.start;
        game.player1Drawn = false;
        game.player2Drawn = false;
        jsonfile.writeFile(file, obj, function (err) {
            res.send(game);
        });
    });
});

router.get('/say', function(req, res, next) {
    var message = req.query.message;
    say.speak(message, undefined, 1.0);
    res.send("ok");
});

router.get('/all', function(req, res, next) {
    jsonfile.readFile(file, function(err, obj) {
        res.send(obj);
    });
});

router.get('/reset', function(req, res, next) {
    jsonfile.writeFile(file, {}, function (err) {
        res.send("reset ok");
    });
});

router.get('/init', (req, res) => {
    jsonfile.readFile(file, (err, obj) => {
        const game = obj.games[obj.games.length - 1];
        const timestamp = +new Date();
        game.start = timestamp;
        if(game.player1Drawn) {
            game.player1Diff = "Trop tôt!";
            game.player1Score = game.player1Score - 1;
            console.log('>>>>>>>>>> Player 1 cheated!!!');
        }
        if(game.player2Drawn) {
            game.player2Diff = "Trop tôt!";
            game.player2Score = game.player2Score - 1;
            console.log('>>>>>>>>>> Player 2 cheated');
        }
        try {
            myo.vibrate();
        } catch (e){
            console.log("myo failed to vibrate");
        }
        jsonfile.writeFile(file, obj, _ => res.send(game));
    });
});

module.exports = router;