var express = require('express');
var router = express.Router();
const myo = require('../myo-input/index');

router.get('/calibrate/:player', (req, res) => myo.resetPosition(req.params.player));

module.exports = router;