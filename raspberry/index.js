var cv = require('opencv'),
    AWS = require('aws-sdk'),
    gpio = require('rpi-gpio'),
    app = require('express')(),
    http = require('http').Server(app),
    io = require('socket.io')(http),
    config = require('./raspConfig.js'),
    player = require('play-sound')(opts = {}),
    { exec } = require('child_process'),
    SCAN_DELAY = 1000/config.scanRate,
    VIDEO_DELAY = 1000/config.frameRate,
    openDoorTimer,
    greetingBlocker = true,
    camera,
    checkImage;


AWS.config.update({region:'eu-west-1'});
AWS.config.setPromisesDependency(null);

// initialize AWS services
dynamodb = new AWS.DynamoDB();
rekognition = new AWS.Rekognition();
iot = new AWS.IotData({endpoint: "a172ulhf1fm9p3.iot.eu-west-1.amazonaws.com"});

// initialize stream camera
camera = new cv.VideoCapture(config.videoSource);
camera.setWidth(config.camWidth);
camera.setHeight(config.camHeight);

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
    console.log('open');
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
                    FaceMatchThreshold: config.faceMatchThreshold,
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
                iot.updateThingShadow({
                    thingName: "Recognizer",
                    payload: JSON.stringify(
                        {
                            state:
                            {
                                reported: {
                                    value: true
                                }
                            }
                        })
                }).promise();
                return dynamodb.getItem(params).promise()
            } else {
                iot.updateThingShadow({
                    thingName: "Recognizer",
                    payload: JSON.stringify(
                        {
                            state:
                            {
                                reported: {
                                    value: false
                                }
                            }
                        })
                }).promise();
                return false
            }
        })
        .then(data => {
            console.log(data);

            if (data) {
                playGreeting(data.Item.Name.S);
               // openDoor();
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

/**
 * Output greeting to speakers
 * @param person String person name
 */
function playGreeting(person){
    if (greetingBlocker) {
        exec('echo “' + config.greetingPhrase +',' + person + '” | RHVoice-test -p Anatol -o greeting.mp3', (err)=> {
            if (err instanceof Error)
                throw err;

            player.play('greeting.mp3', function (err) {
                if (err) throw err
            });

            greetingBlocker = false;
            setTimeout(() => greetingBlocker = true, config.greetingDelay)
        });
    }
}