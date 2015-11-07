#!/bin/bash
MONGO_URI=$(heroku config | grep MONGOLAB_URI | sed 's/.*mongodb:\/\///')

MONGO_USER=$(echo $MONGO_URI | awk -F':' '{print $1}')
MONGO_PASS=$(echo $MONGO_URI | awk -F':' '{print $2}' | awk -F'@' '{print $1}')
MONGO_HOST=$(echo $MONGO_URI | awk -F':' '{print $2}' | awk -F'@' '{print $2}')
MONGO_PORT=$(echo $MONGO_URI | awk -F':' '{print $3}' | awk -F'/' '{print $1}')
MONGO_DB=$(echo $MONGO_URI | awk -F':' '{print $3}' | awk -F'/' '{print $2}')

mongo $MONGO_HOST:$MONGO_PORT/$MONGO_DB -u $MONGO_USER -p $MONGO_PASS
