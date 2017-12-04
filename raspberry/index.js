var cv = require('opencv'),
    AWS = require('aws-sdk'),
    gpio = require('rpi-gpio'),
    app = require('express')(),
    http = require('http').Server(app),
    io = require('socket.io')(http),
    OUTPUT_PIN = 16,
    FACE_MATCH_THRESHOLD = 80,
    OPEN_LOCK_DELAY = 10000,
    DEFAULT_LOOP_DELAY = 1000/24,
    CAM_HEIGHT = 320,
    CAM_WIDTH  = 240,
    openDoorTimer,
    camera,
    comparing = false,
    counter = 0;

AWS.config.update({region:'eu-west-1'});
AWS.config.setPromisesDependency(null);

dynamodb = new AWS.DynamoDB();
rekognition = new AWS.Rekognition();

// initialize camera
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

scanner()

function scanner(){
    camera.read((err, im) => {
       // console.log("scan");
        if (err) throw err;
        if (!comparing) {
            im.detectObject('./node_modules/opencv/data/haarcascade_frontalface_alt2.xml', {}, (err, faces) => {
                var params;
                if (err) {
                    throw err
                }

                for (var i = 0; i < faces.length; i++) {
                    comparing = true;
                    counter++;
                    console.log("got face ", counter);
                    params = {
                        CollectionId: 'employees',
                        Image: {
                            Bytes: im.toBuffer()
                        },
                        FaceMatchThreshold: FACE_MATCH_THRESHOLD,
                        MaxFaces: 1
                    };
                    face = faces[i];

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

                            comparing = false;
                        })
                        .catch(err => {

                            comparing = false;
                            console.log(err)
                        })
                }

            })
        }
        setTimeout(scanner, DEFAULT_LOOP_DELAY);
        io.emit('frame', { buffer: im.toBuffer() });
    });
}

function openDoor(){
    gpio.setup(OUTPUT_PIN, gpio.DIR_OUT, err => {
        if (err) {
            console.log(err);
        } else {
            gpio.write(OUTPUT_PIN, true, err => {
                if (err){
                    console.log(err);
                } else {
                    console.log('Written to pin');
                    if (openDoorTimer){
                        clearTimeout(openDoorTimer);
                        openDoorTimer = setTimeout(() =>  gpio.write(OUTPUT_PIN, false), OPEN_LOCK_DELAY)
                    } else {
                        openDoorTimer = setTimeout(() =>  gpio.write(OUTPUT_PIN, false), OPEN_LOCK_DELAY)
                    }
                }
            });
        }
    })
}