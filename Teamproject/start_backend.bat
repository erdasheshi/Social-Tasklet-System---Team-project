@echo off

echo Start MongoDB
start MongoDB/Server/3.4/bin/mongod --dbpath SFBroker/data --port 27017

echo Start MongoDB Broker
start MongoDB/Server/3.4/bin/mongod --dbpath Broker/data --port 27018


cd Broker
echo Prepare Broker
call npm install

cd ../SFBroker
echo Prepare SFBroker
call npm install

cd ../Frontend
echo Prepare Frontend
call npm install

cd ..

echo Start SFBroker
start node SFBroker/app.js

echo Start Broker
start node Broker/server.js

echo Start Frontend
cd Frontend
start npm start

cd ..