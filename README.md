# Mood-O-Meter

# Introduction
This project serves as an increment over the previous 'FeedMach' application that I, along with my team members, designed during the Persistent Technothon.

# Client side frameworks
##1) Google Face API
An API which I've used to detect the prominent face in the image, and crop it out. I've also used this API to determine the smiling probability of the person in the image. You may find the github page here - https://github.com/googlesamples/android-vision

##2) Volley
Volley (https://github.com/mcxiaoke/android-volley) is a high-performance, asynchronous networking library that Google recently took over. It's robust architecture saves you from having to create tedious AsyncTasks. Also, it has pre-built support for JSON.

##3) ACRA
ACRA (https://github.com/ACRA/acra) is an excellent crash reporting API, which integrates seamlessly in the application, and lets you upload crash reports/exceptions/unusual behaviors in your application to your server as a form, json, and even supports crash reporting via e-mail.


# Server side frameworks
##1) Caffe
Caffe (https://github.com/BVLC/caffe) is a fast, open-source, easy-to-learn framework for deep learning. Caffe, albeit being built in C & C++, provides excellent wrappers for Python. My main neural network is a caffemodel. You may find the caffemodel I've used (RGB) here - https://gist.github.com/GilLevi/54aee1b8b0397721aa4b

##2) Flask
Flask is a great way to get your server up and running in a jiffy. Flask has inbuilt response support, which makes API creation a walk in the park. I've used Flask for listening to the incoming POST requests from the ACRA crash logs as well as the Android data, and also for sending the respective responses back

##3) MongoDB
MongoDB is one of the best unstructured 'document stores' out there. I chose to use MongoDB because of its simplicity, and its flexibility. Also, since almost all the data handling takes place in the JSON format, MongoDB is the best bet for data storage. I've used MongoDB to store crash logs from ACRA as well as the transmitted Android data

# Project Flow:
1) User clicks 'Open Camera'

2) Camera click user's photo

3) Face is detected (if any), and is cropped. A toast is displayed, showing the smiling probability

4) On clicking one of the three emojis below, a POST network request is created, and a connection is established with the server

5) A pre-trained sentiment classification model (built on Caffe) is hosted up on our network. This takes an input of the image sent upstream, and returns the raw output via JSON

6) By overriding Volley's onResponseReceived(), we get the incoming JSON data, initialize an intent, load the received data as extras, and start the intent

7) The aforementioned intent links to another activity, which simply parses the output, and displays the final percentage
