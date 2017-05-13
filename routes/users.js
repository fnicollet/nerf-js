var express = require('express');
var router = express.Router();
var HID = require('node-hid');
var _ = require('underscore');

/* GET users listing. */
/*
 {
 "vendorId": 1578,
 "productId": 16641,
 "path": "\\\\?\\hid#vid_062a&pid_4101&mi_00#7&aa891b9&0&0000#{4d1e55b2-f16f-11cf-88cb-001111000030}",
 "manufacturer": "MOSART Semi.",
 "product": "2.4G Keyboard Mouse",
 "release": 33043,
 "interface": 0,
 "usagePage": 1,
 "usage": 6
 }
 */
router.get('/', function(req, res, next) {
    var keyboards = [];
    var devices = HID.devices();
    _.each(devices, function(device){
        var vendorId = device.vendorId;
        if (vendorId != 1578){
            return;
        }
        var usage = device.usage;
        if (usage != 6){
            return;
        }
        keyboards.push(device);
    });
    _.each(keyboards, function(keyboard){
        console.log("got device. opening:", keyboard.path);
        var device = null;
        try {
            device = new HID.HID(keyboard.path);
            //var device = new HID.HID(keyboard.vendorId,keyboard.productId);
            device.on("data", function(data) {
                console.log("input", data);
            });
        } catch (e){
            console.log(e);
        }

    });
    res.send(keyboards);
});

module.exports = router;
