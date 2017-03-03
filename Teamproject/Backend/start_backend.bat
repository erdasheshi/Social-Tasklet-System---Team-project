@echo off

cd Broker
echo Prepare Broker
call npm install

cd ../Buyer
echo Prepare Buyer/Seller
call npm install

cd ../SFBroker
echo Prepare SFBroker
call npm install

cd ..
echo Start MongoDB
start MongoDB/Server/3.4/bin/mongod --dbpath SFBroker/data
echo Start SFBroker
start node SFBroker/app.js
echo Start Broker
start node Broker/server.js
echo Start Buyer
start node Buyer/server.js
