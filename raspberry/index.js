var cv = require('opencv'),
    AWS = require('aws-sdk');

AWS.config.update({region:'eu-west-1'});
AWS.config.setPromisesDependency(null);

dynamodb = new AWS.DynamoDB();
rekognition = new AWS.Rekognition();

// camera properties
var camWidth = 320;
var camHeight = 240;
var camFps = 10;
var camInterval = 10000 / camFps;
var counter = 0;

// face detection properties
var rectColor = [0, 255, 0];
var rectThickness = 2;

// initialize camera
var camera = new cv.VideoCapture(0);
camera.setWidth(camWidth);
camera.setHeight(camHeight);


setInterval(function() {
    camera.read(function(err, im) {

        console.log("scan")
        if (err) throw err;
        im.detectObject('./node_modules/opencv/data/haarcascade_frontalface_alt2.xml', {}, function(err, faces) {
            var params;
            if (err) throw err;
            counter++;

                for (var i = 0; i < faces.length; i++) {
                    console.log("got face ", counter)
                    params = {
                        CollectionId: 'employees',
                        Image: {
                            Bytes: im.toBuffer()
                        },
                        FaceMatchThreshold: 70,
                        MaxFaces: 2
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
                        .then(data => console.log(data))
                        .catch(err => console.log(err))
                    //im.rectangle([face.x, face.y], [face.width, face.height], rectColor, rectThickness);
                    
                }
            });
        });
    }, camInterval);
