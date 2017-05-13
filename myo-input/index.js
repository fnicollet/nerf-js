const Myo      = require('myo');
const ws       = require('ws');
const Launcher = require('../launcher');

var myMyo;

var connected = function() {
    console.log('Connected !');

    myMyo = this;

    myMyo.on('battery_level', function(val) {
        console.log('Batterie', val, '%');
    });

    myMyo.requestBatteryLevel();

    myMyo.streamEMG(true);

    console.log('RESET TO ZERO : 2 sec');

    setTimeout(function() {
        console.log('RESET TO ZERO : 1 sec');
    }, 1000);

    var playerReady = true;

    setTimeout(function() {

        console.log('RESET TO ZERO !!!');

        myMyo.zeroOrientation();

        console.log('Position basse');

        setTimeout(function() {

            myMyo.on('orientation', function(data){

                var valueX = (data.x * 10).toFixed(3),
                    valueY = (data.y * 10).toFixed(3),
                    valueZ = (data.z * 10).toFixed(3),
                    valueW = (data.w * 10).toFixed(3);

                if() {
                    playerReady = false;
                }
            });

            // Jeu lancé
            Launcher.start(function() {

            });


        }, 3000);

    }, 2000);

};

var start = function() {

    Myo.connect('com.nerfjs.myo', ws);

    Myo.on('fist', function() {
        this.vibrate();
        console.log('FISTED');
        //Launcher.start();
    });

    Myo.on('nerfTrigger', function() {
        this.vibrate();
        console.log('TRIGGER');
        //Launcher.start();
    });

    Myo.on('connected', connected);
};

start();
