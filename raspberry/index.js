var cv = require('opencv'),
    AWS = require('aws-sdk'),
    gpio = require('rpi-gpio'),
    app = require('express')(),
    http = require('http').Server(app),
    io = require('socket.io')(http),
    config = require('./raspConfig.js'),
    FACE_MATCH_THRESHOLD = 80,
    SCAN_DELAY = 1000/config.scanRate,
    VIDEO_DELAY = 1000/config.frameRate,
    CAM_HEIGHT = 320,
    CAM_WIDTH  = 240,
    openDoorTimer,
    camera,
    checkImage;


AWS.config.update({region:'eu-west-1'});
AWS.config.setPromisesDependency(null);

// initialize AWS services
dynamodb = new AWS.DynamoDB();
rekognition = new AWS.Rekognition();

// initialize stream camera
camera = new cv.VideoCapture(0);
camera.setWidth(CAM_WIDTH);
camera.setHeight(CAM_HEIGHT);

/**
 * Allow cross-origin request
 */
app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
});

http.listen(config.port, function(){
    console.log('listening on *:' + config.port);
});

/**
 * Route for door opening
 */
app.post('/open', (req, res) => {
    openDoor();
    res.end();
});

scanner();

broadcastVideo();

/**
 * Function detects face on image and performs face recognition
 * Note: this function can be run ONLY ONCE AT A TIME
 */
function scanner(){
    if (checkImage) {
        checkImage.detectObject('./node_modules/opencv/data/haarcascade_frontalface_alt2.xml', {}, (err, faces) => {
            var params;
            if (err) {
                throw err
            }

           if (faces.length) {
                console.log("got face");
                params = {
                    CollectionId: 'employees',
                    Image: {
                        Bytes: checkImage.toBuffer()
                    },
                    FaceMatchThreshold: FACE_MATCH_THRESHOLD,
                    MaxFaces: 1
                };
               recognize(params);
           } else {
               checkImage = "";
               setTimeout(scanner,SCAN_DELAY);
           }
        })
    } else {
        setTimeout(scanner,SCAN_DELAY);
    }
}

/**
 * Function for image broadcasting to the client
 */
function broadcastVideo(){
    camera.read((err, im) => {
        if (err) throw err;
        checkImage = im;
        io.emit('frame', { buffer: im.toBuffer() });
        setTimeout(broadcastVideo, VIDEO_DELAY)
    })
}

/**
 * Open door function
 */
function openDoor(){
    gpio.setup(config.outputPin, gpio.DIR_OUT, err => {
        if (err) {
            console.log(err);
        } else {
            gpio.write(config.outputPin, true, err => {
                if (err){
                    console.log(err);
                } else {
                    console.log('Written to pin');
                    if (openDoorTimer){
                        clearTimeout(openDoorTimer);
                        openDoorTimer = setTimeout(() =>  gpio.write(config.outputPin, false), config.openLockDelay)
                    } else {
                        openDoorTimer = setTimeout(() =>  gpio.write(config.outputPin, false), config.openLockDelay)
                    }
                }
            });
        }
    })
}

/**
 * Recognize face and open the door
 * @param params Object parameters for AWS Rekognition
 */
function recognize(params){
    rekognition.searchFacesByImage(params).promise()
        .then(data => {
            var params;
            if (data.FaceMatches.length) {
                params = {
                    Key: {
                        "FaceId": {
                            S: data.FaceMatches[0].Face.FaceId
                        }
                    },
                    TableName: "Employees"
                };

                return dynamodb.getItem(params).promise()
            } else {
                return false
            }
        })
        .then(data => {
            console.log(data);

            if (data) {
                openDoor();
            }
            checkImage = "";
            setTimeout(scanner,SCAN_DELAY);
        })
        .catch(err => {
            checkImage = "";
            setTimeout(scanner,SCAN_DELAY);
            console.log(err)
        })
}