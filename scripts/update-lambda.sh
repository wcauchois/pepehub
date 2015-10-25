#!/bin/bash
bash -c "cd resizer-lambda && zip -r ../CreateThumbnail.zip *"
aws lambda update-function-code --region us-east-1 --function-name CreateThumbnail --zip-file fileb://./CreateThumbnail.zip

