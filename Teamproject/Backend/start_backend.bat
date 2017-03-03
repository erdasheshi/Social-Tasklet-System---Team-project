@echo off

cd Broker
echo Prepare Broker
call npm install

cd ../Buyer
echo Prepare Buyer/Seller
call npm install


start MongoDB/Server/3.4/bin/mongod --dbpath SFBroker/data
start node SFBroker/app.js
start node Broker/server.js
start node Buyer/server.js
