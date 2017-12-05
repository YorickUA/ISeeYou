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

dynamodb = new AWS.DynamoDB();
rekognition = new AWS.Rekognition();

// initialize stream camera
camera = new cv.VideoCapture(0);
camera.setWidth(CAM_WIDTH);
camera.setHeight(CAM_HEIGHT);

app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, DELETE, PUT, OPTIONS');
    next();
});

http.listen(3003, function(){
    console.log('listening on *:3003');
});

app.post('/open', (req, res) => {
    openDoor();
    res.end();
});

scanner();

broadcastVideo();

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
                face = faces[0];

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
            } else {
               setTimeout(scanner,SCAN_DELAY);
           }
        })
    } else {
        setTimeout(scanner,SCAN_DELAY);
    }
}

function broadcastVideo(){
    camera.read((err, im) => {
        if (err) throw err;
        checkImage = im;
        io.emit('frame', { buffer: im.toBuffer() });
        setTimeout(broadcastVideo, VIDEO_DELAY)
    })
}


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