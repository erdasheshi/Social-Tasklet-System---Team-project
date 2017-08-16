@echo off

cd Broker
echo Prepare Broker
call npm install

cd ../SFBroker
echo Prepare SFBroker
call npm install

cd ..
echo Start MongoDB
start MongoDB/Server/3.4/bin/mongod --dbpath SFBroker/data --port 27017



echo Start MongoDB Broker
start MongoDB/Server/3.4/bin/mongod --dbpath Broker/data --port 27018


echo Start SFBroker
start node SFBroker/app.js
echo Start Broker
start node Broker/server.js