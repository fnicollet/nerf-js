const Myo = require('myo');
const ws = require('ws');

const player1 = `Yann Lombard's Myo`; // Bare myo
const player2 = 'My Myo'; // Myo with FH sticker

/**
 * Reset la position du myon en paramètre
 * @param myMyo
 */
const resetPosition = function (player) {
    Myo.myos.forEach(myo => {
        const name = player === 'player1' ? player1 : player2;
        if (myo.name === name) {
            console.log(`Reset position for ${player} - ${name}`);
            myo.zeroOrientation();
        }
    });
};

/**
 * Fais vibrer le myo en paramètre
 */
const vibrate = () => Myo.myos.forEach(myo => myo.vibrate());

/**
 * callback appelé quand un myo est connecté
 */
const connected = function () {

    const myMyo = this;

    console.log('Connected !', myMyo.name);

    myMyo.on('battery_level', function (val) {
        console.log('Batterie', myMyo.name, val, '%');
    });

    myMyo.requestBatteryLevel();
};

const onOrientation = function (data) {
    const myMyo = this;

    const valueX = (data.x * 10).toFixed(3),
        valueY = (data.y * 10).toFixed(3),
        valueZ = (data.z * 10).toFixed(3),
        valueW = (data.w).toFixed(3);

    if (valueX < 1 && valueX > -1 &&
        valueY < 1 && valueY > -1 &&
        valueZ < 1 && valueZ > -1 &&
        valueW < 2 && valueW > 0) {
        console.log('draw!');
        // myMyo.nerf.callback(this.name === player1 ? 'player1' : 'player2');
    }
};

/**
 * Commence a surveiller si le myo en paramètre est bien tourné vers le bas
 * appelle le callback quand le joueur lève son flingue
 * @param myMyo
 */
const start = function (callback) {

    // enrichi l'objet myo avec le callback
    Myo.myos.forEach(myo => {
        myo.nerf = myo.nerf || {};
        myo.nerf.callback = callback;

        myo.on('orientation', onOrientation);
    });
};

/**
 * Commence a surveiller si le myo en paramètre est bien tourné vers le bas
 * appelle le callback quand le joueur lève son flingue
 * @param myMyo
 */
const stop = function () {
    Myo.myos.forEach(myo => {
        myo.off('orientation', onOrientation);
    });
};

Myo.connect('com.nerfjs.myo', ws);

Myo.on('fist', function () {
    this.vibrate();
    console.log('FISTED');
});

// log la batterie et console log pour signaler que le device est connecté
Myo.on('connected', connected);

module.exports = {
    resetPosition,
    start,
    stop,
    vibrate
};
