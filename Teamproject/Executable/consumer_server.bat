@echo off

cd Buyer
echo Prepare Buyer/Seller
call npm install

echo Start Buyer
start node server.js albrinkm

cd ..
start java -jar Tasklet1.jar