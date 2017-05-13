var express = require('express');
var router = express.Router();
var _ = require('underscore');

var jsonfile = require('jsonfile');
var say = require('say');

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


router.get('/start', function(req, res, next) {
    jsonfile.readFile(file, function(err, obj) {
        if (!obj){
            obj = [];
        }
        obj.games = obj.games || [];
        var gameId = obj.games.length + 1;
        var timestamp = +new Date();
        var game = {
            id: gameId,
            start: timestamp
        };
        obj.games.push(game);
        jsonfile.writeFile(file, obj, function (err) {
            res.send(game);
        });
    });
});

router.get('/stop', function(req, res, next) {
    var player = parseInt(req.query.player);
    jsonfile.readFile(file, function(err, obj) {
        var game = obj.games[obj.games.length - 1];
        var timestamp = +new Date();
        game["player" + player] = timestamp;
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

module.exports = router;