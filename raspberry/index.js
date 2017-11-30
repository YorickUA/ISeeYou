var cv = require('opencv'),
    AWS = require('aws-sdk'),
    gpio = require('rpi-gpio'),
    OUTPUT_PIN = 16,
    FACE_MATCH_THRESHOLD = 80,
    OPEN_LOCK_DELAY = 10000,
    openDoorTimer,
    camWidth,
    camHeight,
    camFps,
    camInterval,
    camera,
    counter;

AWS.config.update({region:'eu-west-1'});
AWS.config.setPromisesDependency(null);

dynamodb = new AWS.DynamoDB();
rekognition = new AWS.Rekognition();

// camera properties
camWidth = 320;
camHeight = 240;
camFps = 10;
camInterval = 10000 / camFps;
counter = 0;

// initialize camera
camera = new cv.VideoCapture(0);
camera.setWidth(camWidth);
camera.setHeight(camHeight);

setInterval(function() {
    camera.read(function(err, im) {
        console.log("scan");
        if (err) throw err;
        im.detectObject('./node_modules/opencv/data/haarcascade_frontalface_alt2.xml', {}, function(err, faces) {
            var params;
            if (err) throw err;
                for (var i = 0; i < faces.length; i++) {
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
                        .then(data =>{
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
                        .then(data =>{
                            console.log(data);
                            if(data){
                                openDoor();
                            }
                        })
                        .catch(err => console.log(err))
                }
            });
        });
    }, camInterval);

function openDoor(){
    gpio.setup(OUTPUT_PIN, gpio.DIR_OUT, function(err) {
        if (err) {
            console.log(err);
        } else {
            gpio.write(OUTPUT_PIN, true, function(err) {
                if (err){
                    console.log(err);
                } else {
                    console.log('Written to pin');
                    if (openDoorTimer){
                        clearTimeout(openDoorTimer);
                        openDoorTimer = setTimeout(gpio.destroy, OPEN_LOCK_DELAY);
                    } else {
                        openDoorTimer = setTimeout(gpio.destroy, OPEN_LOCK_DELAY);
                    }
                }
            });
        }
    })
}