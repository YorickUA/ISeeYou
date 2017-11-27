# ISeeYou
## AWS Rekognition experiment.
### General operation principle
This program is used for AWS Rekognition service testing. First of all, user need to create the AWS Rekognition collection from the images, previously uploaded to the AWS S3 bucket. After this, user can perform the comparison between images stored in the collection and any image he wants. 

How to start:
1. git clone
2. Set the AWS keys by running aws configure
3. Run 
```
npm install
```
4. Run 
```
./node_modules/.bin/webpack
```
5. Run 
```
node index
```
6. Plug in the webcam
7. Open http://localhost:3000/

How to use:
1. Add persons and their images into the database.
2. Push the scan button when camera facing person you want to check against database images.
