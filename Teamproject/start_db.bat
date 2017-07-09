@echo off

echo Start MongoDB SFBroker
start MongoDB/Server/3.4/bin/mongod --dbpath SFBroker/data --port 27017

echo Start MongoDB Broker
start MongoDB/Server/3.4/bin/mongod --dbpath Broker/data --port 27018