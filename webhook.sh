#!/bin/bash
read -p "Server URL: " SERVERURL
read -p "Bot Token: " TOKEN

curl -X POST -d "url=$SERVERURL" https://api.telegram.org/bot$TOKEN/setWebhook
