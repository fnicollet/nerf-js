const Myo = require('myo');
const ws  = require('ws');
//const Launcher = require('../launcher');

// False quand un seul myo est connecté, true quand on a au moins 2 myo.
var notLaunched;

/**
 * Reset la position du myon en paramètre
 * @param myMyo
 */
var resetPosition = function(myMyo) {
    myMyo.zeroOrientation();
};

/**
 * Fais vibrer le myo en paramètre
 * @param myMyo
 */
var vibrate = function(myMyo) {
    myMyo.vibrate();
};

/**
 * callback appelé quand un myo est connecté
 */
var connected = function() {

    var myMyo = this;

    console.log('Connected !', myMyo.name);

    myMyo.on('battery_level', function(val) {
        console.log('Batterie', myMyo.name, val, '%');
    });

    myMyo.requestBatteryLevel();

};

var onOrientation = function(data) {
    var myMyo = this;

    var valueX = (data.x * 10).toFixed(3),
        valueY = (data.y * 10).toFixed(3),
        valueZ = (data.z * 10).toFixed(3),
        valueW = (data.w * 10).toFixed(3);

    if(valueX < 1 && valueX > -1 &&
        valueY < 1 && valueY > -1 &&
        valueZ < 1 && valueZ > -1 &&
        valueW < 2 && valueW > 0) {
        myMyo.nerf.callback();
    }
};

/**
 * Commence a surveiller si le myo en paramètre est bien tourné vers le bas
 * appelle le callback quand le joueur lève son flingue
 * @param myMyo
 */
var startCounter = function(myMyo, callback) {

    // enrichi l'objet myo avec le callback
    myMyo.nerf          = myMyo.nerf || {};
    myMyo.nerf.callback = callback;

    myMyo.on('orientation', onOrientation);
};

/**
 * Commence a surveiller si le myo en paramètre est bien tourné vers le bas
 * appelle le callback quand le joueur lève son flingue
 * @param myMyo
 */
var stopCounter = function(myMyo) {
    myMyo.off('orientation', onOrientation);
};

/**
 * Lance la connexion Myo
 * @param callback retourne les myos connectés
 */
var init = function(callback) {

    Myo.connect('com.nerfjs.myo', ws);

    Myo.on('fist', function() {
        this.vibrate();
        console.log('FISTED');
    });

    // log la batterie et console log pour signaler que le device est connecté
    Myo.on('connected', connected);

    Myo.on('connected', function() {

        // deux joueur connectés
        if(Myo.myos.length > 1 && notLaunched) {
            notLaunched = true;

            callback(Myo.myos);
        }
    });
};

init();

module.exports = {
    init         : init,
    resetPosition: resetPosition,
    startCounter : startCounter,
    stopCounter  : stopCounter,
    vibrate      : vibrate
};
