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
All steps should be done under root user.
Steps:
1. Install nodejs (tested on v6.11.4 and v9.2.0)
2. Install and compile opencv https://docs.opencv.org/2.4/doc/tutorials/introduction/linux_install/linux_install.html#linux-installation. Consider the increasing of swap size to speed up compilation. (Might take a lot of time)
3. In /etc/ld.so.conf.d/opencv.conf add the path to lib folder in compiled opencv folder.
4. Install aws-cli and set up aws keys by running
```
aws configure
```
5. Clone RHVoice from https://github.com/Olga-Yakovleva/RHVoice
6. Run
```
apt-get update &&\
apt-get install -y\
    python3-pip\
    gcc\
    scons\
    libao4\
    locales\
    libao-dev\
    supervisor\
    pkg-config
```
7. Run in RHVoice folder
```
scons && scons install && ldconfig
```
8. Install omxplayer
```
apt-get install omxplayer
```
9. In raspberry folder of this repository run
```
npm install --unsafe-perm
```
10. Run
```
node index
```
in raspberry folder to start monitoring. The output goes from PIN 16 (GPIO 23).

How to get video stream from pi:
1. Start monitoring on raspberry pi.
2. Add the device address (and port) in app/config.js on your pc to receive stream from this device.
3. On pc, run 
```
node index
```
4. Go to http://localhost:3000/Dashboard.
