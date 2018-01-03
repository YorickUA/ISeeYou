import boto3
import cv2
import time
import sys
#import RPi.GPIO as GPIO

#sudo modprobe bcm2835-v4l2

# Apply UTF8
reload(sys)
sys.setdefaultencoding('utf-8')


# Camera 0 is the integrated web cam on my netbook
camera_port = 0
capture_delay = 1
relay_pin = 11

# Create resources
camera = cv2.VideoCapture(camera_port)
detector = cv2.CascadeClassifier("face.xml")
rekognition = boto3.client('rekognition')
dynamodb = boto3.client('dynamodb')
#GPIO.setmode(GPIO.BOARD)
#GPIO.setup(relay_pin, GPIO.OUT)
#GPIO.output(relay_pin, True)


# Detect face using Haar cascade classifier
def detect_face(image):
	gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
	faces = detector.detectMultiScale(gray, scaleFactor=1.2, minNeighbors=5, minSize=(100, 100), flags=cv2.CASCADE_SCALE_IMAGE)
	return len(faces) > 0

# Recognize face using AWS
def recognize_face(image):
	response = rekognition.search_faces_by_image(
		CollectionId='employees',
		Image={ 'Bytes': bytearray(cv2.imencode('.png', image)[1]) },
		MaxFaces=1,
		FaceMatchThreshold=80)
	if (('FaceMatches' in response) and (len(response['FaceMatches']) > 0)):
		return True, response['FaceMatches'][0]['Face']['FaceId']
	return False, ''

# Get name by id by DynamoDB
def get_face_name(face_id):
	response = dynamodb.get_item(
		TableName='Employees',
		Key={ 'FaceId': {'S': face_id}})
	return response['Item']['Name']['S']

# Open door lock using Pi GPIO
#def open_door():
#	GPIO.output(relay_pin, False)
#	time.sleep(capture_delay)
#	GPIO.output(relay_pin, True)

# Good stuff is below
while True:
	print("Taking image...")
	retval, image = camera.read()

	if (detect_face(image) == True):
		print("Face detected")
		recognized, face_id = recognize_face(image)
		if (recognized):
			print("Face recognized, ID is: {}".format(face_id))
			name = get_face_name(face_id)
			print("Face recognized, Name is: {}".format(name))
			open_door()
			print("Door is open")

	time.sleep(capture_delay)

# Cleanup
del(camera)