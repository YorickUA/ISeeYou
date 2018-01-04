#!/bin/bash

sudo apt-get install python-pip python-dev build-essential python-opencv
sudo pip install boto3
sudo pip install awscli
sudo modprobe bcm2835-v4l2
aws configure