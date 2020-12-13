const express = require('express');
const router = express.Router();
var Rover = require('./Rover');

//Memory Store
var environmentMemory = {};

//Environment Configure API
router.post('/configure', function (req, res, next) {
    console.log('Environment configure API called');

    try {
        environmentMemory = req.body;
        res.json(environmentMemory);
    } catch (e) {
        res.status(500);
        res.json({ Error: e });
    }
});


//Environment update API
router.post('/', function (req, res, next) {
    console.log('Environment update API called');

    try {
        if (!isEmptyObject(environmentMemory)) {

            //Rover Config
            var roverConfigData = Rover.getRoverConfiguration();
            if (!isEmptyObject(roverConfigData)) {
                if (req.body["solar-flare"] != undefined && req.body["solar-flare"]) {
                    roverConfigData["initial-battery"] = 11;
                }
                if (req.body.storm != undefined && req.body.storm) {
                    roverConfigData.inventory = [];
                }
            }

            for (var environmentJsonKeyValue in environmentMemory) {
                if (req.body[environmentJsonKeyValue] != undefined && req.body[environmentJsonKeyValue] != null) {
                    environmentMemory[environmentJsonKeyValue] = req.body[environmentJsonKeyValue];
                }
            }
            res.json(environmentMemory);
        } else {
            res.status(428);
            res.json({ "message": "Memory Error" });
        }
    } catch (e) {
        res.status(500);
        res.json({ Error: e });
    }
});

//Environment get API
router.get('/get', function (req, res, next) {
    console.log('Environment get API called');

    res.json(environmentMemory);
});

function getEnvironmentConfiguration() {
    return Object.assign({}, environmentMemory);
}
module.exports.getEnvironmentConfiguration = getEnvironmentConfiguration;

function isEmptyObject(obj) {
    return !Object.keys(obj).length;
}

module.exports = router;