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
        myo.start((player) => {
            game[`${player}Drawn`].drawn = true;
            jsonfile.writeFile(file, obj, _ => res.send(game));
        });
        jsonfile.writeFile(file, obj, _ => res.send(game));
    });
});

router.get('/stop', function(req, res, next) {
    var player = parseInt(req.query.player);
    jsonfile.readFile(file, function(err, obj) {
        var game = obj.games[obj.games.length - 1];
        var timestamp = +new Date();
        game["player" + player] = timestamp;
        myo.stop();
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
        let game = _.findWhere(obj.games, {id: id});
        game.start = +new Date();
        if(game.player1Drawn) {
            console.log('>>>>>>>>>> Player 1 cheated!!!');
        }
        if(game.player2Drawn) {
            console.log('>>>>>>>>>> Player 2 cheated');
        }
        myo.vibrate();
        jsonfile.writeFile(file, obj, _ => res.send(game));
    });
});

module.exports = router;