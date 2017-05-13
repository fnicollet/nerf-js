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
    if (!req.query.id){
        res.send("Impossible de trouver la partie '" + req.query.id + "'", 404);
    }
    var id = parseInt(req.query.id);
    jsonfile.readFile(file, function(err, obj) {
        var game = _.findWhere(obj.games, {id: id});
        if (!game){
            //res.send("Impossible de trouver la partie '" + id + "'", 404);
            return;
        }
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
                game[`${player}Drawn`].drawn = true;
                jsonfile.writeFile(file, obj, _ => res.send(game));
            });
        } catch (e){
            console.log("myo fail")
        }
        jsonfile.writeFile(file, obj, _ => res.send(game));
    });
});

router.get('/stop', function(req, res, next) {
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
        console.log(game);
        var timestamp = +new Date();
        game["player" + player] = timestamp;
        var difference = timestamp - game.start;
        var secondsDifference = Math.floor(difference/1000);
        var diff = 0;
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
            game["player1Score"] = game.hasOwnProperty("player1Score") ? game.player1Score + 1 : 1;
        }
        if (!player1Finished && player2Finished){
            game["player2Score"] = game.hasOwnProperty("player2Score") ? game.player2Score + 1 : 1;
        }
        myo.stop();
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
        var timestamp = +new Date();
        game.start = timestamp;
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
    const id = parseInt(req.query.id);
    jsonfile.readFile(file, (err, obj) => {
        var game = _.findWhere(obj.games, {id: id});
        game.start = +new Date();
        if(game.player1Drawn) {
            console.log('>>>>>>>>>> Player 1 cheated!!!');
        }
        if(game.player2Drawn) {
            console.log('>>>>>>>>>> Player 2 cheated');
        }
        try {
            myo.vibrate();
        } catch (e){
            console.log("myo fail 2");
        }
        jsonfile.writeFile(file, obj, _ => res.send(game));
    });
});

module.exports = router;