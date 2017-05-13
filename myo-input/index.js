
const Myo = require('myo');
const ws = require('ws');

var myMyo;

var init = function(callback) {

};

var start = function(callback) {

    Myo.connect('com.stolksdorf.myAwesomeApp', ws);

    Myo.on('fist', function(){
        this.vibrate();
    });

    Myo.on('connected', function(){
        console.log('connected!', this.id);

        myMyo = this;

        myMyo.on('battery_level', function(val){
            console.log('Much power', val, '%');
        });

        myMyo.requestBatteryLevel();

    });
};

module.exports = {
    init: init,
    start: start
};

start();
