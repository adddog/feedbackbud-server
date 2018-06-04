#!/usr/bin/env python
# -*- coding: utf-8 -*-
#
# Use text editor to edit the script and type in valid Instagram username/password

import subprocess

from InstagramAPI import InstagramAPI

USERNAME = 'samradical'
PASSWORD = 'dourden123'
PUBLISH_TO_LIVE_FEED = False
SEND_NOTIFICATIONS = False

api = InstagramAPI(USERNAME, PASSWORD, debug=False)
assert api.login()

# first you have to create a broadcast - you will receive a broadcast id and an upload url here
assert api.createBroadcast()
broadcast_id = api.LastJson['broadcast_id']
upload_url = api.LastJson['upload_url']

# we now start a boradcast - it will now appear in the live-feed of users
assert api.startBroadcast(broadcast_id, sendNotification=SEND_NOTIFICATIONS)
print str(upload_url.replace(':443', ':80', ).replace('rtmps://', 'rtmp://'))
