# SocialTasklets
Repository for the Teamproject Social Distributed Systems (SDS)

Server IP: 46.101.198.127

## Starting the Teamproject with Docker on your local machine
The Teamproject consists of multiple modules that are contained in docker containers.
To test the app locally you need to perform the following steps.

Prerequisite: Installation of docker and docker-compose

1. Navigate into the Teamproject directory `cd Teamproject`
2. Build the docker images `docker-compose build`
3. Run the containers `docker-compose up -d`
4. Run `docker ps` to get the port mapping

## Starting the Teamproject with Docker on our Digital Ocean Server once you are logged-in

cd SocialTasklets
git pull
cd Teamproject 
docker-compose build
docker-compose up -d
