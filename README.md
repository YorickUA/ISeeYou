# ISeeYou
## AWS Rekognition experiment
### General operation principle
This program is used for AWS Rekognition service testing. First of all, user need to create the AWS Rekognition collection from the images, previously uploaded to the AWS S3 bucket. After this, user can perform the comparison between images stored in the collection and any image he wants.

How to start:
1. git clone
2. Set the AWS keys by running
```
aws configure
```
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

## Installation on raspberry pi
Steps:
1. Install nodejs (tested on v6.11.4 and v9.2.0)
2. Install and compile opencv https://docs.opencv.org/2.4/doc/tutorials/introduction/linux_install/linux_install.html#linux-installation. Consider the increasing of swap size to speed up compilation. (Might take a lot of time)
3. In /etc/ld.so.conf.d/opencv.conf add the path to lib folder in compiled opencv folder.
4. Install aws-cli and set up aws keys by running
```
aws configure
```
4. In raspberry folder of this repository run
```
npm install
```
Migth be a permition issue with opencv, if this happens run
```
npm install --unsafe-perm
```
5. Run
```
node index
```
in raspberry folder to start monitoring.