@echo off

cd Broker
echo Prepare Broker
call npm install

cd ../Client
echo Prepare Client/Seller
call npm install

cd ../SFBroker
echo Prepare SFBroker
call npm install

cd ../SFBroker_DirectAccess
echo Prepare SFBroker_DirectAccess
call npm install

cd ..
echo Start MongoDB
start MongoDB/Server/3.4/bin/mongod --dbpath SFBroker/data
echo Start SFBroker
start node SFBroker/app.js
echo Start Broker
start node Broker/server.js
echo Start Client
start node Client/server.js albrinkm

echo Open Client URL
start http://127.0.0.1:8080/

echo Open Broker URL
start http://127.0.0.1:8003/