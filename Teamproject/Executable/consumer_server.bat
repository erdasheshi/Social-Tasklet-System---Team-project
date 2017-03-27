@echo off



cd ..
cd ../Buyer
echo Prepare Buyer/Seller
call npm install

echo Start Buyer
start node Buyer/server.js 8080

echo Start Seller
start node Buyer/server.js 8081

echo Open Seller URL
start http://127.0.0.1:8081/

echo Open Buyer URL
start http://127.0.0.1:8080/

start chkdsk Tasklet.jar

pause
exit