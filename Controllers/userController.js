
var express = require('express'),
    router = express.Router(),
    multer = require('multer'),
    AWS = require('aws-sdk'),
    fs =require('fs'),

    dynamodb,
    upload,
    rekognition,
    S3,
    Storage;

    Storage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, "./Images");
    },
    filename: function(req, file, callback) {
        callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
    }
});


dynamodb = new AWS.DynamoDB();
rekognition = new AWS.Rekognition();
S3 = new AWS.S3();


upload = multer({storage: Storage});

module.exports = app => {
    app.use('/', router);
};

router.post('/employee', upload.single('file'), (req, res) =>{
    var name = req.body.name,
        imageName;

    imageName = req.file.filename;
    fs.readFile(req.file.destination + '/' + imageName, (err, data) => {
        var params = {Bucket: 'elifemployees-1', Key: imageName, Body: data};
        S3.upload(params, {}).promise()
            .then(() => {
                var params = {
                    CollectionId: 'employees',
                    Image: {
                        S3Object: {
                            Bucket: 'elifemployees-1',
                            Name: imageName,
                        }
                    },
                    DetectionAttributes: [
                        "DEFAULT"
                    ],
                };
                return rekognition.indexFaces(params).promise()
            })
            .then( data => {
                var  params = {
                     Item: {
                        "FaceId": {
                            S: data.FaceRecords[0].Face.FaceId
                        },
                        "Name": {
                            S: name
                        },
                    },
                    TableName: "Employees"
                };

               return dynamodb.putItem(params).promise()

            } )
            .then(() => res.end())
            .catch( err => {
                console.log(err);
                res.status(500)
            })
    })
})

router.delete('/employee/:id', (req, res) => {
    var id = req.params.id;

    params = {
        CollectionId: 'employees',
        FaceIds: [ id ]
    };

    rekognition.deleteFaces(params).promise()
        .then( () =>{

            params = {
                Key: {
                    "FaceId": {
                        S: id
                    },
                },
                TableName: "Employees"
            };

            return dynamodb.deleteItem(params).promise()
        })
        .then(() => res.end())
        .catch( err => {
            console.log(err);
            res.status(500)
        })
})

router.post('/compareUsers', (req, res) =>{
    var image = req.body.image,
        buffer;

    image = image.slice(image.indexOf(',') + 1);
    buffer = new Buffer(image, 'base64');

    var params = {
        CollectionId: 'employees',
        Image: {
            Bytes: buffer
        },
        FaceMatchThreshold: 70,
        MaxFaces: 2
    };

    rekognition.searchFacesByImage(params).promise()
        .then(data =>{
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
        .then(data => res.send(data))
        .catch(err => console.log(err))
})

router.get('/employee', (req, res) =>{
    var params = {
        TableName: "Employees"
    }
    dynamodb.scan(params).promise()
        .then( data  => res.send(data))
        .catch(console.log)
})