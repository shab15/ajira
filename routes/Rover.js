const express = require('express');
const router = express.Router();
var Environment = require('./Environment');

//Memory Store
var roverMemory = {};
var roverMovementCount = 0;


//Rover Configure API
router.post('/configure', function (req, res, next) {
    console.log('Rover configure API called');

    try {
        roverMemory = req.body;
        res.json(roverMemory);
    } catch (e) {
        res.status(500);
        res.json({ Error: e });
    }
});

//Rover Movement API
router.post('/move', function (req, res, next) {
    console.log('Rover movement API called');

    var directionAllowed = ["up", "down", "right", "left"];
    var environmentData = Environment.getEnvironmentConfiguration();
    try {
        if (!isEmptyObject(environmentData) && !environmentData.storm && directionAllowed.includes(req.body.direction) && !isEmptyObject(roverMemory)) {

            //Battery Update
            roverMovementCount++;
            roverMemory["initial-battery"]--;
            if (roverMovementCount >= 10 && roverMemory["initial-battery"] < 10) {
                roverMovementCount = 0;
                roverMemory["initial-battery"] = 10;
            }
            //Rover Inventory Update
            updateTerrainByRoverMovement();
            res.json(roverMemory);
        } else if (!directionAllowed.includes(req.body.direction)) {
            res.status(428);
            res.json({ "message": "Can move only within mapped area" });
        } else if (environmentData.storm) {
            res.status(428);
            res.json({ "message": "Cannot move during a storm" });
        } else {
            res.status(428);
            res.json({ "message": "Memory Error" });
        }
    } catch (e) {
        res.status(500);
        res.json({ Error: e });
    }
});

//Rover Status API
router.get('/status', function (req, res, next) {
    console.log('Rover status API called');

    try {
        var environmentData = Environment.getEnvironmentConfiguration();
        if (!isEmptyObject(roverMemory) && !isEmptyObject(environmentData)) {
            environmentData.terrain = getTerrainByRoverMovement();
            delete environmentData["area-map"];
            var roverStatusObj = {
                location: roverMemory["deploy-point"],
                battery: roverMemory["initial-battery"],
                inventory: roverMemory.inventory,
                environment: environmentData
            };
            res.json(roverStatusObj);
        } else {
            res.status(428);
            res.json({ "message": "Memory Error" });
        }
    } catch (e) {
        res.status(500);
        res.json({ Error: e });
    }
});

var i = 0, j = 0, terrainData=""; 
function updateTerrainByRoverMovement() {

    try {
        var environmentData = Environment.getEnvironmentConfiguration();
        if (!isEmptyObject(environmentData)) {
            var areaMapLength = environmentData["area-map"].length;
            if (i >= areaMapLength) {
                i = 0; j = 0;
            }
            var rowSize = environmentData["area-map"][i].length;
            if (j >= rowSize) {
                i++; j = 0;
            }
            terrainData = environmentData["area-map"][i][j];
            j++;
            updateRoverInventory(terrainData);
            return terrainData;
        } else {
            return null;
        }
    } catch (e) {
        i = 0; j = 0;
        updateTerrainByRoverMovement();
    }
}

function getTerrainByRoverMovement() {
    if(roverMemory.inventory.length == 0){
        terrainData= "dirt";
    }
    return terrainData;
}

function updateRoverInventory(terrain) {
    if(terrain== "dirt"){
       var stormSheid= [
            {
            "type": "storm-shield",
            "quantity": 1,
            "priority": 1
            }
       ];
       roverMemory.inventory=[];
       roverMemory.inventory.push(stormSheid);
    }else if(roverMemory.inventory.length == 0){
        var waterSample= [
            {
                "type": "water-sample",
                "qty": 2,
                "priority": 2                
            }
       ];
       roverMemory.inventory.push(waterSample);
    }
}

function getRoverConfiguration() {
    return roverMemory;
}

function isEmptyObject(obj) {
    return !Object.keys(obj).length;
}

module.exports = router;
module.exports.getRoverConfiguration = getRoverConfiguration;