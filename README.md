# SocialTasklets
Repository for the Teamproject Social Distributed Systems (SDS)

We provide a social and financial overlay for [TASKLETS](https://becker.bwl.uni-mannheim.de/de/research/tasklets/) and therby enable device owner around the world to contribute computational resources and benefit from available computational resources in the tasklet world.

## Starting the Teamproject with Docker on your local machine
The Teamproject consists of multiple modules that are contained in docker containers.
To test the app locally you need to perform the following steps.

Prerequisite: Installation of docker and docker-compose

1. Navigate into the Teamproject directory `cd Teamproject`
2. Build the docker images `docker-compose build`
3. Run the containers `docker-compose up -d`
4. Run `docker ps` to get the port mapping
- Database: 27017:27017
- SFBroker: 8001:8001
- Broker: 8003:8003
- Frontend: 4200:80
5. Refresh project each time you made changes `docker-compose up -d --build`
6. Once you are done coding do: `docker-compose down`

## Starting the Teamproject with Docker on our Digital Ocean Server once you are logged-in

1. ssh -i .ssh/XXX root@46.101.198.127 (MAC)
2. cd SocialTasklets
3. git pull
4. cd Teamproject 
5. docker-compose build
6. docker-compose up -d
7. docker ps
