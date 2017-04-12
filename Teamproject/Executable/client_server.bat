@echo off

cd Client
echo Prepare Client
call npm install

echo Start Client
start node server.js %1

cd ..
start java -jar Tasklet.jar